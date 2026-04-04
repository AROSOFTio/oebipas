const pool = require('../config/db');

exports.getFeedback = async (req, res) => {
  const { customer_id } = req.query;
  try {
    let query = `
      SELECT f.*, c.full_name as customer_name, c.customer_number
      FROM feedback f 
      JOIN customers c ON f.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (customer_id) {
      query += ' AND f.customer_id = ?';
      params.push(customer_id);
    }
    query += ' ORDER BY f.created_at DESC';
    
    const [feedback] = await pool.query(query, params);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitFeedback = async (req, res) => {
  const { customer_id, subject, message } = req.body;
  try {
    await pool.query(
      'INSERT INTO feedback (customer_id, subject, message, status) VALUES (?, ?, ?, "new")',
      [customer_id, subject, message]
    );
    res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_response } = req.body; // status: new, in_progress, resolved, closed
  try {
    await pool.query(
      'UPDATE feedback SET status = ?, admin_response = coalesce(?, admin_response) WHERE id = ?',
      [status, admin_response || null, id]
    );
    
    // Optional: Send notification to customer about status change
    const [[feedback]] = await pool.query('SELECT customer_id, subject FROM feedback WHERE id = ?', [id]);
    if (feedback) {
      await pool.query(
        'INSERT INTO notifications (customer_id, type, title, message) VALUES (?, ?, ?, ?)',
        [feedback.customer_id, 'support_update', 'Support Ticket Updated', `Your ticket "${feedback.subject}" has been updated to: ${status.replace('_', ' ').toUpperCase()}`]
      );
    }

    res.status(200).json({ success: true, message: 'Feedback status updated' });
  } catch (error) {
    console.error('Update Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
