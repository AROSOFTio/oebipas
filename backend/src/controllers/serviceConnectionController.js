const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

exports.getConnections = async (req, res) => {
  try {
    const [connections] = await pool.query(`
      SELECT sc.*, c.customer_number, c.full_name as customer_name
      FROM service_connections sc
      JOIN customers c ON sc.customer_id = c.id
      ORDER BY sc.created_at DESC
    `);
    res.status(200).json({ success: true, data: connections });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createConnection = async (req, res) => {
  const { customer_id, connection_number, connection_type, location } = req.body;
  if (!customer_id || !connection_number) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO service_connections (customer_id, connection_number, connection_type, location) VALUES (?, ?, ?, ?)',
      [customer_id, connection_number, connection_type, location]
    );

    await logAudit(req.user.id, 'CREATE_CONNECTION', 'Service Connections', result.insertId, `Created connection ${connection_number}`);
    res.status(201).json({ success: true, message: 'Connection created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Connection number already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateConnection = async (req, res) => {
  const { id } = req.params;
  const { connection_type, location, status } = req.body;

  try {
    await pool.query(
      'UPDATE service_connections SET connection_type = ?, location = ?, status = ? WHERE id = ?',
      [connection_type, location, status, id]
    );
    await logAudit(req.user.id, 'UPDATE_CONNECTION', 'Service Connections', id, `Updated connection details`);
    res.status(200).json({ success: true, message: 'Connection updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
