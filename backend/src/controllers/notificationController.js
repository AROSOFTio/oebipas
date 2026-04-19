const pool = require('../config/db');
const { queueNotification } = require('../services/notificationService');
const { isCustomerRole } = require('../utils/roles');

exports.getNotifications = async (req, res) => {
  try {
    if (!isCustomerRole(req.user.role)) {
      const [rows] = await pool.query(
        `SELECT *
         FROM notifications
         ORDER BY created_at DESC`
      );
      return res.status(200).json({ success: true, data: rows });
    }

    const [rows] = await pool.query(
      `SELECT *
       FROM notifications
       WHERE user_id = ? OR customer_id = ?
       ORDER BY created_at DESC`,
      [req.user.id, req.user.customer_id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load notifications.' });
  }
};

exports.sendNotification = async (req, res) => {
  const { customer_id, title, message } = req.body;

  if (!customer_id || !title || !message) {
    return res.status(400).json({ success: false, message: 'Customer, title and message are required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.email, c.phone, c.user_id FROM customers c WHERE c.id = ? LIMIT 1`,
      [customer_id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = rows[0];
    await queueNotification({
      userId: customer.user_id,
      customerId: customer.id,
      type: 'manual',
      title,
      message,
      recipientEmail: customer.email,
      recipientPhone: customer.phone,
    });

    return res.status(201).json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to send notification.' });
  }
};
