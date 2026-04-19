const pool = require('../config/db');
const automationService = require('../services/automationService');
const paymentSettlementService = require('../services/paymentSettlementService');
const { isCustomerRole } = require('../utils/roles');

exports.getDashboard = async (req, res) => {
  try {
    await automationService.applyAutomaticPenalties();

    if (isCustomerRole(req.user.role)) {
      await paymentSettlementService.reconcilePendingPayments({ customerId: req.user.customer_id });

      const [[totals]] = await pool.query(
        `SELECT COUNT(*) AS total_bills,
                COALESCE(SUM(balance_due), 0) AS outstanding_balance,
                COALESCE(SUM(amount_paid), 0) AS total_paid_amount,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) AS paid_bills,
                COALESCE(SUM(CASE WHEN status <> 'paid' THEN 1 ELSE 0 END), 0) AS pending_bills
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
         ORDER BY COALESCE(payment_date, created_at) DESC, created_at DESC
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

      console.info(
        `[Dashboard] Customer ${req.user.customer_id} summary loaded: outstanding=${totals.outstanding_balance}, totalBills=${totals.total_bills}, totalPaid=${totals.total_paid_amount}.`
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

    await paymentSettlementService.reconcilePendingPayments();

    const [[summary]] = await pool.query(
      `SELECT
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'successful') AS total_revenue,
        (SELECT COALESCE(SUM(balance_due), 0) FROM bills WHERE balance_due > 0) AS outstanding_balances,
        (SELECT COUNT(*) FROM bills) AS total_bills,
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM bills WHERE status = 'overdue') AS overdue_bills`
    );

    const [recentActivity] = await pool.query(
      `SELECT 'Bill Generated' AS activity_type, bill_number AS reference, created_at
       FROM bills
       UNION ALL
       SELECT CASE WHEN status = 'successful' THEN 'Payment Recorded' ELSE 'Payment Pending' END AS activity_type,
              payment_reference AS reference,
              created_at
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
       ORDER BY COALESCE(payment_date, created_at) DESC, created_at DESC
       LIMIT 5`
    );

    console.info(
      `[Dashboard] Staff summary loaded: revenue=${summary.total_revenue}, outstanding=${summary.outstanding_balances}, overdue=${summary.overdue_bills}.`
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
