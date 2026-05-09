const pool = require('../config/db');
const { applyAutomaticPenalties } = require('./automationService');

const REPORTS = {
  dailyRevenue: {
    title: 'Daily Revenue',
    filename: 'daily-revenue',
    columns: [
      { key: 'report_date', label: 'Date' },
      { key: 'total_revenue', label: 'Total Revenue' },
    ],
    load: async () => {
      const [rows] = await pool.query(
        `SELECT DATE(payment_date) AS report_date, COALESCE(SUM(amount), 0) AS total_revenue
         FROM payments
         WHERE status = 'successful'
         GROUP BY DATE(payment_date)
         ORDER BY report_date DESC
         LIMIT 14`
      );

      return rows.reverse();
    },
  },
  monthlyBillingSummary: {
    title: 'Monthly Billing Summary',
    filename: 'monthly-billing-summary',
    columns: [
      { key: 'billing_period', label: 'Period' },
      { key: 'bills_generated', label: 'Bills' },
      { key: 'total_billed', label: 'Total Billed' },
      { key: 'total_paid', label: 'Total Paid' },
    ],
    load: async () => {
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

      return rows.reverse();
    },
  },
  outstandingPayments: {
    title: 'Outstanding Payments',
    filename: 'outstanding-payments',
    columns: [
      { key: 'customer_number', label: 'Customer Number' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'bill_number', label: 'Bill' },
      { key: 'balance_due', label: 'Balance' },
      { key: 'status', label: 'Status' },
      { key: 'due_date', label: 'Due Date' },
    ],
    load: async () => {
      await applyAutomaticPenalties();
      const [rows] = await pool.query(
        `SELECT c.customer_number, c.full_name AS customer_name, b.bill_number, b.balance_due, b.status, b.due_date
         FROM bills b
         INNER JOIN customers c ON c.id = b.customer_id
         WHERE b.balance_due > 0
         ORDER BY b.due_date ASC`
      );

      return rows;
    },
  },
};

const normalizeDateValue = value => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const prepareRowsForExport = (report, rows) => rows.map(row => {
  const next = { ...row };

  if (next.report_date) {
    next.report_date = normalizeDateValue(next.report_date);
  }

  if (next.due_date) {
    next.due_date = normalizeDateValue(next.due_date);
  }

  if (report === REPORTS.monthlyBillingSummary) {
    next.billing_period = `${String(next.billing_month).padStart(2, '0')}/${next.billing_year}`;
  }

  return next;
});

module.exports = {
  REPORTS,
  prepareRowsForExport,
};
