const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { logAudit } = require('../services/auditLogger');

exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.full_name, u.username, u.email, u.phone, u.status, u.created_at, r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createUser = async (req, res) => {
  const { full_name, username, email, password, phone, role_id } = req.body;
  if (!full_name || !email || !password || !role_id || !username) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, username, email, password, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, username, email, hashedPassword, phone, 'active']
    );

    const userId = result.insertId;
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, role_id]);

    // If role is Customer (ID 4), auto-create customer profile
    if (Number(role_id) === 4) {
      const customerNumber = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
      await pool.query(
        'INSERT INTO customers (user_id, customer_number, full_name, email, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, customerNumber, full_name, email, phone, 'active']
      );
    }

    await logAudit(req.user.id, 'CREATE_USER', 'Users', userId, `Created user ${email} ${Number(role_id) === 4 ? 'with customer profile' : ''}`);

    res.status(201).json({ success: true, message: 'User created successfully', data: { id: userId } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email or Username already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, phone, status, role_id } = req.body;

  try {
    await pool.query(
      'UPDATE users SET full_name = ?, phone = ?, status = ? WHERE id = ?',
      [full_name, phone, status, id]
    );

    if (role_id) {
      await pool.query('UPDATE user_roles SET role_id = ? WHERE user_id = ?', [role_id, id]);
    }

    await logAudit(req.user.id, 'UPDATE_USER', 'Users', id, `Updated user ${id}`);

    res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (Number(id) === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }

  try {
    const [rows] = await pool.query('SELECT email FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    await logAudit(req.user.id, 'DELETE_USER', 'Users', id, `Deleted user ${rows[0].email}`);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
