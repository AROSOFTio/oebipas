const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
  const { customer_id } = req.query; // If admin fetches for someone or customer fetches for selves
  try {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    if (customer_id) {
      query += ' AND customer_id = ?';
      params.push(customer_id);
    }
    query += ' ORDER BY created_at DESC';
    
    const [notifications] = await pool.query(query, params);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  const { customer_id } = req.body;
  try {
    if (!customer_id) {
      // Mark specific notification if id provided in route, but we want 'mark all' for customer
      return res.status(400).json({ success: false, message: 'customer_id is required' });
    }
    await pool.query('UPDATE notifications SET status = "sent" WHERE customer_id = ? AND status = "pending"', [customer_id]);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark Notifications Read Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendBroadcast = async (req, res) => {
  const { title, message } = req.body;
  try {
    // Get all active customers
    const [customers] = await pool.query('SELECT id FROM customers WHERE status = "active"');
    if(customers.length > 0) {
      const values = customers.map(c => [c.id, 'broadcast', title, message, 'in-app', 'pending', new Date()]);
      await pool.query('INSERT INTO notifications (customer_id, type, title, message, channel, status, sent_at) VALUES ?', [values]);
    }
    res.status(200).json({ success: true, message: `Broadcast sent to ${customers.length} customers` });
  } catch (error) {
    console.error('Send Broadcast Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
