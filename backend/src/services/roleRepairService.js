const pool = require('../config/db');
const { ROLE_ALIASES } = require('../utils/roles');

const ROLE_DESCRIPTIONS = {
  'System administrator': 'Full control over the billing and system parameters',
  'Billing Officer': 'Operational role focusing on customer connections and bills',
  Customer: 'End user role for reviewing electricity output and payments',
};

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

const repairRoleLabels = async () => {
  const roleColumns = await getColumns('roles');
  if (!roleColumns.has('id') || !roleColumns.has('name')) {
    console.warn('[Startup] Role label repair skipped: unsupported roles schema.');
    return;
  }

  const userColumns = await getColumns('users');
  const hasUserRoleId = userColumns.has('role_id');
  const userRoleColumns = await getColumns('user_roles').catch(() => new Set());
  const hasUserRolesTable = userRoleColumns.has('user_id') && userRoleColumns.has('role_id');

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    for (const [canonicalName, aliases] of Object.entries(ROLE_ALIASES)) {
      const description = ROLE_DESCRIPTIONS[canonicalName];
      const [rows] = await conn.query(
        `SELECT id, name FROM roles WHERE name IN (?) ORDER BY id ASC FOR UPDATE`,
        [aliases]
      );

      if (!rows.length) {
        await conn.query(
          `INSERT INTO roles (name, description) VALUES (?, ?)`,
          [canonicalName, description]
        );
        continue;
      }

      let keeper = rows.find(row => row.name === canonicalName) || rows[0];

      if (keeper.name !== canonicalName) {
        const [existingCanonical] = await conn.query(
          `SELECT id, name FROM roles WHERE name = ? LIMIT 1 FOR UPDATE`,
          [canonicalName]
        );
        if (existingCanonical.length) {
          keeper = existingCanonical[0];
        } else {
          await conn.query(
            `UPDATE roles SET name = ?, description = ? WHERE id = ?`,
            [canonicalName, description, keeper.id]
          );
          keeper = { ...keeper, name: canonicalName };
        }
      } else {
        await conn.query(`UPDATE roles SET description = ? WHERE id = ?`, [description, keeper.id]);
      }

      const duplicateIds = rows.map(row => row.id).filter(id => id !== keeper.id);
      if (!duplicateIds.length) continue;

      if (hasUserRoleId) {
        await conn.query(`UPDATE users SET role_id = ? WHERE role_id IN (?)`, [keeper.id, duplicateIds]);
      }

      if (hasUserRolesTable) {
        await conn.query(
          `INSERT IGNORE INTO user_roles (user_id, role_id)
           SELECT user_id, ? FROM user_roles WHERE role_id IN (?)`,
          [keeper.id, duplicateIds]
        );
      }
    }

    await conn.commit();
    console.log('[Startup] Role labels are ready.');
  } catch (error) {
    await conn.rollback();
    console.error('[Startup] Role label repair failed:', error.message);
  } finally {
    conn.release();
  }
};

module.exports = {
  repairRoleLabels,
  ROLE_DESCRIPTIONS,
};
