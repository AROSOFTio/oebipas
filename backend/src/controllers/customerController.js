const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');
const bcrypt = require('bcrypt');

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
  if (!customer_number || !full_name || !email) {
    return res.status(400).json({ success: false, message: 'Missing required fields (Name, Number, Email)' });
  }

  try {
    let userId = null;
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      userId = existing[0].id;
    } else {
      // Create user account so they can log in
      const defaultPassword = await bcrypt.hash('Oebipas@123', 10);
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const username = baseUsername + Math.floor(100 + Math.random() * 900);
      
      const [userResult] = await pool.query(
        'INSERT INTO users (full_name, username, email, password, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
        [full_name, username, email, defaultPassword, phone, 'active']
      );
      userId = userResult.insertId;
      await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, 4]); // Customer role
    }

    const [result] = await pool.query(
      'INSERT INTO customers (user_id, customer_number, full_name, email, phone, address, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, customer_number, full_name, email, phone, address, category || 'residential', 'active']
    );

    await logAudit(req.user.id, 'CREATE_CUSTOMER', 'Customers', result.insertId, `Created customer ${customer_number} and user account if missing`);

    res.status(201).json({ success: true, message: 'Customer created successfully. Default password is Oebipas@123', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Customer number or Email already exists' });
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

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const [cust] = await pool.query('SELECT user_id FROM customers WHERE id = ?', [id]);
    if (cust.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Delete customer
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    
    // Delete user
    if (cust[0].user_id) {
       await pool.query('DELETE FROM users WHERE id = ?', [cust[0].user_id]);
    }

    await logAudit(req.user.id, 'DELETE_CUSTOMER', 'Customers', id, 'Deleted customer and their user account');

    res.status(200).json({ success: true, message: 'Customer completely deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
