const crypto = require('crypto');
const pool = require('../config/db');
const { applyAutomaticPenalties } = require('../services/automationService');
const { queueNotification } = require('../services/notificationService');

const buildPaymentReference = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const settlePayment = async (paymentId, status) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT p.*, c.user_id, c.email, c.phone, b.bill_number, b.balance_due, b.due_date
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
      const newBalance = Number(Math.max(0, currentBalance - amount).toFixed(2));
      const isOverdue = payment.due_date && new Date(payment.due_date) < new Date();
      const newStatus = newBalance === 0 ? 'paid' : isOverdue ? 'overdue' : 'partially_paid';

      await conn.query(
        `UPDATE payments
         SET status = 'successful', callback_status = 'received', payment_date = NOW()
         WHERE id = ?`,
        [paymentId]
      );
      await conn.query(
        `UPDATE bills
         SET amount_paid = amount_paid + ?, balance_due = ?, status = ?
         WHERE id = ?`,
        [amount, newBalance, newStatus, payment.bill_id]
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
    } else {
      await conn.query(
        `UPDATE payments
         SET status = 'failed', callback_status = 'received'
         WHERE id = ?`,
        [paymentId]
      );
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

exports.getPayments = async (req, res) => {
  try {
    await applyAutomaticPenalties();
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
  const { bill_id, amount, payment_method, simulate_status } = req.body;

  if (!bill_id || !amount || !payment_method) {
    return res.status(400).json({ success: false, message: 'Bill, amount and payment method are required.' });
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
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero and not exceed the bill balance.' });
    }

    const transactionReference = `TXN-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const paymentReference = buildPaymentReference();

    const [result] = await pool.query(
      `INSERT INTO payments
        (payment_reference, customer_id, bill_id, amount, payment_method, transaction_reference, provider, status, callback_status, initiated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
      [
        paymentReference,
        bill.customer_id,
        bill_id,
        amount,
        payment_method,
        transactionReference,
        payment_method === 'pesapal' ? 'pesapal' : 'simulated',
        req.user.id,
      ]
    );

    if (simulate_status) {
      await settlePayment(result.insertId, simulate_status);
    }

    return res.status(201).json({
      success: true,
      message: 'Payment initiated successfully.',
      data: {
        payment_id: result.insertId,
        payment_reference: paymentReference,
        transaction_reference: transactionReference,
        status: simulate_status || 'pending',
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to initiate payment.' });
  }
};

exports.handlePaymentCallback = async (req, res) => {
  const { transaction_reference, status } = req.body;

  if (!transaction_reference || !status) {
    return res.status(400).json({ success: false, message: 'Transaction reference and status are required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id FROM payments WHERE transaction_reference = ? LIMIT 1`,
      [transaction_reference]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Payment transaction not found.' });
    }

    await settlePayment(rows[0].id, status);
    return res.status(200).json({ success: true, message: 'Payment callback processed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to process payment callback.' });
  }
};
