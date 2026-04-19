const bcrypt = require('bcrypt');
const pool = require('../config/db');

const buildCustomerQuery = `
  SELECT c.id, c.customer_number, c.meter_number, c.full_name, c.email, c.phone, c.address,
         c.connection_status, c.created_at, u.id AS user_id
  FROM customers c
  INNER JOIN users u ON u.id = c.user_id
`;

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(`${buildCustomerQuery} ORDER BY c.created_at DESC`);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load customers.' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const [rows] = await pool.query(`${buildCustomerQuery} WHERE c.id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customer = rows[0];
    const [bills] = await pool.query(
      `SELECT id, bill_number, billing_month, billing_year, total_amount, balance_due, status, due_date
       FROM bills
       WHERE customer_id = ?
       ORDER BY billing_year DESC, billing_month DESC`,
      [customer.id]
    );
    const [payments] = await pool.query(
      `SELECT id, payment_reference, amount, payment_method, status, payment_date
       FROM payments
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [customer.id]
    );

    return res.status(200).json({ success: true, data: { ...customer, bills, payments } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load customer details.' });
  }
};

exports.createCustomer = async (req, res) => {
  const { full_name, username, email, phone, address, meter_number } = req.body;

  if (!full_name || !username || !email || !address) {
    return res.status(400).json({ success: false, message: 'Full name, username, email and address are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      `SELECT id FROM users WHERE email = ? OR username = ?`,
      [email, username]
    );
    if (existing.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Email or username is already in use.' });
    }

    const [[role]] = await conn.query(`SELECT id FROM roles WHERE name = 'Customer' LIMIT 1`);
    const defaultPassword = await bcrypt.hash('Password123!', 10);

    const [userResult] = await conn.query(
      `INSERT INTO users (role_id, full_name, username, email, password, phone, status, email_verified_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [role.id, full_name, username, email, defaultPassword, phone || null]
    );

    const customerNumber = `UEDCL-${String(userResult.insertId).padStart(4, '0')}`;
    const [customerResult] = await conn.query(
      `INSERT INTO customers (user_id, customer_number, meter_number, full_name, email, phone, address, connection_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userResult.insertId, customerNumber, meter_number, full_name, email, phone || null, address]
    );

    await conn.commit();
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully. Default password is Password123!',
      data: { id: customerResult.insertId, customer_number: customerNumber },
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to create customer.' });
  } finally {
    conn.release();
  }
};

exports.updateCustomer = async (req, res) => {
  const { full_name, email, phone, address, meter_number, connection_status } = req.body;

  try {
    const [rows] = await pool.query(`SELECT user_id FROM customers WHERE id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query(
      `UPDATE customers
       SET full_name = ?, email = ?, phone = ?, address = ?, meter_number = ?, connection_status = ?
       WHERE id = ?`,
      [full_name, email, phone || null, address, meter_number, connection_status || 'active', req.params.id]
    );
    await pool.query(
      `UPDATE users
       SET full_name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [full_name, email, phone || null, rows[0].user_id]
    );

    return res.status(200).json({ success: true, message: 'Customer updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update customer.' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT user_id FROM customers WHERE id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query(`DELETE FROM users WHERE id = ?`, [rows[0].user_id]);
    return res.status(200).json({ success: true, message: 'Customer removed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to remove customer.' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(`${buildCustomerQuery} WHERE c.user_id = ? LIMIT 1`, [req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load customer profile.' });
  }
};

exports.updateMyProfile = async (req, res) => {
  const { full_name, phone, address } = req.body;

  try {
    const [rows] = await pool.query(`SELECT id FROM customers WHERE user_id = ? LIMIT 1`, [req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    await pool.query(
      `UPDATE customers SET full_name = ?, phone = ?, address = ? WHERE user_id = ?`,
      [full_name, phone || null, address, req.user.id]
    );
    await pool.query(
      `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`,
      [full_name, phone || null, req.user.id]
    );

    return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update profile.' });
  }
};
