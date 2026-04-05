const pool = require('../config/db');
const { logAudit } = require('../services/auditLogger');

exports.getTariffs = async (req, res) => {
  try {
    const [tariffs] = await pool.query('SELECT * FROM tariff_rules ORDER BY effective_from DESC');
    res.status(200).json({ success: true, data: tariffs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.createTariff = async (req, res) => {
  const { customer_category, rate_per_unit, service_charge, tax_percent, penalty_type, penalty_value, effective_from } = req.body;
  if (!customer_category || !rate_per_unit || !effective_from) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tariff_rules (customer_category, rate_per_unit, service_charge, tax_percent, penalty_type, penalty_value, effective_from) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_category, rate_per_unit, service_charge || 0, tax_percent || 0, penalty_type || 'percentage', penalty_value || 0, effective_from]
    );
    await logAudit(req.user.id, 'CREATE_TARIFF', 'Tariffs', result.insertId, `Created ${customer_category} tariff at ${rate_per_unit}/unit`);
    res.status(201).json({ success: true, message: 'Tariff created', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateTariff = async (req, res) => {
  const { id } = req.params;
  const { rate_per_unit, service_charge, tax_percent, penalty_type, penalty_value, status } = req.body;
  try {
    await pool.query(
      'UPDATE tariff_rules SET rate_per_unit = ?, service_charge = ?, tax_percent = ?, penalty_type = ?, penalty_value = ?, status = ? WHERE id = ?',
      [rate_per_unit, service_charge, tax_percent, penalty_type, penalty_value, status, id]
    );
    await logAudit(req.user.id, 'UPDATE_TARIFF', 'Tariffs', id, 'Updated tariff rule');
    res.status(200).json({ success: true, message: 'Tariff updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.deleteTariff = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tariff_rules WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Tariff not found' });
    }
    await logAudit(req.user.id, 'DELETE_TARIFF', 'Tariffs', id, `Deleted tariff rule ${id}`);
    res.status(200).json({ success: true, message: 'Tariff deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
