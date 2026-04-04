const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');
const crypto = require('crypto');

exports.getAllPayments = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, c.customer_number, c.full_name as customer_name, b.bill_number
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN bills b ON p.bill_id = b.id
      ORDER BY p.created_at DESC
    `);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [payments] = await pool.query(`
      SELECT p.*, c.customer_number, c.full_name as customer_name, b.bill_number
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN bills b ON p.bill_id = b.id
      WHERE p.id = ?
    `, [id]);

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Get reconciliation
    const [reconciliations] = await pool.query('SELECT * FROM payment_reconciliations WHERE payment_id = ?', [id]);
    
    // Get receipt
    const [receipts] = await pool.query('SELECT * FROM receipts WHERE payment_id = ?', [id]);

    res.status(200).json({ 
      success: true, 
      data: {
        ...payments[0],
        reconciliation: reconciliations[0] || null,
        receipt: receipts[0] || null
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getCustomerPayments = async (req, res) => {
  const { id } = req.params;
  try {
    const [payments] = await pool.query(`
      SELECT p.*, b.bill_number, r.receipt_number
      FROM payments p
      LEFT JOIN bills b ON p.bill_id = b.id
      LEFT JOIN receipts r ON p.id = r.payment_id
      WHERE p.customer_id = ?
      ORDER BY p.created_at DESC
    `, [id]);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.processPayment = async (req, res) => {
  const { customer_id, bill_id, amount, payment_method, transaction_reference } = req.body;
  
  if (!customer_id || !amount || !payment_method) {
    return res.status(400).json({ success: false, message: 'Missing required payment details' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Generate local payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const safeTxRef = transaction_reference || `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const today = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 2. Insert Payment
    const [payResult] = await conn.query(
      `INSERT INTO payments (payment_reference, customer_id, bill_id, amount, payment_method, transaction_reference, status, payment_date, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, 'successful', ?, ?)`,
      [paymentReference, customer_id, bill_id || null, amount, payment_method, safeTxRef, today, req.user ? req.user.id : null]
    );
    const paymentId = payResult.insertId;

    // 3. Reconcile and Update Bill if bill_id exists
    if (bill_id) {
      // Find bill
      const [bills] = await conn.query('SELECT * FROM bills WHERE id = ?', [bill_id]);
      if (bills.length > 0) {
        const bill = bills[0];
        const newBalance = Math.max(0, parseFloat(bill.balance_due) - parseFloat(amount));
        const newPaidAmount = parseFloat(bill.amount_paid) + parseFloat(amount);
        let status = 'partially_paid';
        if (newBalance === 0) status = 'paid';

        // Update bill
        await conn.query(
          `UPDATE bills SET amount_paid = ?, balance_due = ?, status = ? WHERE id = ?`,
          [newPaidAmount, newBalance, status, bill_id]
        );

        // Add reconciliation record
        await conn.query(
          `INSERT INTO payment_reconciliations (payment_id, bill_id, reconciled_amount, reconciled_by, reconciled_at, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [paymentId, bill_id, amount, req.user ? req.user.id : null, today, 'Auto-reconciled upon payment']
        );
      }
    }

    // 4. Generate Receipt
    const receiptNumber = `RCT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const [receiptResult] = await conn.query(
      `INSERT INTO receipts (receipt_number, payment_id, customer_id, amount, issued_at, issued_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [receiptNumber, paymentId, customer_id, amount, today, req.user ? req.user.id : null]
    );

    // 5. Build Notification
    await conn.query(
      'INSERT INTO notifications (customer_id, type, title, message, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id, 'payment_received', 'Payment Successful', `We have received your payment of UGX ${amount}. Thank you.`, 'pending', new Date()]
    );

    await conn.commit();

    if (req.user) {
      await logAudit(req.user.id, 'PROCESS_PAYMENT', 'Payments', paymentId, `Processed payment ${paymentReference} for UGX ${amount}`);
    }

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment_id: paymentId,
        payment_reference: paymentReference,
        receipt_number: receiptNumber
      }
    });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error during payment processing' });
  } finally {
    conn.release();
  }
};

exports.pesapalIpn = async (req, res) => {
  // Mock Pesapal IPN logic
  // Typically recieves OrderTrackingId, OrderNotificationType
  const { OrderTrackingId, OrderNotificationType } = req.body;
  
  if (!OrderTrackingId) {
    return res.status(400).json({ status: 400, message: 'Missing OrderTrackingId' });
  }

  // Find payment logic based on tracking ID in transaction_reference
  try {
    const [payments] = await pool.query('SELECT * FROM payments WHERE transaction_reference = ?', [OrderTrackingId]);
    if (payments.length > 0) {
      const payment = payments[0];
      // Here we would sync with pesapal to verify status, for demo we just mark it as successful if not already
      if (payment.status !== 'successful') {
        await pool.query('UPDATE payments SET status = "successful" WHERE id = ?', [payment.id]);
        
        // Also would normally do reconciliation here if it was pending
        console.log(`[IPN] Payment ${OrderTrackingId} marked as successful via mock IPN`);
      }
    }
    
    // Respond successfully so PESAPAL stops retrying
    res.status(200).json({
      OrderTrackingId: OrderTrackingId,
      OrderNotificationType: OrderNotificationType,
      status: 200
    });
  } catch (error) {
    console.error('[IPN]', error);
    res.status(500).json({ status: 500, message: 'Server Error' });
  }
};

exports.getAllReceipts = async (req, res) => {
  try {
    const [receipts] = await pool.query(`
      SELECT r.*, c.customer_number, c.full_name as customer_name, p.payment_reference, p.payment_method
      FROM receipts r
      JOIN customers c ON r.customer_id = c.id
      JOIN payments p ON r.payment_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.status(200).json({ success: true, data: receipts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
