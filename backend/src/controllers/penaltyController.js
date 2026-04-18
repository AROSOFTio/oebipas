const pool = require('../config/db');
const { applyAutomaticPenalties } = require('../services/automationService');

exports.getPenalties = async (req, res) => {
  try {
    await applyAutomaticPenalties();
    const [rows] = await pool.query(
      `SELECT p.*, b.bill_number, c.customer_number, c.full_name AS customer_name
       FROM penalties p
       INNER JOIN bills b ON b.id = p.bill_id
       INNER JOIN customers c ON c.id = p.customer_id
       ORDER BY p.created_at DESC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load penalties.' });
  }
};
