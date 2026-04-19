const pool = require('../config/db');
const notificationService = require('./notificationService');
const pesapalService = require('./pesapalService');

const SUCCESSFUL_STATUS_CODES = new Set(['1']);
const FAILED_STATUS_CODES = new Set(['0', '2', '3']);
const SUCCESSFUL_KEYWORDS = ['COMPLETED', 'SUCCESS', 'PAID'];
const FAILED_KEYWORDS = ['FAILED', 'INVALID', 'REVERSED', 'CANCELLED', 'CANCELED'];

const getStatusDescription = payload =>
  String(
    typeof payload === 'object'
      ? payload?.payment_status_description ?? payload?.payment_status ?? payload?.description ?? ''
      : payload || ''
  )
    .trim()
    .toUpperCase();

const getStatusCode = payload =>
  payload && typeof payload === 'object'
    ? String(payload.payment_status_code ?? payload.status_code ?? '').trim()
    : '';

const normalizePesapalStatus = payload => {
  const description = getStatusDescription(payload);
  const statusCode = getStatusCode(payload);

  if (SUCCESSFUL_STATUS_CODES.has(statusCode)) return 'successful';
  if (FAILED_STATUS_CODES.has(statusCode)) return 'failed';

  if (SUCCESSFUL_KEYWORDS.some(keyword => description.includes(keyword))) {
    return 'successful';
  }

  if (FAILED_KEYWORDS.some(keyword => description.includes(keyword))) {
    return 'failed';
  }

  return 'pending';
};

const notifyInternalPaymentReceipt = async ({ billNumber, customerId, amount }) => {
  const [staffRows] = await pool.query(
    `SELECT u.id
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE r.name IN ('System administrators', 'Billing officers')
       AND u.status = 'active'`
  );

  const title = 'Payment received';
  const message = `Payment of UGX ${Number(amount).toLocaleString()} has been received for bill ${billNumber}.`;

  for (const staff of staffRows) {
    await pool.query(
      `INSERT INTO notifications
        (user_id, customer_id, notification_type, channel, title, message, recipient_email, recipient_phone, status, sent_at)
       VALUES (?, ?, 'payment_successful', 'in_app', ?, ?, NULL, NULL, 'sent', NOW())`,
      [staff.id, customerId, title, message]
    );
  }
};

const loadPaymentForSettlement = async (conn, paymentId) => {
  const [rows] = await conn.query(
    `SELECT p.*, c.user_id, c.email, c.phone, b.bill_number, b.balance_due, b.amount_paid, b.total_amount,
            b.due_date, b.customer_id, b.status AS bill_status
     FROM payments p
     INNER JOIN customers c ON c.id = p.customer_id
     INNER JOIN bills b ON b.id = p.bill_id
     WHERE p.id = ?
     LIMIT 1
     FOR UPDATE`,
    [paymentId]
  );

  if (!rows.length) {
    throw new Error('Payment not found.');
  }

  return rows[0];
};

const buildSettlementResponse = (payment, overrides = {}) => ({
  paymentId: payment.id,
  paymentReference: payment.payment_reference,
  paymentStatus: overrides.paymentStatus || payment.status,
  callbackStatus: overrides.callbackStatus || payment.callback_status,
  billId: payment.bill_id,
  billNumber: payment.bill_number,
  billStatus: overrides.billStatus || payment.bill_status,
  balanceDue:
    overrides.balanceDue !== undefined ? Number(overrides.balanceDue) : Number(payment.balance_due),
  appliedAmount:
    overrides.appliedAmount !== undefined ? Number(overrides.appliedAmount) : 0,
  duplicate: Boolean(overrides.duplicate),
});

const settlePayment = async ({ paymentId, status, orderTrackingId = null, confirmationCode = null }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const payment = await loadPaymentForSettlement(conn, paymentId);

    if (payment.status !== 'pending') {
      await conn.commit();
      console.info(
        `[Payments] Skipped duplicate reconciliation for ${payment.payment_reference}; current status is ${payment.status}.`
      );
      return buildSettlementResponse(payment, { duplicate: true });
    }

    if (status === 'successful') {
      const amount = Number(payment.amount);
      const currentBalance = Number(payment.balance_due);
      const appliedAmount = Number(Math.min(amount, currentBalance).toFixed(2));
      const newBalance = Number(Math.max(0, currentBalance - appliedAmount).toFixed(2));
      const isOverdue = payment.due_date && new Date(payment.due_date) < new Date();
      const newBillStatus = newBalance === 0 ? 'paid' : isOverdue ? 'overdue' : 'partially_paid';

      await conn.query(
        `UPDATE payments
         SET status = 'successful',
             callback_status = 'received',
             payment_date = COALESCE(payment_date, NOW()),
             order_tracking_id = COALESCE(?, order_tracking_id),
             confirmation_code = COALESCE(?, confirmation_code)
         WHERE id = ?`,
        [orderTrackingId, confirmationCode, paymentId]
      );
      await conn.query(
        `UPDATE bills
         SET amount_paid = amount_paid + ?,
             balance_due = ?,
             status = ?
         WHERE id = ?`,
        [appliedAmount, newBalance, newBillStatus, payment.bill_id]
      );

      if (newBalance === 0) {
        await conn.query(`UPDATE penalties SET status = 'cleared' WHERE bill_id = ?`, [payment.bill_id]);
      }

      await conn.commit();

      if (appliedAmount > 0) {
        await notificationService.queueNotification({
          userId: payment.user_id,
          customerId: payment.customer_id,
          type: 'payment_successful',
          title: 'Payment confirmed',
          message: `Payment for bill ${payment.bill_number} was successful. Your account balance has been updated automatically.`,
          recipientEmail: payment.email,
          recipientPhone: payment.phone,
        });

        await notifyInternalPaymentReceipt({
          billNumber: payment.bill_number,
          customerId: payment.customer_id,
          amount: appliedAmount,
        });
      }

      console.info(
        `[Payments] Reconciled ${payment.payment_reference} as successful. Bill ${payment.bill_number} is now ${newBillStatus} with balance ${newBalance}.`
      );

      return buildSettlementResponse(payment, {
        paymentStatus: 'successful',
        callbackStatus: 'received',
        billStatus: newBillStatus,
        balanceDue: newBalance,
        appliedAmount,
      });
    }

    if (status === 'failed') {
      await conn.query(
        `UPDATE payments
         SET status = 'failed',
             callback_status = 'received',
             order_tracking_id = COALESCE(?, order_tracking_id),
             confirmation_code = COALESCE(?, confirmation_code)
         WHERE id = ?`,
        [orderTrackingId, confirmationCode, paymentId]
      );
      await conn.commit();

      console.info(`[Payments] Reconciled ${payment.payment_reference} as failed.`);

      return buildSettlementResponse(payment, {
        paymentStatus: 'failed',
        callbackStatus: 'received',
      });
    }

    await conn.query(
      `UPDATE payments
       SET callback_status = 'received',
           order_tracking_id = COALESCE(?, order_tracking_id),
           confirmation_code = COALESCE(?, confirmation_code)
       WHERE id = ?`,
      [orderTrackingId, confirmationCode, paymentId]
    );
    await conn.commit();

    console.info(`[Payments] Verification for ${payment.payment_reference} remains pending at Pesapal.`);

    return buildSettlementResponse(payment, {
      callbackStatus: 'received',
    });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const verifyAndPersistPayment = async (orderTrackingId, merchantReferenceHint = null) => {
  const transactionStatus = await pesapalService.getTransactionStatus(orderTrackingId);
  const merchantReference = transactionStatus.merchant_reference || merchantReferenceHint || null;
  const [rows] = await pool.query(
    `SELECT id
     FROM payments
     WHERE order_tracking_id = ? OR transaction_reference = ?
     LIMIT 1`,
    [orderTrackingId, merchantReference]
  );

  if (!rows.length) {
    throw new Error('Payment transaction not found.');
  }

  const normalizedStatus = normalizePesapalStatus(transactionStatus);
  console.info(
    `[Payments] Pesapal verification received for tracking ${orderTrackingId}: ${transactionStatus.payment_status_description || normalizedStatus}.`
  );

  const settlement = await settlePayment({
    paymentId: rows[0].id,
    status: normalizedStatus,
    orderTrackingId,
    confirmationCode: transactionStatus.confirmation_code || null,
  });

  return {
    payment_reference: settlement.paymentReference,
    payment_status_description:
      transactionStatus.payment_status_description ||
      (normalizedStatus === 'successful'
        ? 'Completed'
        : normalizedStatus === 'failed'
          ? 'Failed'
          : 'Pending'),
    merchant_reference: merchantReference,
    order_tracking_id: orderTrackingId,
    amount: transactionStatus.amount,
    payment_status: settlement.paymentStatus,
    callback_status: settlement.callbackStatus,
    bill_id: settlement.billId,
    bill_number: settlement.billNumber,
    bill_status: settlement.billStatus,
    bill_balance_due: settlement.balanceDue,
    applied_amount: settlement.appliedAmount,
    duplicate: settlement.duplicate,
    status_code: transactionStatus.status_code,
    message: transactionStatus.message,
  };
};

const reconcilePendingPayments = async ({ customerId = null } = {}) => {
  const [pendingRows] = await pool.query(
    `SELECT id, payment_reference, order_tracking_id, transaction_reference
     FROM payments
     WHERE status = 'pending'
       AND (? IS NULL OR customer_id = ?)`,
    [customerId, customerId]
  );

  let reconciled = 0;
  for (const payment of pendingRows) {
    if (!payment.order_tracking_id) continue;

    try {
      const result = await verifyAndPersistPayment(payment.order_tracking_id, payment.transaction_reference);
      if (result.payment_status !== 'pending') {
        reconciled += 1;
      }
    } catch (error) {
      console.error(`Pending reconciliation failed for payment ${payment.id} (${payment.payment_reference}):`, error.message);
    }
  }

  if (reconciled > 0) {
    console.info(`[Payments] Reconciled ${reconciled} pending payment(s).`);
  }

  return reconciled;
};

module.exports = {
  normalizePesapalStatus,
  reconcilePendingPayments,
  settlePayment,
  verifyAndPersistPayment,
};
