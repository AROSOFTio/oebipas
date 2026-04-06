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
  const { period } = req.query; // 6m, 1y, all
  
  try {
    let query = `
      SELECT cr.*, m.meter_number
      FROM consumption_records cr
      JOIN meters m ON cr.meter_id = m.id
      WHERE cr.customer_id = ?
    `;
    const params = [customer_id];

    if (period === '6m') {
      query += ' AND cr.reading_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
    } else if (period === '1y') {
      query += ' AND cr.reading_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    }

    query += ' ORDER BY cr.billing_year DESC, cr.billing_month DESC';
    
    const [records] = await pool.query(query, params);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const { internalGenerateBill } = require('./billController');

exports.createConsumptionRecord = async (req, res) => {
  const { customer_id, meter_id, billing_month, billing_year, units_consumed, reading_date } = req.body;
  
  if (!customer_id || !meter_id || !billing_month || !billing_year || units_consumed === undefined || !reading_date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert consumption record
    const [result] = await conn.query(
      'INSERT INTO consumption_records (customer_id, meter_id, billing_month, billing_year, units_consumed, reading_date, entered_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_id, meter_id, billing_month, billing_year, units_consumed, reading_date, req.user.id]
    );

    await logAudit(req.user.id, 'CREATE_CONSUMPTION', 'Consumption', result.insertId, `Logged ${units_consumed} units for meter ${meter_id}`);

    // 2. AUTO-GENERATE BILL IMMEDIATELY
    let billSummary = null;
    try {
      billSummary = await internalGenerateBill({
        customer_id,
        meter_id,
        billing_month,
        billing_year,
        userId: req.user.id
      }, conn);
    } catch (billError) {
      // If bill generation fails (e.g. no tariff found), we fail the whole transaction 
      // because the user wants "Automated Invoice Generation" - no reading without a bill.
      console.error('Auto-bill error:', billError);
      throw new Error(`Consumption logged but invoice auto-generation failed: ${billError.message}`);
    }

    await conn.commit();

    res.status(201).json({ 
      success: true, 
      message: 'Consumption recorded and Invoice generated automatically', 
      data: { 
        consumption_id: result.insertId,
        bill: billSummary
      } 
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  } finally {
    conn.release();
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
