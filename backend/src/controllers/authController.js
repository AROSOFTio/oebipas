const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { queueNotification } = require('../services/notificationService');

const signToken = user =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
      customer_id: user.customer_id || null,
    },
    process.env.JWT_SECRET || 'supersecretjwtkey2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

exports.register = async (req, res) => {
  const { full_name, username, email, password, phone, address } = req.body;

  if (!full_name || !username || !email || !password || !address) {
    return res.status(400).json({ success: false, message: 'Full name, username, email, password and address are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingUsers] = await conn.query(
      `SELECT id FROM users WHERE email = ? OR username = ?`,
      [email, username]
    );
    if (existingUsers.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Email or username is already in use.' });
    }

    const [[customerRole]] = await conn.query(`SELECT id FROM roles WHERE name = 'Customer' LIMIT 1`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await conn.query(
      `INSERT INTO users (role_id, full_name, username, email, password, phone, status, email_verified_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [customerRole.id, full_name, username, email, hashedPassword, phone || null]
    );

    const customerNumber = `UEDCL-${String(userResult.insertId).padStart(4, '0')}`;
    await conn.query(
      `INSERT INTO customers (user_id, customer_number, full_name, email, phone, address, connection_status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [userResult.insertId, customerNumber, full_name, email, phone || null, address]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Customer account created successfully.',
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to register customer account.' });
  } finally {
    conn.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email or username and password are required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.email, u.password, u.status, r.name AS role, c.id AS customer_id
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.email = ? OR u.username = ?
       LIMIT 1`,
      [email, email]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch || user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Invalid login credentials.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        customer_id: user.customer_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to complete login.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.full_name, c.id AS customer_id, c.phone
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    const user = rows[0];
    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await pool.query(`UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL`, [user.id]);
    await pool.query(
      `INSERT INTO password_resets (user_id, email, token_hash, expires_at)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))`,
      [user.id, user.email, tokenHash]
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    await queueNotification({
      userId: user.id,
      customerId: user.customer_id,
      type: 'password_reset',
      title: 'Password reset request',
      message: `Use this password reset link to verify your email and reset your password: ${resetLink}`,
      recipientEmail: user.email,
      recipientPhone: user.phone || null,
    });

    return res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
      reset_token: rawToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to process password reset request.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await pool.query(
      `SELECT * FROM password_resets
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'This password reset token is invalid or expired.' });
    }

    const resetRecord = rows[0];
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(`UPDATE users SET password = ?, email_verified_at = NOW() WHERE id = ?`, [hashedPassword, resetRecord.user_id]);
    await pool.query(`UPDATE password_resets SET used_at = NOW() WHERE id = ?`, [resetRecord.id]);

    return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to reset password.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.email, u.phone, r.name AS role, c.id AS customer_id
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    return res.status(200).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch account details.' });
  }
};
