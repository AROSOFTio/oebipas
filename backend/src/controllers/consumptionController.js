const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

exports.getConsumptionRecords = async (req, res) => {
  try {
    const [records] = await pool.query(`
      SELECT cr.*, c.customer_number, c.full_name as customer_name, m.meter_number
      FROM consumption_records cr
      JOIN customers c ON cr.customer_id = c.id
      JOIN meters m ON cr.meter_id = m.id
      ORDER BY cr.reading_date DESC, cr.created_at DESC
    `);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getCustomerConsumption = async (req, res) => {
  const { customer_id } = req.params;
  try {
    const [records] = await pool.query(`
      SELECT cr.*, m.meter_number
      FROM consumption_records cr
      JOIN meters m ON cr.meter_id = m.id
      WHERE cr.customer_id = ?
      ORDER BY cr.billing_year DESC, cr.billing_month DESC
    `, [customer_id]);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createConsumptionRecord = async (req, res) => {
  const { customer_id, meter_id, billing_month, billing_year, units_consumed, reading_date } = req.body;
  
  if (!customer_id || !meter_id || !billing_month || !billing_year || units_consumed === undefined || !reading_date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO consumption_records (customer_id, meter_id, billing_month, billing_year, units_consumed, reading_date, entered_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_id, meter_id, billing_month, billing_year, units_consumed, reading_date, req.user.id]
    );

    await logAudit(req.user.id, 'CREATE_CONSUMPTION', 'Consumption', result.insertId, `Logged ${units_consumed} units for meter ${meter_id}`);
    res.status(201).json({ success: true, message: 'Consumption recorded successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateConsumptionRecord = async (req, res) => {
  const { id } = req.params;
  const { units_consumed, reading_date } = req.body;

  try {
    await pool.query(
      'UPDATE consumption_records SET units_consumed = ?, reading_date = ? WHERE id = ?',
      [units_consumed, reading_date, id]
    );
    await logAudit(req.user.id, 'UPDATE_CONSUMPTION', 'Consumption', id, `Updated consumption reading to ${units_consumed}`);
    res.status(200).json({ success: true, message: 'Consumption record updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
