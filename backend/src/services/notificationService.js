const pool = require('../config/db');

const queueNotification = async ({
  userId = null,
  customerId = null,
  type,
  title,
  message,
  channel = 'email',
  recipientEmail = null,
  recipientPhone = null,
}) => {
  const [result] = await pool.query(
    `INSERT INTO notifications
      (user_id, customer_id, notification_type, channel, title, message, recipient_email, recipient_phone, status, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent', NOW())`,
    [userId, customerId, type, channel, title, message, recipientEmail, recipientPhone]
  );

  return result.insertId;
};

module.exports = {
  queueNotification,
};
