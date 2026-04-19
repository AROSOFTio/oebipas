const pool = require('../config/db');

const buildCustomerQuery = `
  SELECT c.id, c.customer_number, c.meter_number, c.full_name, c.email, c.phone, c.address,
         c.connection_status, c.created_at, u.id AS user_id
  FROM customers c
  LEFT JOIN users u ON u.id = c.user_id
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
  const { full_name, email, phone, address, meter_number } = req.body;

  if (!full_name || !email || !address) {
    return res.status(400).json({ success: false, message: 'Full name, email and address are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingMeter] = await conn.query(
      `SELECT id FROM customers WHERE meter_number = ? AND meter_number IS NOT NULL`,
      [meter_number]
    );
    if (existingMeter.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Meter number is already assigned to a customer.' });
    }

    const [customerResult] = await conn.query(
      `INSERT INTO customers (user_id, customer_number, meter_number, full_name, email, phone, address, connection_status)
       VALUES (NULL, 'TEMP', ?, ?, ?, ?, ?, 'active')`,
      [meter_number || null, full_name, email, phone || null, address]
    );

    const customerNumber = `UEDCL-${String(customerResult.insertId).padStart(4, '0')}`;
    await conn.query(
      `UPDATE customers SET customer_number = ? WHERE id = ?`,
      [customerNumber, customerResult.insertId]
    );

    await conn.commit();
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
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

    if (meter_number) {
      const [duplicateMeter] = await pool.query(
        `SELECT id FROM customers WHERE meter_number = ? AND id != ?`,
        [meter_number, req.params.id]
      );
      if (duplicateMeter.length) {
        return res.status(400).json({ success: false, message: 'This meter number is already assigned to another customer.' });
      }
    }

    await pool.query(
      `UPDATE customers
       SET full_name = ?, email = ?, phone = ?, address = ?, meter_number = ?, connection_status = ?
       WHERE id = ?`,
      [full_name, email, phone || null, address, meter_number || null, connection_status || 'active', req.params.id]
    );
    
    if (rows[0].user_id) {
      await pool.query(
        `UPDATE users
         SET full_name = ?, email = ?, phone = ?
         WHERE id = ?`,
        [full_name, email, phone || null, rows[0].user_id]
      );
    }

    return res.status(200).json({ success: true, message: 'Customer updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update customer.' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, user_id FROM customers WHERE id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (rows[0].user_id) {
      await pool.query(`DELETE FROM users WHERE id = ?`, [rows[0].user_id]);
    } else {
      await pool.query(`DELETE FROM customers WHERE id = ?`, [rows[0].id]);
    }

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
