const pool = require('../config/db');

exports.getAdminSummary = async (req, res) => {
  try {
    // Top-line KPIs
    const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) as total_customers FROM customers WHERE status = "active"');
    const [[{ total_billed }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_billed FROM bills');
    const [[{ total_payments }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total_payments FROM payments WHERE status = "successful"');
    const [[{ outstanding_balances }]] = await pool.query('SELECT COALESCE(SUM(balance_due), 0) as outstanding_balances FROM bills WHERE status IN ("unpaid", "partially_paid", "overdue")');
    const [[{ overdue_accounts }]] = await pool.query('SELECT COUNT(DISTINCT customer_id) as overdue_accounts FROM bills WHERE status = "overdue" AND balance_due > 0');

    // Recent Tables
    const [recent_bills] = await pool.query(`
      SELECT b.id, b.bill_number, c.full_name as customer_name, b.total_amount, b.status 
      FROM bills b JOIN customers c ON b.customer_id = c.id 
      ORDER BY b.created_at DESC LIMIT 5
    `);
    const [recent_payments] = await pool.query(`
      SELECT p.id, p.payment_reference, c.full_name as customer_name, p.amount, p.status 
      FROM payments p JOIN customers c ON p.customer_id = c.id 
      ORDER BY p.created_at DESC LIMIT 5
    `);

    // Chart Data (Last 6 Months Revenue)
    const [revenue_trend] = await pool.query(`
      SELECT DATE_FORMAT(payment_date, '%b %Y') as month, SUM(amount) as revenue 
      FROM payments 
      WHERE status = 'successful' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%b %Y'), YEAR(payment_date), MONTH(payment_date)
      ORDER BY YEAR(payment_date), MONTH(payment_date)
    `);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          total_customers,
          total_billed,
          total_payments,
          outstanding_balances,
          overdue_accounts
        },
        recent_bills,
        recent_payments,
        revenue_trend
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching dashboard data' });
  }
};

exports.getCustomerSummary = async (req, res) => {
  const { customer_id } = req.params;
  try {
    // Current Bill / Balances
    const [openBills] = await pool.query(`
      SELECT * FROM bills 
      WHERE customer_id = ? AND balance_due > 0 
      ORDER BY due_date ASC LIMIT 1
    `, [customer_id]);
    
    // Aggregation of total due
    const [[{ total_due }]] = await pool.query('SELECT COALESCE(SUM(balance_due), 0) as total_due FROM bills WHERE customer_id = ?', [customer_id]);

    const [recent_payments] = await pool.query(`
      SELECT payment_reference, amount, payment_date, status 
      FROM payments 
      WHERE customer_id = ? 
      ORDER BY payment_date DESC LIMIT 5
    `, [customer_id]);

    const [recent_notifications] = await pool.query(`
      SELECT id, title, message, status, created_at 
      FROM notifications 
      WHERE customer_id = ? 
      ORDER BY created_at DESC LIMIT 5
    `, [customer_id]);

    // Chart Data (Last 6 Months Consumption)
    const [consumption_trend] = await pool.query(`
      SELECT CONCAT(billing_month, '/', billing_year) as period, billing_month, billing_year, SUM(units_consumed) as units 
      FROM consumption_records 
      WHERE customer_id = ? AND reading_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY billing_year, billing_month
      ORDER BY billing_year, billing_month
    `, [customer_id]);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          total_due,
          current_bill: openBills[0] || null,
        },
        recent_payments,
        recent_notifications,
        consumption_trend
      }
    });

  } catch (error) {
    console.error('Customer Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching dashboard data' });
  }
};
