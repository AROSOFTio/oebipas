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

exports.createTariff = async (req, res) => {
  const { rate_per_unit, fixed_charge, penalty_value, due_days } = req.body;

  if (!rate_per_unit || fixed_charge === undefined || penalty_value === undefined || !due_days) {
    return res.status(400).json({ success: false, message: 'Rate, fixed charge, penalty percentage and due days are required.' });
  }

  try {
    await pool.query(`UPDATE tariffs SET is_active = 0 WHERE is_active = 1`);
    const [result] = await pool.query(
      `INSERT INTO tariffs
        (rate_per_unit, fixed_charge, penalty_type, penalty_value, due_days, is_active, effective_from, created_by)
       VALUES (?, ?, ?, ?, ?, 1, CURDATE(), ?)`,
      [rate_per_unit, fixed_charge, 'percentage', penalty_value, due_days, req.user.id]
    );

    return res.status(201).json({ success: true, message: 'Tariff created successfully.', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to create tariff.' });
  }
};

exports.updateTariff = async (req, res) => {
  const { rate_per_unit, fixed_charge, penalty_value, due_days, is_active } = req.body;

  if (!rate_per_unit || fixed_charge === undefined || penalty_value === undefined || !due_days) {
    return res.status(400).json({ success: false, message: 'Rate, fixed charge, penalty percentage and due days are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (Number(is_active) === 1) {
      await conn.query(`UPDATE tariffs SET is_active = 0 WHERE is_active = 1 AND id <> ?`, [req.params.id]);
    }

    await conn.query(
      `UPDATE tariffs
       SET rate_per_unit = ?, fixed_charge = ?, penalty_type = 'percentage', penalty_value = ?, due_days = ?, is_active = ?
       WHERE id = ?`,
      [rate_per_unit, fixed_charge, penalty_value, due_days, Number(is_active) === 1 ? 1 : 0, req.params.id]
    );

    await conn.commit();
    return res.status(200).json({ success: true, message: 'Tariff updated successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to update tariff.' });
  } finally {
    conn.release();
  }
};

exports.deleteTariff = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, is_active FROM tariffs WHERE id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Tariff not found.' });
    }

    if (rows[0].is_active) {
      return res.status(400).json({ success: false, message: 'Active tariff cannot be deleted. Edit it or activate another tariff first.' });
    }

    await pool.query(`DELETE FROM tariffs WHERE id = ?`, [req.params.id]);
    return res.status(200).json({ success: true, message: 'Tariff deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to delete tariff.' });
  }
};
