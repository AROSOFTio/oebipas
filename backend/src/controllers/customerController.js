const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

// Customer looks up their own profile via their user_id (JWT)
exports.getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.* FROM customers c WHERE c.user_id = ? LIMIT 1`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(200).json({ success: true, linked: false, message: 'No customer profile linked to this account.' });
    }
    res.status(200).json({ success: true, linked: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT c.id, c.customer_number, c.full_name, c.email, c.phone, c.address, c.category, c.status, u.id as user_id
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createCustomer = async (req, res) => {
  const { customer_number, full_name, email, phone, address, category } = req.body;
  if (!customer_number || !full_name) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO customers (customer_number, full_name, email, phone, address, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_number, full_name, email, phone, address, category || 'residential', 'active']
    );

    await logAudit(req.user.id, 'CREATE_CUSTOMER', 'Customers', result.insertId, `Created customer ${customer_number}`);

    res.status(201).json({ success: true, message: 'Customer created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Customer number already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, address, category } = req.body;

  try {
    await pool.query(
      'UPDATE customers SET full_name = ?, email = ?, phone = ?, address = ?, category = ? WHERE id = ?',
      [full_name, email, phone, address, category, id]
    );

    await logAudit(req.user.id, 'UPDATE_CUSTOMER', 'Customers', id, `Updated customer details`);

    res.status(200).json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' or 'inactive'

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    await pool.query('UPDATE customers SET status = ? WHERE id = ?', [status, id]);

    await logAudit(req.user.id, 'UPDATE_CUSTOMER_STATUS', 'Customers', id, `Customer status changed to ${status}`);

    res.status(200).json({ success: true, message: `Customer marked as ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
