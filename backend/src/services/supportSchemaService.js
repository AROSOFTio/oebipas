const pool = require('../config/db');

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

const ensureSupportTicketResponseAudit = async () => {
  const columns = await getColumns('support_tickets');

  if (!columns.has('responded_by')) {
    await pool.query(
      `ALTER TABLE support_tickets
       ADD COLUMN responded_by INT NULL AFTER staff_response`
    );
  }

  if (!columns.has('responded_at')) {
    await pool.query(
      `ALTER TABLE support_tickets
       ADD COLUMN responded_at DATETIME NULL AFTER responded_by`
    );
  }

  console.log('[Startup] Support ticket response audit columns are ready.');
};

module.exports = {
  ensureSupportTicketResponseAudit,
};
