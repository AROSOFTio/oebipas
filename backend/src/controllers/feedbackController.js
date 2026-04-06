const pool = require('../config/db');

exports.getFeedback = async (req, res) => {
  const { customer_id } = req.query;
  try {
    let query = `
      SELECT f.*, c.full_name as customer_name, c.customer_number, 
             u.full_name as assigned_officer_name, r.name as assigned_officer_role
      FROM feedback f 
      JOIN customers c ON f.customer_id = c.id
      LEFT JOIN users u ON f.assigned_to = u.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE 1=1
    `;
    const params = [];
    if (customer_id) {
      query += ' AND f.customer_id = ?';
      params.push(customer_id);
    }
    
    // If the user is an officer (not manager or helpdesk), only see assigned tickets
    const showAllRoles = ['General Manager', 'Branch Manager', 'Help Desk'];
    if (!showAllRoles.includes(req.user.role) && req.user.role !== 'Customer') {
      query += ' AND f.assigned_to = ?';
      params.push(req.user.id);
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
  const { customer_id, category, subject, message } = req.body;
  if (!customer_id || !category || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO feedback (customer_id, category, subject, message, status) VALUES (?, ?, ?, ?, "new")',
      [customer_id, category, subject, message]
    );
    res.status(201).json({ success: true, message: 'Support ticket submitted successfully' });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.assignTicket = async (req, res) => {
  const { id } = req.params;
  const { assigned_to, internal_notes } = req.body;
  try {
    const [[officer]] = await pool.query('SELECT full_name FROM users WHERE id = ?', [assigned_to]);
    if (!officer) return res.status(404).json({ success: false, message: 'Officer not found' });

    await pool.query(
      'UPDATE feedback SET assigned_to = ?, status = "assigned", admin_response = coalesce(?, admin_response) WHERE id = ?',
      [assigned_to, internal_notes || null, id]
    );

    // Notify customer
    const [[feedback]] = await pool.query('SELECT customer_id, subject FROM feedback WHERE id = ?', [id]);
    if (feedback) {
      await pool.query(
        'INSERT INTO notifications (customer_id, type, title, message) VALUES (?, ?, ?, ?)',
        [feedback.customer_id, 'support_assigned', 'Ticket Assigned', `Your ticket "${feedback.subject}" has been assigned to ${officer.full_name} for resolution.`]
      );
    }

    res.status(200).json({ success: true, message: `Ticket successfully forwarded to ${officer.full_name}` });
  } catch (error) {
    console.error('Assign Ticket Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_response } = req.body;
  try {
    await pool.query(
      'UPDATE feedback SET status = ?, admin_response = coalesce(?, admin_response) WHERE id = ?',
      [status, admin_response || null, id]
    );
    
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
