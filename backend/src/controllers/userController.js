const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.role_id, u.full_name, u.username, u.email, u.phone, u.status, u.created_at,
             r.name AS role_name
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      ORDER BY u.created_at DESC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load system users.' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name, description FROM roles ORDER BY id ASC`);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load roles.' });
  }
};

exports.createUser = async (req, res) => {
  const { role_id, full_name, username, email, password, phone } = req.body;

  if (!role_id || !full_name || !username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Role, name, username, email and password are required.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Email or username already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (role_id, full_name, username, email, password, phone, status, email_verified_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [role_id, full_name, username, email, hashedPassword, phone || null]
    );

    return res.status(201).json({ success: true, message: 'System user created successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to create user.' });
  }
};

exports.updateUser = async (req, res) => {
  const { role_id, full_name, email, phone, status, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let updateQuery = `UPDATE users SET role_id = ?, full_name = ?, email = ?, phone = ?, status = ?`;
    let params = [role_id, full_name, email, phone || null, status || 'active'];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = ?`;
      params.push(hashedPassword);
    }

    updateQuery += ` WHERE id = ?`;
    params.push(req.params.id);

    await pool.query(updateQuery, params);
    return res.status(200).json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update user.' });
  }
};

exports.deleteUser = async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to delete user.' });
  }
};
