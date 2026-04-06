const pool = require('../config/db');

exports.getAdminSummary = async (req, res) => {
  try {
    // Top-line KPIs
    const [[{ total_customers }]] = await pool.query('SELECT COUNT(*) as total_customers FROM customers WHERE status = "active"');
    const [[{ total_billed }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_billed FROM bills');
    const [[{ total_payments }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total_payments FROM payments WHERE status = "successful"');
    const [[{ outstanding_balances }]] = await pool.query('SELECT COALESCE(SUM(balance_due), 0) as outstanding_balances FROM bills WHERE status IN ("unpaid", "partially_paid", "overdue")');
    const [[{ overdue_accounts }]] = await pool.query('SELECT COUNT(DISTINCT customer_id) as overdue_accounts FROM bills WHERE status = "overdue" AND balance_due > 0');
    
    // IT / Ops KPIs
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users WHERE status = "active"');
    
    // Support KPIs
    const [[{ active_tickets }]] = await pool.query('SELECT COUNT(*) as active_tickets FROM feedback WHERE status IN ("new", "in_progress")');
    const [[{ resolved_tickets }]] = await pool.query('SELECT COUNT(*) as resolved_tickets FROM feedback WHERE status IN ("resolved", "closed")');

    // Field Ops KPIs
    const [[{ total_connections }]] = await pool.query('SELECT COUNT(*) as total_connections FROM service_connections');
    const [[{ inactive_connections }]] = await pool.query('SELECT COUNT(*) as inactive_connections FROM service_connections WHERE status = "inactive"');
    const [[{ meters_installed }]] = await pool.query('SELECT COUNT(*) as meters_installed FROM meters WHERE status = "active"');

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
    const [recent_audit_logs] = await pool.query(`
      SELECT a.id, a.action, a.module, u.full_name as user_name 
      FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.created_at DESC LIMIT 5
    `);
    const [recent_feedback] = await pool.query(`
      SELECT f.id, f.subject, f.status, c.full_name as customer_name, f.created_at
      FROM feedback f JOIN customers c ON f.customer_id = c.id
      ORDER BY f.created_at DESC LIMIT 5
    `);
    const [recent_connections] = await pool.query(`
      SELECT s.id, s.connection_number, c.full_name as customer_name, s.status, s.created_at
      FROM service_connections s JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC LIMIT 5
    `);
    const [recent_readings] = await pool.query(`
      SELECT r.id, m.meter_number, c.full_name as customer_name, r.units_consumed, r.reading_date
      FROM consumption_records r 
      JOIN customers c ON r.customer_id = c.id
      JOIN meters m ON r.meter_id = m.id
      ORDER BY r.created_at DESC LIMIT 5
    `);

    // Chart Data (Last 6 Months Revenue)
    const [revenue_trend] = await pool.query(`
      SELECT DATE_FORMAT(payment_date, '%b %Y') as month, SUM(amount) as revenue 
      FROM payments 
      WHERE status = 'successful' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%b %Y'), YEAR(payment_date), MONTH(payment_date)
      ORDER BY YEAR(payment_date), MONTH(payment_date)
    `);
    
    // Whitelist roles that see ALL summary (Executive)
    const managerRoles = ['Super Admin', 'General Manager', 'Regional Manager', 'Branch Manager', 'Help Desk'];
    let my_assigned_tickets = [];
    
    if (!managerRoles.includes(req.user.role)) {
      // Calculate tasks for Officers/Field staff
      const [tickets] = await pool.query(`
        SELECT f.id, f.subject, f.status, f.category, c.full_name as customer_name, f.created_at
        FROM feedback f JOIN customers c ON f.customer_id = c.id
        WHERE f.assigned_to = ? AND f.status NOT IN ('resolved', 'closed')
        ORDER BY f.created_at DESC
      `, [req.user.id]);
      my_assigned_tickets = tickets;
    }

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          total_customers,
          total_billed,
          total_payments,
          outstanding_balances,
          overdue_accounts,
          total_users,
          active_tickets,
          resolved_tickets,
          total_connections,
          inactive_connections,
          meters_installed,
          my_active_tasks: my_assigned_tickets.length
        },
        recent_bills,
        recent_payments,
        recent_audit_logs,
        recent_feedback,
        recent_connections,
        recent_readings,
        revenue_trend,
        my_assigned_tickets
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
    // Current Bill / Balances (Join records to get units_consumed)
    const [openBills] = await pool.query(`
      SELECT b.*, COALESCE(cr.units_consumed, 0) as units_consumed 
      FROM bills b
      LEFT JOIN consumption_records cr ON b.id = cr.bill_id
      WHERE b.customer_id = ? AND b.balance_due > 0 
      ORDER BY b.due_date ASC LIMIT 1
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
          total_due: total_due || 0,
          current_bill: openBills[0] || null,
        },
        recent_payments: recent_payments || [],
        recent_notifications: recent_notifications || [],
        consumption_trend: consumption_trend || []
      }
    });

  } catch (error) {
    console.error('Customer Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching dashboard data' });
  }
};

exports.globalSearch = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(200).json({ success: true, data: { customers: [], connections: [], bills: [], payments: [] } });
  }

  const searchTerm = `%${q}%`;

  try {
    // 1. Search Customers
    const [customers] = await pool.query(`
      SELECT id, customer_number, full_name, email, phone, status 
      FROM customers 
      WHERE full_name LIKE ? OR customer_number LIKE ? OR email LIKE ? OR phone LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);

    // 2. Search Connections
    const [connections] = await pool.query(`
      SELECT s.id, s.connection_number, s.meter_number, c.full_name as customer_name, s.status
      FROM service_connections s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.connection_number LIKE ? OR s.meter_number LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm]);

    // 3. Search Bills
    const [bills] = await pool.query(`
      SELECT b.id, b.bill_number, c.full_name as customer_name, b.total_amount, b.status
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.bill_number LIKE ?
      LIMIT 10
    `, [searchTerm]);

    // 4. Search Payments
    const [payments] = await pool.query(`
      SELECT p.id, p.payment_reference, c.full_name as customer_name, p.amount, p.status
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.payment_reference LIKE ?
      LIMIT 10
    `, [searchTerm]);

    res.status(200).json({
      success: true,
      data: {
        customers,
        connections,
        bills,
        payments
      }
    });

  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during search' });
  }
};
