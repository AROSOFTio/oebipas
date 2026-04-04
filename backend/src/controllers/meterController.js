const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

exports.getMeters = async (req, res) => {
  try {
    const [meters] = await pool.query(`
      SELECT m.*, sc.connection_number, c.customer_number, c.full_name as customer_name
      FROM meters m
      JOIN service_connections sc ON m.service_connection_id = sc.id
      JOIN customers c ON m.customer_id = c.id
      ORDER BY m.created_at DESC
    `);
    res.status(200).json({ success: true, data: meters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createMeter = async (req, res) => {
  const { customer_id, service_connection_id, meter_number, installation_date } = req.body;
  if (!customer_id || !service_connection_id || !meter_number) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO meters (customer_id, service_connection_id, meter_number, installation_date) VALUES (?, ?, ?, ?)',
      [customer_id, service_connection_id, meter_number, installation_date]
    );

    await logAudit(req.user.id, 'CREATE_METER', 'Meters', result.insertId, `Registered meter ${meter_number}`);
    res.status(201).json({ success: true, message: 'Meter registered successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Meter number already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateMeter = async (req, res) => {
  const { id } = req.params;
  const { status, installation_date } = req.body;

  try {
    await pool.query(
      'UPDATE meters SET status = ?, installation_date = ? WHERE id = ?',
      [status, installation_date, id]
    );
    await logAudit(req.user.id, 'UPDATE_METER', 'Meters', id, `Updated meter status/details`);
    res.status(200).json({ success: true, message: 'Meter updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
