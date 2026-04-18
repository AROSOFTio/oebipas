const crypto = require('crypto');
const pool = require('../config/db');
const { applyAutomaticPenalties } = require('../services/automationService');
const { submitOrderRequest } = require('../services/pesapalService');
const { reconcilePendingPayments, verifyAndPersistPayment } = require('../services/paymentSettlementService');

const buildPaymentReference = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

exports.getPayments = async (req, res) => {
  try {
    await applyAutomaticPenalties();
    await reconcilePendingPayments();

    const [rows] = await pool.query(
      `SELECT p.*, c.customer_number, c.full_name AS customer_name, b.bill_number
       FROM payments p
       INNER JOIN customers c ON c.id = p.customer_id
       INNER JOIN bills b ON b.id = p.bill_id
       ORDER BY p.created_at DESC`
    );

    return res.status(200).json({ success: true, data: rows });
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
       INNER JOIN bills b ON b.id = p.bill_id
       WHERE p.customer_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.customer_id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load your payment history.' });
  }
};

exports.initiatePayment = async (req, res) => {
  const { bill_id, amount } = req.body;

  if (!bill_id || !amount) {
    return res.status(400).json({ success: false, message: 'Bill and amount are required.' });
  }

  try {
    await applyAutomaticPenalties();

    const [billRows] = await pool.query(
      `SELECT b.*, c.id AS customer_id
       FROM bills b
       INNER JOIN customers c ON c.id = b.customer_id
       WHERE b.id = ?
       LIMIT 1`,
      [bill_id]
    );

    if (!billRows.length) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    const bill = billRows[0];
    if (req.user.role === 'Customer' && req.user.customer_id !== bill.customer_id) {
      return res.status(403).json({ success: false, message: 'You can only pay your own bill.' });
    }

    if (Number(amount) <= 0 || Number(amount) > Number(bill.balance_due)) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero and not exceed the bill balance.',
      });
    }

    const paymentReference = buildPaymentReference();
    const transactionReference = `PESAPAL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const [result] = await pool.query(
      `INSERT INTO payments
        (payment_reference, customer_id, bill_id, amount, payment_method, transaction_reference, provider, status, callback_status, initiated_by)
       VALUES (?, ?, ?, ?, 'pesapal', ?, 'pesapal', 'pending', 'pending', ?)`,
      [paymentReference, bill.customer_id, bill_id, amount, transactionReference, req.user.id]
    );

    const [customerRows] = await pool.query(
      `SELECT full_name, email, phone, address
       FROM customers
       WHERE id = ?
       LIMIT 1`,
      [bill.customer_id]
    );

    const pesapalOrder = await submitOrderRequest({
      merchantReference: transactionReference,
      amount,
      description: `Electricity bill payment for ${bill.bill_number}`,
      customer: customerRows[0],
    });

    await pool.query(
      `UPDATE payments
       SET order_tracking_id = ?
       WHERE id = ?`,
      [pesapalOrder.orderTrackingId, result.insertId]
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

  if (!orderTrackingId) {
    return res.status(400).json({ success: false, message: 'Order tracking ID is required.' });
  }

  try {
    const result = await verifyAndPersistPayment(orderTrackingId);
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
    await verifyAndPersistPayment(orderTrackingId);
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
