const pool = require('../config/db');

/**
 * Logs an action to the audit_logs table
 * @param {Number} userId - ID of the user performing the action
 * @param {String} action - Description of the action (e.g., 'LOGIN', 'CREATE_CUSTOMER')
 * @param {String} module - Module affected (e.g., 'Auth', 'Customers')
 * @param {Number|null} entityId - ID of the altered entity, if any
 * @param {String|null} details - Extra JSON or text details
 */
const logAudit = async (userId, action, module_name, entityId = null, details = null) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, module, entity_id, details) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(query, [userId, action, module_name, entityId, details]);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

module.exports = { logAudit };
