const pool = require('../config/db');
const { applyAutomaticPenalties } = require('../services/automationService');
const { reconcilePendingPayments } = require('../services/paymentSettlementService');

exports.getDashboard = async (req, res) => {
  try {
    await applyAutomaticPenalties();

    if (req.user.role === 'Customer') {
      await reconcilePendingPayments({ customerId: req.user.customer_id });

      const [[totals]] = await pool.query(
        `SELECT COALESCE(SUM(balance_due), 0) AS outstanding_balance,
                COUNT(*) AS total_bills
         FROM bills
         WHERE customer_id = ?`,
        [req.user.customer_id]
      );
      const [recentBills] = await pool.query(
        `SELECT bill_number, total_amount, balance_due, status, due_date
         FROM bills
         WHERE customer_id = ?
         ORDER BY billing_year DESC, billing_month DESC
         LIMIT 5`,
        [req.user.customer_id]
      );
      const [recentPayments] = await pool.query(
        `SELECT payment_reference, amount, status, payment_date
         FROM payments
         WHERE customer_id = ?
         ORDER BY created_at DESC
         LIMIT 5`,
        [req.user.customer_id]
      );
      const [notifications] = await pool.query(
        `SELECT title, message, status, created_at
         FROM notifications
         WHERE customer_id = ?
         ORDER BY created_at DESC
         LIMIT 5`,
        [req.user.customer_id]
      );

      return res.status(200).json({
        success: true,
        data: {
          summary: totals,
          recentBills,
          recentPayments,
          notifications,
        },
      });
    }

    await reconcilePendingPayments();

    const [[summary]] = await pool.query(
      `SELECT
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'successful') AS total_revenue,
        (SELECT COALESCE(SUM(balance_due), 0) FROM bills WHERE balance_due > 0) AS outstanding_balances,
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM bills WHERE status = 'overdue') AS overdue_bills`
    );

    const [recentActivity] = await pool.query(
      `SELECT 'Bill Generated' AS activity_type, bill_number AS reference, created_at
       FROM bills
       UNION ALL
       SELECT 'Payment Recorded' AS activity_type, payment_reference AS reference, created_at
       FROM payments
       ORDER BY created_at DESC
       LIMIT 8`
    );

    const [recentBills] = await pool.query(
      `SELECT bill_number, customer_id, total_amount, balance_due, status, due_date
       FROM bills
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const [recentPayments] = await pool.query(
      `SELECT payment_reference, customer_id, amount, status, payment_date
       FROM payments
       ORDER BY created_at DESC
       LIMIT 5`
    );

    return res.status(200).json({
      success: true,
      data: {
        summary,
        recentActivity,
        recentBills,
        recentPayments,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Unable to load dashboard data.' });
  }
};
