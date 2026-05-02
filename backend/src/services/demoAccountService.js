const pool = require('../config/db');

const DEFAULT_PASSWORD_HASH = '$2b$12$Tp6hNAVpcD4DBKLOGMcdBuBkXrPiAlJIeKUirwUrKELtyUY8p1QIG'; // Password123!

const CURRENT_ROLES = [
  ['System administrators', 'Full control over the billing and system parameters'],
  ['Billing officers', 'Operational role focusing on customer connections and bills'],
  ['Electricity consumers', 'End user role for reviewing electricity output and payments'],
];

const LEGACY_ROLE_NAMES = {
  'System administrators': 'Super Admin',
  'Billing officers': 'Billing Officer',
  'Electricity consumers': 'Customer',
};

const DEMO_ACCOUNTS = [
  {
    role: 'System administrators',
    fullName: 'Winnie Nafuna',
    username: 'winnie',
    email: 'winniemarkie@gmail.com',
    phone: '0700000001',
  },
  {
    role: 'Billing officers',
    fullName: 'Nimusiima Sylon',
    username: 'sylon',
    email: 'nsylon256@gmail.com',
    phone: '0700000002',
  },
  {
    role: 'Electricity consumers',
    fullName: 'Benjamin Angella',
    username: 'benjamin',
    email: 'bangella23@gmail.com',
    phone: '0700000003',
    customer: {
      customerNumber: 'UEDCL-0001',
      meterNumber: 'MTR-0001',
      address: 'Kampala Central Division',
    },
  },
];

const getColumns = async tableName => {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?`,
    [tableName]
  );

  return new Set(rows.map(row => row.COLUMN_NAME));
};

const getRoleId = async (conn, roleName, legacy = false) => {
  const desiredName = legacy ? LEGACY_ROLE_NAMES[roleName] : roleName;
  const description = CURRENT_ROLES.find(([name]) => name === roleName)?.[1] || roleName;

  await conn.query(
    `INSERT INTO roles (name, description)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE description = VALUES(description)`,
    [desiredName, description]
  );

  const [[role]] = await conn.query(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [desiredName]);
  return role.id;
};

const upsertCurrentUser = async (conn, account, roleId) => {
  const [existing] = await conn.query(
    `SELECT id FROM users
     WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
     LIMIT 1`,
    [account.username, account.email]
  );

  if (existing.length) {
    const userId = existing[0].id;
    const [[usernameConflict]] = await conn.query(
      `SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id <> ? LIMIT 1`,
      [account.username, userId]
    );
    const [[emailConflict]] = await conn.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id <> ? LIMIT 1`,
      [account.email, userId]
    );
    const updates = [
      'role_id = ?',
      'full_name = ?',
      'password = ?',
      'phone = ?',
      "status = 'active'",
      'email_verified_at = COALESCE(email_verified_at, NOW())',
    ];
    const params = [roleId, account.fullName, DEFAULT_PASSWORD_HASH, account.phone];

    if (!usernameConflict) {
      updates.push('username = ?');
      params.push(account.username);
    }

    if (!emailConflict) {
      updates.push('email = ?');
      params.push(account.email);
    }

    params.push(userId);
    await conn.query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = ?`,
      params
    );
    return userId;
  }

  const [result] = await conn.query(
    `INSERT INTO users (role_id, full_name, username, email, password, phone, status, email_verified_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
    [roleId, account.fullName, account.username, account.email, DEFAULT_PASSWORD_HASH, account.phone]
  );
  return result.insertId;
};

const ensureCurrentCustomer = async (conn, account, userId) => {
  if (!account.customer) return;

  const [existing] = await conn.query(
    `SELECT id FROM customers
     WHERE user_id = ?
        OR customer_number = ?
        OR meter_number = ?
        OR LOWER(email) = LOWER(?)
     LIMIT 1`,
    [userId, account.customer.customerNumber, account.customer.meterNumber, account.email]
  );

  if (existing.length) {
    await conn.query(
      `UPDATE customers
       SET user_id = ?,
           customer_number = ?,
           meter_number = ?,
           full_name = ?,
           email = ?,
           phone = ?,
           address = ?,
           connection_status = 'active'
       WHERE id = ?`,
      [
        userId,
        account.customer.customerNumber,
        account.customer.meterNumber,
        account.fullName,
        account.email,
        account.phone,
        account.customer.address,
        existing[0].id,
      ]
    );
    return;
  }

  await conn.query(
    `INSERT INTO customers (user_id, customer_number, meter_number, full_name, email, phone, address, connection_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
    [
      userId,
      account.customer.customerNumber,
      account.customer.meterNumber,
      account.fullName,
      account.email,
      account.phone,
      account.customer.address,
    ]
  );
};

const upsertLegacyUser = async (conn, account, roleId) => {
  const [existing] = await conn.query(
    `SELECT id FROM users
     WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
     LIMIT 1`,
    [account.username, account.email]
  );

  if (existing.length) {
    const userId = existing[0].id;
    const [[usernameConflict]] = await conn.query(
      `SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id <> ? LIMIT 1`,
      [account.username, userId]
    );
    const [[emailConflict]] = await conn.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id <> ? LIMIT 1`,
      [account.email, userId]
    );
    const updates = [
      'full_name = ?',
      'password = ?',
      'phone = ?',
      "status = 'active'",
    ];
    const params = [account.fullName, DEFAULT_PASSWORD_HASH, account.phone];

    if (!usernameConflict) {
      updates.push('username = ?');
      params.push(account.username);
    }

    if (!emailConflict) {
      updates.push('email = ?');
      params.push(account.email);
    }

    params.push(userId);
    await conn.query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = ?`,
      params
    );
    await conn.query(
      `INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [userId, roleId]
    );
    return userId;
  }

  const [result] = await conn.query(
    `INSERT INTO users (full_name, username, email, password, phone, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [account.fullName, account.username, account.email, DEFAULT_PASSWORD_HASH, account.phone]
  );
  await conn.query(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [result.insertId, roleId]);
  return result.insertId;
};

const ensureLegacyCustomer = async (conn, account, userId, customerColumns) => {
  if (!account.customer) return;

  const [existing] = await conn.query(
    `SELECT id FROM customers
     WHERE user_id = ?
        OR customer_number = ?
        OR LOWER(email) = LOWER(?)
     LIMIT 1`,
    [userId, account.customer.customerNumber, account.email]
  );

  const statusColumn = customerColumns.has('connection_status') ? 'connection_status' : 'status';

  if (existing.length) {
    await conn.query(
      `UPDATE customers
       SET user_id = ?,
           customer_number = ?,
           full_name = ?,
           email = ?,
           phone = ?,
           address = ?,
           ${statusColumn} = 'active'
       WHERE id = ?`,
      [userId, account.customer.customerNumber, account.fullName, account.email, account.phone, account.customer.address, existing[0].id]
    );
    return;
  }

  await conn.query(
    `INSERT INTO customers (user_id, customer_number, full_name, email, phone, address, ${statusColumn})
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [userId, account.customer.customerNumber, account.fullName, account.email, account.phone, account.customer.address]
  );
};

const ensureDemoAccounts = async () => {
  if (String(process.env.OEBIPAS_REPAIR_DEMO_ACCOUNTS || 'true').toLowerCase() === 'false') {
    return;
  }

  const userColumns = await getColumns('users');
  const customerColumns = await getColumns('customers');
  const hasCurrentRoles = userColumns.has('role_id');
  const hasLegacyRoles = !hasCurrentRoles && (await getColumns('user_roles')).size > 0;

  if (!hasCurrentRoles && !hasLegacyRoles) {
    console.warn('[Startup] Demo account repair skipped: unsupported users/roles schema.');
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const [name, description] of CURRENT_ROLES) {
      const roleName = hasLegacyRoles ? LEGACY_ROLE_NAMES[name] : name;
      await conn.query(
        `INSERT INTO roles (name, description)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [roleName, description]
      );
    }

    const customerRepairs = [];

    for (const account of DEMO_ACCOUNTS) {
      const roleId = await getRoleId(conn, account.role, hasLegacyRoles);
      const userId = hasCurrentRoles
        ? await upsertCurrentUser(conn, account, roleId)
        : await upsertLegacyUser(conn, account, roleId);

      if (account.customer) {
        customerRepairs.push({ account, userId });
      }
    }

    await conn.commit();

    for (const repair of customerRepairs) {
      try {
        if (hasCurrentRoles) {
          await ensureCurrentCustomer(conn, repair.account, repair.userId);
        } else {
          await ensureLegacyCustomer(conn, repair.account, repair.userId, customerColumns);
        }
      } catch (error) {
        console.warn(`[Startup] Demo customer profile repair skipped for ${repair.account.username}: ${error.message}`);
      }
    }

    console.log('[Startup] Demo login accounts are ready. Default password: Password123!');
  } catch (error) {
    await conn.rollback();
    console.error('[Startup] Demo account repair failed:', error.message);
  } finally {
    conn.release();
  }
};

module.exports = {
  ensureDemoAccounts,
};
