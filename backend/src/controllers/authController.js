const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

exports.register = async (req, res) => {
  const { full_name, username, email, password, phone } = req.body;
  if (!full_name || !email || !password || !username) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email or Username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, username, email, password, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, username, email, hashedPassword, phone, 'active']
    );

    const userId = result.insertId;

    // Assign generic "Customer" role (ID 4 based on seed)
    await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, 4]);

    await logAudit(userId, 'REGISTER', 'Auth', userId, 'New user registered');

    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body; // 'email' from frontend is now representing either email or username
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing email/username or password' });
  }

  try {
    const [users] = await pool.query(`
      SELECT u.id, u.full_name, u.username, u.email, u.password, u.status, r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = ? OR u.username = ?
    `, [email, email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET || 'supersecretjwtkey2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await logAudit(user.id, 'LOGIN', 'Auth', user.id, 'User logged in');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Simulate forgot password
  res.status(200).json({ success: true, message: 'If the email exists, a reset link will be sent.' });
};

exports.resetPassword = async (req, res) => {
  const { token, new_password } = req.body;
  // Simulate reset password
  res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
