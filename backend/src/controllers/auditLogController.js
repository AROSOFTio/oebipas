const pool = require('../config/db');

exports.getAuditLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT a.*, u.full_name as user_name, u.username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Audit Logs Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
  }
};
