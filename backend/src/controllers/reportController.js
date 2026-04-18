const pool = require('../config/db');
const { applyAutomaticPenalties } = require('../services/automationService');

exports.getDailyRevenue = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(payment_date) AS report_date, COALESCE(SUM(amount), 0) AS total_revenue
       FROM payments
       WHERE status = 'successful'
       GROUP BY DATE(payment_date)
       ORDER BY report_date DESC
       LIMIT 14`
    );

    return res.status(200).json({ success: true, data: rows.reverse() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load daily revenue report.' });
  }
};

exports.getMonthlyBillingSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT billing_year, billing_month,
              COUNT(*) AS bills_generated,
              COALESCE(SUM(total_amount), 0) AS total_billed,
              COALESCE(SUM(amount_paid), 0) AS total_paid
       FROM bills
       GROUP BY billing_year, billing_month
       ORDER BY billing_year DESC, billing_month DESC
       LIMIT 12`
    );

    return res.status(200).json({ success: true, data: rows.reverse() });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load monthly billing summary.' });
  }
};

exports.getOutstandingPayments = async (req, res) => {
  try {
    await applyAutomaticPenalties();
    const [rows] = await pool.query(
      `SELECT c.customer_number, c.full_name AS customer_name, b.bill_number, b.balance_due, b.status, b.due_date
       FROM bills b
       INNER JOIN customers c ON c.id = b.customer_id
       WHERE b.balance_due > 0
       ORDER BY b.due_date ASC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load outstanding payments report.' });
  }
};
