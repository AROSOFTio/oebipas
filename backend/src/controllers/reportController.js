const pool = require('../config/db');
const PDFDocument = require('pdfkit-table');
const { parse } = require('json2csv');

exports.getDailyRevenue = async (req, res) => {
  try {
    const [revenue] = await pool.query(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m-%d') as date, SUM(amount) as total_revenue
      FROM payments
      WHERE status = 'successful' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m-%d')
      ORDER BY date ASC
    `);
    res.status(200).json({ success: true, data: revenue });
  } catch (error) {
    console.error('Daily Revenue Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMonthlyBilling = async (req, res) => {
  try {
    const [billing] = await pool.query(`
      SELECT CONCAT(billing_month, '/', billing_year) as period, 
             SUM(total_amount) as total_billed, 
             SUM(amount_paid) as total_collected
      FROM bills
      GROUP BY billing_year, billing_month
      ORDER BY billing_year DESC, billing_month DESC
      LIMIT 12
    `);
    res.status(200).json({ success: true, data: billing.reverse() });
  } catch (error) {
    console.error('Monthly Billing Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOutstandingBalances = async (req, res) => {
  try {
    const [balances] = await pool.query(`
      SELECT c.full_name as customer_name, c.customer_number, SUM(b.balance_due) as total_due
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.balance_due > 0
      GROUP BY c.id
      ORDER BY total_due DESC
      LIMIT 50
    `);
    res.status(200).json({ success: true, data: balances });
  } catch (error) {
    console.error('Outstanding Balances Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOverdueCustomers = async (req, res) => {
  try {
    const [overdue] = await pool.query(`
      SELECT c.full_name, c.phone, c.customer_number, b.bill_number, b.balance_due, b.due_date
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.status = 'overdue' AND b.balance_due > 0
      ORDER BY b.due_date ASC
    `);
    res.status(200).json({ success: true, data: overdue });
  } catch (error) {
    console.error('Overdue Customers Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Data Aggregation helper for exports
const assembleReportData = async () => {
    const [[{ total_billed }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_billed FROM bills');
    const [[{ total_payments }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total_payments FROM payments WHERE status = "successful"');
    const [[{ outstanding_balances }]] = await pool.query('SELECT COALESCE(SUM(balance_due), 0) as outstanding_balances FROM bills WHERE status IN ("unpaid", "partially_paid", "overdue")');
    const [[{ overdue_accounts }]] = await pool.query('SELECT COUNT(DISTINCT customer_id) as overdue_accounts FROM bills WHERE status = "overdue" AND balance_due > 0');
    
    const [outstanding_list] = await pool.query(`
      SELECT c.full_name, c.customer_number, SUM(b.balance_due) as amount_due
      FROM bills b JOIN customers c ON b.customer_id = c.id
      WHERE b.balance_due > 0 GROUP BY c.id ORDER BY amount_due DESC LIMIT 20
    `);

    return {
      total_billed, total_payments, outstanding_balances, overdue_accounts, outstanding_list
    };
};

exports.exportCsv = async (req, res) => {
  try {
    const data = await assembleReportData();
    // For CSV, we'll export the top outstanding customers list as it formats best
    const csvData = data.outstanding_list.map(row => ({
      'Customer Name': row.full_name,
      'Customer Number': row.customer_number,
      'Total Amount Due (UGX)': row.amount_due
    }));
    
    if (csvData.length === 0) {
      csvData.push({'Notice': 'No outstanding balances found.'});
    }

    const csvStr = parse(csvData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="oebipas_outstanding_balances.csv"');
    res.status(200).send(csvStr);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating CSV' });
  }
};

exports.exportPdf = async (req, res) => {
  try {
    const data = await assembleReportData();

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="oebipas_master_report.pdf"');
    
    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('OEBIPAS Master Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // KPIs
    doc.fontSize(14).font('Helvetica-Bold').text('System KPI Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Gross Billed: UGX ${Number(data.total_billed).toLocaleString()}`);
    doc.text(`Total Payments Received: UGX ${Number(data.total_payments).toLocaleString()}`);
    doc.text(`Total Overdue Accounts: ${data.overdue_accounts}`);
    doc.text(`Total Outstanding Balance: UGX ${Number(data.outstanding_balances).toLocaleString()}`);
    doc.moveDown(2);

    // Table
    const table = {
      title: "Top 20 Outstanding Customer Balances",
      headers: ["Customer Name", "Customer Number", "Amount Due (UGX)"],
      rows: data.outstanding_list.map(r => [r.full_name, r.customer_number, Number(r.amount_due).toLocaleString()])
    };

    if (data.outstanding_list.length > 0) {
      await doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font("Helvetica").fontSize(10);
          },
      });
    } else {
        doc.fontSize(12).font('Helvetica-Oblique').text("No outstanding balances at this time.");
    }

    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error generating PDF' });
    }
  }
};
