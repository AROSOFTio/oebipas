const pool = require('../config/db');

exports.getTariffs = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM tariffs ORDER BY effective_from DESC, id DESC`);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load tariffs.' });
  }
};

exports.updateTariff = async (req, res) => {
  const { rate_per_unit, fixed_charge, penalty_type, penalty_value, due_days } = req.body;

  if (!rate_per_unit || fixed_charge === undefined || !penalty_type || penalty_value === undefined || !due_days) {
    return res.status(400).json({ success: false, message: 'Rate, fixed charge, penalty type, penalty value and due days are required.' });
  }

  try {
    await pool.query(`UPDATE tariffs SET is_active = 0 WHERE is_active = 1`);
    const [result] = await pool.query(
      `INSERT INTO tariffs
        (rate_per_unit, fixed_charge, penalty_type, penalty_value, due_days, is_active, effective_from, created_by)
       VALUES (?, ?, ?, ?, ?, 1, CURDATE(), ?)`,
      [rate_per_unit, fixed_charge, penalty_type, penalty_value, due_days, req.user.id]
    );

    return res.status(201).json({ success: true, message: 'Tariff updated successfully.', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update tariff.' });
  }
};
