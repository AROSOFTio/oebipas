const pool = require('../config/db');
const { applyAutomaticPenalties } = require('../services/automationService');

const baseBillQuery = `
  SELECT b.*, c.customer_number, c.full_name AS customer_name, c.meter_number
  FROM bills b
  INNER JOIN customers c ON c.id = b.customer_id
`;

exports.getBills = async (req, res) => {
  try {
    await applyAutomaticPenalties();
    const [rows] = await pool.query(`${baseBillQuery} ORDER BY b.created_at DESC`);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load bills.' });
  }
};

exports.getBillById = async (req, res) => {
  try {
    await applyAutomaticPenalties();
    const [rows] = await pool.query(`${baseBillQuery} WHERE b.id = ? LIMIT 1`, [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    const bill = rows[0];
    if (req.user.role === 'Customer' && req.user.customer_id !== bill.customer_id) {
      return res.status(403).json({ success: false, message: 'You cannot access another customer bill.' });
    }

    return res.status(200).json({ success: true, data: bill });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load bill details.' });
  }
};

exports.getMyBills = async (req, res) => {
  try {
    await applyAutomaticPenalties();
    const [rows] = await pool.query(
      `${baseBillQuery} WHERE b.customer_id = ? ORDER BY b.billing_year DESC, b.billing_month DESC`,
      [req.user.customer_id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load your bills.' });
  }
};
