const pool = require('../config/db');
const { generateBillFromConsumption } = require('../services/billingService');

exports.getConsumptionRecords = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr.*, c.customer_number, c.full_name AS customer_name, c.meter_number
       FROM consumption_records cr
       INNER JOIN customers c ON c.id = cr.customer_id
       ORDER BY cr.billing_year DESC, cr.billing_month DESC, cr.created_at DESC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load consumption records.' });
  }
};

exports.getMyConsumption = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr.*
       FROM consumption_records cr
       INNER JOIN customers c ON c.id = cr.customer_id
       WHERE c.user_id = ?
       ORDER BY cr.billing_year DESC, cr.billing_month DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load your consumption history.' });
  }
};

exports.createConsumptionRecord = async (req, res) => {
  const { customer_id, billing_month, billing_year, units_consumed, reading_date } = req.body;

  if (!customer_id || !billing_month || !billing_year || units_consumed === undefined || !reading_date) {
    return res.status(400).json({ success: false, message: 'Customer, billing month, billing year, units consumed and reading date are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO consumption_records
        (customer_id, billing_month, billing_year, units_consumed, reading_date, entered_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_id, billing_month, billing_year, units_consumed, reading_date, req.user.id]
    );

    const bill = await generateBillFromConsumption({
      consumptionId: result.insertId,
      generatedBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Consumption saved and bill generated automatically.',
      data: { consumption_id: result.insertId, bill },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to save consumption record.' });
  }
};

exports.updateConsumptionRecord = async (req, res) => {
  const { units_consumed, reading_date } = req.body;

  try {
    const [rows] = await pool.query(`SELECT id FROM bills WHERE consumption_record_id = ? LIMIT 1`, [req.params.id]);
    if (rows.length) {
      return res.status(400).json({ success: false, message: 'Consumption cannot be edited after bill generation.' });
    }

    await pool.query(
      `UPDATE consumption_records SET units_consumed = ?, reading_date = ? WHERE id = ?`,
      [units_consumed, reading_date, req.params.id]
    );

    return res.status(200).json({ success: true, message: 'Consumption updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update consumption record.' });
  }
};
