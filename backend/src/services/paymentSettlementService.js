const pool = require('../config/db');
const { queueNotification } = require('./notificationService');
const { getTransactionStatus } = require('./pesapalService');

const normalizePesapalStatus = payload => {
  const description = String(
    typeof payload === 'object'
      ? payload?.payment_status_description || payload?.payment_status || ''
      : payload || ''
  ).toUpperCase();
  const statusCode =
    payload && typeof payload === 'object'
      ? String(payload.status_code ?? payload.payment_status_code ?? '').trim()
      : '';

  if (statusCode === '1') return 'successful';
  if (statusCode === '0' || statusCode === '2' || statusCode === '3') return 'failed';

  if (
    description.includes('COMPLETED') ||
    description.includes('SUCCESS') ||
    description.includes('PAID')
  ) {
    return 'successful';
  }

  if (
    description.includes('FAILED') ||
    description.includes('INVALID') ||
    description.includes('REVERSED')
  ) {
    return 'failed';
  }

  return 'pending';
};

const notifyInternalPaymentReceipt = async ({ billNumber, customerId, amount }) => {
  const [staffRows] = await pool.query(
    `SELECT u.id
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE r.name IN ('Branch Manager', 'Billing Staff')
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

const settlePayment = async ({ paymentId, status, orderTrackingId = null, confirmationCode = null }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT p.*, c.user_id, c.email, c.phone, b.bill_number, b.balance_due, b.due_date, b.customer_id
       FROM payments p
       INNER JOIN customers c ON c.id = p.customer_id
       INNER JOIN bills b ON b.id = p.bill_id
       WHERE p.id = ?
       LIMIT 1`,
      [paymentId]
    );

    if (!rows.length) {
      throw new Error('Payment not found.');
    }

    const payment = rows[0];
    if (payment.status !== 'pending') {
      await conn.commit();
      return payment;
    }

    if (status === 'successful') {
      const amount = Number(payment.amount);
      const currentBalance = Number(payment.balance_due);
      const appliedAmount = Number(Math.min(amount, currentBalance).toFixed(2));
      const newBalance = Number(Math.max(0, currentBalance - appliedAmount).toFixed(2));
      const isOverdue = payment.due_date && new Date(payment.due_date) < new Date();
      const newStatus = newBalance === 0 ? 'paid' : isOverdue ? 'overdue' : 'partially_paid';

      await conn.query(
        `UPDATE payments
         SET status = 'successful',
             callback_status = 'received',
             payment_date = NOW(),
             order_tracking_id = COALESCE(?, order_tracking_id),
             confirmation_code = COALESCE(?, confirmation_code)
         WHERE id = ?`,
        [orderTrackingId, confirmationCode, paymentId]
      );
      await conn.query(
        `UPDATE bills
         SET amount_paid = amount_paid + ?, balance_due = ?, status = ?
         WHERE id = ?`,
        [appliedAmount, newBalance, newStatus, payment.bill_id]
      );

      if (newBalance === 0) {
        await conn.query(`UPDATE penalties SET status = 'cleared' WHERE bill_id = ?`, [payment.bill_id]);
      }

      await conn.commit();

      await queueNotification({
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
    } else if (status === 'failed') {
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
    } else {
      await conn.commit();
    }

    return payment;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const verifyAndPersistPayment = async orderTrackingId => {
  const transactionStatus = await getTransactionStatus(orderTrackingId);
  const merchantReference = transactionStatus.merchant_reference;
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
  await settlePayment({
    paymentId: rows[0].id,
    status: normalizedStatus,
    orderTrackingId,
    confirmationCode: transactionStatus.confirmation_code || null,
  });

  return {
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
    payment_status: normalizedStatus,
    status_code: transactionStatus.status_code,
    message: transactionStatus.message,
  };
};

const reconcilePendingPayments = async ({ customerId = null } = {}) => {
  const [pendingRows] = await pool.query(
    `SELECT id, order_tracking_id
     FROM payments
     WHERE status = 'pending'
       AND (? IS NULL OR customer_id = ?)`,
    [customerId, customerId]
  );

  let reconciled = 0;
  for (const payment of pendingRows) {
    if (!payment.order_tracking_id) continue;

    try {
      await verifyAndPersistPayment(payment.order_tracking_id);
      reconciled += 1;
    } catch (error) {
      console.error(`Pending reconciliation failed for payment ${payment.id}:`, error.message);
    }
  }

  return reconciled;
};

module.exports = {
  normalizePesapalStatus,
  reconcilePendingPayments,
  settlePayment,
  verifyAndPersistPayment,
};
