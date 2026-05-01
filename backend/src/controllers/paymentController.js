const crypto = require('crypto');
const pool = require('../config/db');
const { applyAutomaticPenalties } = require('../services/automationService');
const { submitOrderRequest } = require('../services/pesapalService');
const { reconcilePendingPayments, verifyAndPersistPayment, verifyUntilSettled } = require('../services/paymentSettlementService');
const { isCustomerRole } = require('../utils/roles');

const buildPaymentReference = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const normalizeBillIds = ({ bill_id, bill_ids }) => {
  const rawIds = Array.isArray(bill_ids) ? bill_ids : bill_id ? [bill_id] : [];
  return [...new Set(rawIds.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0))];
};

const money = amount => Number(Number(amount || 0).toFixed(2));

exports.getPayments = async (req, res) => {
  try {
    await applyAutomaticPenalties();
    await reconcilePendingPayments();

    const [rows] = await pool.query(
      `SELECT p.*, c.customer_number, c.full_name AS customer_name, b.bill_number
       FROM payments p
       INNER JOIN customers c ON c.id = p.customer_id
       LEFT JOIN bills b ON b.id = p.bill_id
       ORDER BY COALESCE(p.payment_date, p.created_at) DESC, p.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      data: rows.map(row => ({
        ...row,
        bill_number: row.bill_id ? row.bill_number : 'Multiple bills',
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load payments.' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    await reconcilePendingPayments({ customerId: req.user.customer_id });

    const [rows] = await pool.query(
      `SELECT p.*, b.bill_number
       FROM payments p
       LEFT JOIN bills b ON b.id = p.bill_id
       WHERE p.customer_id = ?
       ORDER BY COALESCE(p.payment_date, p.created_at) DESC, p.created_at DESC`,
      [req.user.customer_id]
    );

    return res.status(200).json({
      success: true,
      data: rows.map(row => ({
        ...row,
        bill_number: row.bill_id ? row.bill_number : 'Multiple bills',
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load your payment history.' });
  }
};

exports.initiatePayment = async (req, res) => {
  const { bill_id, bill_ids, amount, pay_all, customer_id } = req.body;
  const requestedBillIds = normalizeBillIds({ bill_id, bill_ids });
  const isPayAll = pay_all === true || pay_all === 'true';
  const requestedAmount = Number(amount);

  if (!isPayAll && requestedBillIds.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one bill is required.' });
  }

  if (!isPayAll && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) {
    return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
  }

  try {
    await applyAutomaticPenalties();
    const conn = await pool.getConnection();
    let transactionStarted = false;

    try {
      let billRows = [];

      if (isPayAll && requestedBillIds.length === 0) {
        const targetCustomerId = isCustomerRole(req.user.role) ? req.user.customer_id : Number(customer_id);
        if (!targetCustomerId) {
          return res.status(400).json({ success: false, message: 'Customer is required for pay all payments.' });
        }

        [billRows] = await conn.query(
          `SELECT b.*, c.id AS customer_id
           FROM bills b
           INNER JOIN customers c ON c.id = b.customer_id
           WHERE b.customer_id = ?
             AND b.balance_due > 0
           ORDER BY b.due_date ASC, b.id ASC`,
          [targetCustomerId]
        );
      } else {
        const placeholders = requestedBillIds.map(() => '?').join(', ');
        [billRows] = await conn.query(
          `SELECT b.*, c.id AS customer_id
           FROM bills b
           INNER JOIN customers c ON c.id = b.customer_id
           WHERE b.id IN (${placeholders})
           ORDER BY b.due_date ASC, b.id ASC`,
          requestedBillIds
        );
      }

      if (!billRows.length) {
        return res.status(404).json({ success: false, message: 'No outstanding bills were found.' });
      }

      if (!isPayAll && billRows.length !== requestedBillIds.length) {
        return res.status(404).json({ success: false, message: 'One or more selected bills were not found.' });
      }

      const customerIds = [...new Set(billRows.map(bill => bill.customer_id))];
      if (customerIds.length > 1) {
        return res.status(400).json({ success: false, message: 'Selected bills must belong to one customer.' });
      }

      if (isCustomerRole(req.user.role) && req.user.customer_id !== customerIds[0]) {
        return res.status(403).json({ success: false, message: 'You can only pay your own bills.' });
      }

      const invalidBills = billRows.filter(bill => Number(bill.balance_due) <= 0);
      if (invalidBills.length) {
        return res.status(400).json({
          success: false,
          message: 'Selected bills must have an outstanding balance.',
        });
      }

      const totalOutstanding = money(billRows.reduce((sum, bill) => sum + Number(bill.balance_due || 0), 0));
      const requiresFullAllocation = isPayAll || Array.isArray(bill_ids) || billRows.length > 1;
      const amountToPay = requiresFullAllocation ? totalOutstanding : money(requestedAmount);

      if (requiresFullAllocation && Number.isFinite(requestedAmount) && Math.abs(money(requestedAmount) - totalOutstanding) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must match the selected outstanding balance.',
        });
      }

      if (!requiresFullAllocation && (amountToPay <= 0 || amountToPay > Number(billRows[0].balance_due))) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than zero and not exceed the bill balance.',
        });
      }

      const allocations = billRows.map(bill => ({
        bill_id: bill.id,
        allocated_amount: requiresFullAllocation ? money(bill.balance_due) : amountToPay,
      }));

      const paymentReference = buildPaymentReference();
      const transactionReference = `PESAPAL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
      const callbackUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL.replace(/\/$/, '')}/customer/payments/return`
        : null;

      const [customerRows] = await conn.query(
        `SELECT full_name, email, phone, address
         FROM customers
         WHERE id = ?
         LIMIT 1`,
        [customerIds[0]]
      );

      if (!customerRows.length) {
        return res.status(404).json({ success: false, message: 'Customer record not found for this bill.' });
      }

      await conn.beginTransaction();
      transactionStarted = true;

      const [result] = await conn.query(
        `INSERT INTO payments
          (payment_reference, customer_id, bill_id, amount, payment_method, transaction_reference, provider, status, callback_status, callback_url, initiated_by)
         VALUES (?, ?, ?, ?, 'pesapal', ?, 'pesapal', 'pending', 'pending', ?, ?)`,
        [
          paymentReference,
          customerIds[0],
          billRows.length === 1 ? billRows[0].id : null,
          amountToPay,
          transactionReference,
          callbackUrl,
          req.user.id,
        ]
      );

      for (const allocation of allocations) {
        await conn.query(
          `INSERT INTO payment_bill_allocations (payment_id, bill_id, allocated_amount)
           VALUES (?, ?, ?)`,
          [result.insertId, allocation.bill_id, allocation.allocated_amount]
        );
      }

      console.info(
        `[Payments] Initiating Pesapal checkout for ${billRows.length} bill(s) with reference ${paymentReference} and merchant reference ${transactionReference}.`
      );

      const pesapalOrder = await submitOrderRequest({
        merchantReference: transactionReference,
        amount: amountToPay,
        description: 'Electricity bill payment for selected outstanding bills',
        customer: customerRows[0],
      });

      await conn.query(
        `UPDATE payments
         SET order_tracking_id = ?
         WHERE id = ?`,
        [pesapalOrder.orderTrackingId, result.insertId]
      );

      await conn.commit();

      console.info(
        `[Payments] Pesapal checkout created for ${paymentReference}; tracking ${pesapalOrder.orderTrackingId}.`
      );

      return res.status(201).json({
        success: true,
        message: 'Pesapal payment initiated successfully.',
        data: {
          payment_id: result.insertId,
          payment_reference: paymentReference,
          transaction_reference: transactionReference,
          order_tracking_id: pesapalOrder.orderTrackingId,
          redirect_url: pesapalOrder.redirectUrl,
          status: 'pending',
        },
      });
    } catch (error) {
      if (transactionStarted) {
        await conn.rollback();
      }
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to initiate payment.' });
  }
};

exports.verifyPesapalPayment = async (req, res) => {
  const orderTrackingId =
    req.query.orderTrackingId ||
    req.query.OrderTrackingId ||
    req.body?.orderTrackingId ||
    req.body?.OrderTrackingId;
  const orderMerchantReference =
    req.query.orderMerchantReference ||
    req.query.OrderMerchantReference ||
    req.body?.orderMerchantReference ||
    req.body?.OrderMerchantReference;

  if (!orderTrackingId) {
    return res.status(400).json({ success: false, message: 'Order tracking ID is required.' });
  }

  try {
    console.info(`[Payments] Manual verification requested for tracking ${orderTrackingId}. Waiting for settlement confirmation.`);
    const result = await verifyUntilSettled(orderTrackingId, orderMerchantReference);
    return res.status(200).json({ success: true, message: 'Payment verified successfully.', data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to verify payment.' });
  }
};

exports.handlePesapalIpn = async (req, res) => {
  const orderTrackingId =
    req.body?.orderTrackingId ||
    req.body?.OrderTrackingId ||
    req.query?.orderTrackingId ||
    req.query?.OrderTrackingId;
  const orderMerchantReference =
    req.body?.orderMerchantReference ||
    req.body?.OrderMerchantReference ||
    req.query?.orderMerchantReference ||
    req.query?.OrderMerchantReference;
  const orderNotificationType =
    req.body?.orderNotificationType ||
    req.body?.OrderNotificationType ||
    req.query?.orderNotificationType ||
    req.query?.OrderNotificationType ||
    'IPNCHANGE';

  if (!orderTrackingId) {
    return res.status(400).json({ success: false, message: 'Order tracking ID is required.' });
  }

  try {
    console.info(
      `[Payments] Pesapal IPN received: tracking=${orderTrackingId}, merchantReference=${orderMerchantReference || 'n/a'}, type=${orderNotificationType}.`
    );
    await verifyAndPersistPayment(orderTrackingId, orderMerchantReference);
    return res.status(200).json({
      orderNotificationType,
      orderTrackingId,
      orderMerchantReference,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      orderNotificationType,
      orderTrackingId,
      orderMerchantReference,
      status: 500,
    });
  }
};
