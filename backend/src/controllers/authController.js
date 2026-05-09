const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { queueNotification } = require('../services/notificationService');
const { CUSTOMER_ROLE_NAME, normalizeRoleName, roleAliasesFor } = require('../utils/roles');

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

const cleanText = value => String(value || '').trim();
const normalizeIdentifier = value => cleanText(value).toLowerCase();

const isSchemaMismatch = error => ['ER_BAD_FIELD_ERROR', 'ER_NO_SUCH_TABLE'].includes(error?.code);

const buildUsernameBase = ({ username, email, meterNumber }) => {
  const preferred = cleanText(username) || cleanText(email).split('@')[0] || cleanText(meterNumber) || 'customer';
  return preferred.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 44) || 'customer';
};

const generateAvailableUsername = async (conn, values) => {
  const base = buildUsernameBase(values);

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}${index + 1}`;
    const [rows] = await conn.query(`SELECT id FROM users WHERE username = ? LIMIT 1`, [candidate]);
    if (!rows.length) {
      return candidate;
    }
  }

  return `${base}${Date.now()}`.slice(0, 50);
};

const findLoginUser = async identifier => {
  const normalizedIdentifier = normalizeIdentifier(identifier);

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.email, u.password, u.status, r.name AS role, c.id AS customer_id
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE LOWER(TRIM(u.email)) = ?
          OR LOWER(TRIM(u.username)) = ?
          OR LOWER(TRIM(c.customer_number)) = ?
          OR LOWER(TRIM(c.meter_number)) = ?
       LIMIT 1`,
      [normalizedIdentifier, normalizedIdentifier, normalizedIdentifier, normalizedIdentifier]
    );
    return rows;
  } catch (error) {
    if (!isSchemaMismatch(error)) {
      throw error;
    }
  }

  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.username, u.email, u.password, u.status, r.name AS role, c.id AS customer_id
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     LEFT JOIN customers c ON c.user_id = u.id
     LEFT JOIN meters m ON m.customer_id = c.id
     WHERE LOWER(TRIM(u.email)) = ?
        OR LOWER(TRIM(u.username)) = ?
        OR LOWER(TRIM(c.customer_number)) = ?
        OR LOWER(TRIM(m.meter_number)) = ?
     ORDER BY ur.role_id ASC
     LIMIT 1`,
    [normalizedIdentifier, normalizedIdentifier, normalizedIdentifier, normalizedIdentifier]
  );
  return rows;
};

const findUserById = async id => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.username, u.email, u.phone, r.name AS role, c.id AS customer_id
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [id]
    );
    return rows;
  } catch (error) {
    if (!isSchemaMismatch(error)) {
      throw error;
    }
  }

  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.username, u.email, u.phone, r.name AS role, c.id AS customer_id
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     LEFT JOIN customers c ON c.user_id = u.id
     WHERE u.id = ?
     ORDER BY ur.role_id ASC
     LIMIT 1`,
    [id]
  );
  return rows;
};

exports.meterLookup = async (req, res) => {
  const meterNumber = cleanText(req.params.meter_number);

  if (!meterNumber) {
    return res.status(400).json({ success: false, message: 'Meter number is required.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT customer_number, meter_number, full_name, email, phone, address, connection_status, user_id
       FROM customers
       WHERE meter_number = ?
       LIMIT 1`,
      [meterNumber]
    );

    if (!rows.length) {
      return res.status(200).json({
        success: true,
        found: false,
        registered: false,
        customer: null,
      });
    }

    const customer = rows[0];
    return res.status(200).json({
      success: true,
      found: true,
      registered: Boolean(customer.user_id),
      customer: {
        customer_number: customer.customer_number,
        meter_number: customer.meter_number,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        connection_status: customer.connection_status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to look up meter number.' });
  }
};

exports.register = async (req, res) => {
  const { username, email, password, phone, address, meter_number } = req.body;
  const fullName = cleanText(req.body.full_name || req.body.name);
  const meterNumber = cleanText(meter_number);
  const emailAddress = cleanText(email);

  if (!meterNumber || !fullName || !emailAddress || !password || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: 'Meter number, name, email, phone, address and password are required.',
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingUsers] = await conn.query(
      `SELECT id FROM users WHERE email = ?`,
      [emailAddress]
    );
    if (existingUsers.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Email is already in use.' });
    }

    const [[customerRole]] = await conn.query(
      `SELECT id FROM roles WHERE name IN (?) ORDER BY name = ? DESC, id ASC LIMIT 1`,
      [roleAliasesFor(CUSTOMER_ROLE_NAME), CUSTOMER_ROLE_NAME]
    );
    if (!customerRole) {
      await conn.rollback();
      return res.status(500).json({ success: false, message: 'Role not found.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const generatedUsername = await generateAvailableUsername(conn, {
      username,
      email: emailAddress,
      meterNumber,
    });

    const [existingCustomerRows] = await conn.query(
      `SELECT id, user_id FROM customers WHERE meter_number = ? LIMIT 1`,
      [meterNumber]
    );

    if (existingCustomerRows.length) {
      if (existingCustomerRows[0].user_id) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: 'This meter is already registered. Please login.' });
      }

      const [userResult] = await conn.query(
        `INSERT INTO users (role_id, full_name, username, email, password, phone, status, email_verified_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
        [customerRole.id, fullName, generatedUsername, emailAddress, hashedPassword, phone || null]
      );

      await conn.query(
        `UPDATE customers
         SET user_id = ?, full_name = ?, email = ?, phone = ?, address = ?
         WHERE id = ?`,
        [userResult.insertId, fullName, emailAddress, phone || null, address, existingCustomerRows[0].id]
      );

    } else {
      const [userResult] = await conn.query(
        `INSERT INTO users (role_id, full_name, username, email, password, phone, status, email_verified_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
        [customerRole.id, fullName, generatedUsername, emailAddress, hashedPassword, phone || null]
      );

      const [customerResult] = await conn.query(
        `INSERT INTO customers (user_id, customer_number, meter_number, full_name, email, phone, address, connection_status)
         VALUES (?, 'TEMP', ?, ?, ?, ?, ?, 'pending')`,
        [userResult.insertId, meterNumber, fullName, emailAddress, phone || null, address]
      );

      const customerNumber = `UEDCL-${String(customerResult.insertId).padStart(4, '0')}`;
      await conn.query(
        `UPDATE customers SET customer_number = ? WHERE id = ?`,
        [customerNumber, customerResult.insertId]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now login.',
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to register account.' });
  } finally {
    conn.release();
  }
};

exports.login = async (req, res) => {
  const identifier = cleanText(req.body.email || req.body.username || req.body.identifier);
  const { password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Email or username and password are required.' });
  }

  try {
    const rows = await findLoginUser(identifier);

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    const role = normalizeRoleName(user.role);

    if (!isMatch || user.status !== 'active' || !role) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials.' });
    }

    const token = signToken({ ...user, role });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role,
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
    const rows = await findUserById(req.user.id);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        ...rows[0],
        role: normalizeRoleName(rows[0].role),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to fetch account details.' });
  }
};
