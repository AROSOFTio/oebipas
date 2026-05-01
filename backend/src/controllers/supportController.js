const pool = require('../config/db');

const CATEGORY_VALUES = new Set(['complaint', 'feedback', 'billing', 'payment', 'technical', 'other']);
const STATUS_VALUES = new Set(['open', 'in_progress', 'resolved', 'closed']);

const baseTicketQuery = `
  SELECT st.*, c.customer_number, c.full_name AS customer_name, c.email AS customer_email
  FROM support_tickets st
  INNER JOIN customers c ON c.id = st.customer_id
`;

exports.createTicket = async (req, res) => {
  const subject = String(req.body.subject || '').trim();
  const category = String(req.body.category || 'other').trim();
  const message = String(req.body.message || '').trim();

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required.' });
  }

  if (!CATEGORY_VALUES.has(category)) {
    return res.status(400).json({ success: false, message: 'Invalid support category.' });
  }

  try {
    const [customerRows] = await pool.query(
      `SELECT id
       FROM customers
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!customerRows.length) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    const [result] = await pool.query(
      `INSERT INTO support_tickets (customer_id, user_id, subject, category, message)
       VALUES (?, ?, ?, ?, ?)`,
      [customerRows[0].id, req.user.id, subject, category, message]
    );

    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully.',
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to submit support ticket.' });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `${baseTicketQuery}
       WHERE st.customer_id = ?
       ORDER BY st.created_at DESC`,
      [req.user.customer_id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load support tickets.' });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(`${baseTicketQuery} ORDER BY st.created_at DESC`);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load support tickets.' });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const [rows] = await pool.query(`${baseTicketQuery} WHERE st.id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load support ticket.' });
  }
};

exports.updateTicket = async (req, res) => {
  const status = String(req.body.status || '').trim();
  const staffResponse = req.body.staff_response === undefined ? null : String(req.body.staff_response || '').trim();

  if (status && !STATUS_VALUES.has(status)) {
    return res.status(400).json({ success: false, message: 'Invalid support ticket status.' });
  }

  if (!status && staffResponse === null) {
    return res.status(400).json({ success: false, message: 'Status or response is required.' });
  }

  try {
    const [rows] = await pool.query(`SELECT id, status, staff_response FROM support_tickets WHERE id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    const nextStatus = status || rows[0].status;
    const nextResponse = staffResponse === null ? rows[0].staff_response : staffResponse;

    await pool.query(
      `UPDATE support_tickets
       SET status = COALESCE(?, status),
           staff_response = ?,
           resolved_at = CASE
             WHEN ? IN ('resolved', 'closed') THEN COALESCE(resolved_at, NOW())
             ELSE NULL
           END
       WHERE id = ?`,
      [status || null, nextResponse || null, nextStatus, req.params.id]
    );

    return res.status(200).json({ success: true, message: 'Support ticket updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update support ticket.' });
  }
};
