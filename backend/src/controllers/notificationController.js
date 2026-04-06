const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
  const { customer_id } = req.query;
  const user_id = req.user.id;

  try {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (customer_id) {
      query += ' AND customer_id = ?';
      params.push(customer_id);
    } else {
      // If no customer_id provided, fetch for the logged-in user (staff or customer user)
      query += ' AND (user_id = ? OR customer_id = (SELECT id FROM customers WHERE user_id = ?))';
      params.push(user_id, user_id);
    }

    query += ' ORDER BY created_at DESC LIMIT 20';
    
    const [notifications] = await pool.query(query, params);
    
    // Get unread count
    const [[{ unread_count }]] = await pool.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE (user_id = ? OR customer_id = (SELECT id FROM customers WHERE user_id = ?)) AND status = "pending"',
      [user_id, user_id]
    );

    res.status(200).json({ 
      success: true, 
      data: notifications,
      unread_count: unread_count || 0
    });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  const { customer_id, notification_id } = req.body;
  const user_id = req.user.id;

  try {
    if (notification_id) {
      await pool.query('UPDATE notifications SET status = "sent" WHERE id = ?', [notification_id]);
    } else if (customer_id) {
      await pool.query('UPDATE notifications SET status = "sent" WHERE customer_id = ? AND status = "pending"', [customer_id]);
    } else {
      await pool.query('UPDATE notifications SET status = "sent" WHERE user_id = ? AND status = "pending"', [user_id]);
    }
    res.status(200).json({ success: true, message: 'Notifications updated' });
  } catch (error) {
    console.error('Mark Notifications Read Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendBroadcast = async (req, res) => {
  const { title, message } = req.body;
  try {
    const [customers] = await pool.query('SELECT id FROM customers WHERE status = "active"');
    if(customers.length > 0) {
      const values = customers.map(c => [null, c.id, 'broadcast', title, message, 'in-app', 'pending', new Date()]);
      await pool.query('INSERT INTO notifications (user_id, customer_id, type, title, message, channel, status, sent_at) VALUES ?', [values]);
    }
    res.status(200).json({ success: true, message: `Broadcast sent to ${customers.length} customers` });
  } catch (error) {
    console.error('Send Broadcast Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
