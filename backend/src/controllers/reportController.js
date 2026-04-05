const pool = require('../config/db');
const PDFDocument = require('pdfkit-table');
const { parse } = require('json2csv');
const path = require('path');

// Helper to add professional header with logo
const addHeader = (doc, title, titleColor = '#0b2e63') => {
  const logoPath = path.join(__dirname, '../assets/logo.png');
  try {
    doc.image(logoPath, 30, 20, { width: 80 });
  } catch (e) {
    console.error('Logo not found at', logoPath);
  }
  
  doc.fillColor(titleColor).fontSize(22).font('Helvetica-Bold').text('OEBIPAS SYSTEM', 125, 30);
  doc.fontSize(10).font('Helvetica').text('Online Electricity Billing & Payment System', 125, 55);
  
  doc.moveTo(30, 90).lineTo(565, 90).strokeColor('#eeeeee').stroke();
  
  doc.fillColor(titleColor).fontSize(16).font('Helvetica-Bold').text(title, 30, 110, { align: 'right' });
  doc.fontSize(8).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, 30, 130, { align: 'right' });
  doc.moveDown(4);
};

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
    
    doc.pipe(res);
    addHeader(doc, 'MASTER KPI REPORT');

    doc.fontSize(14).font('Helvetica-Bold').text('System Financial Summary', 30, 160);
    doc.moveDown(1);
    
    const kpiTable = {
      headers: ["Metric", "Value"],
      rows: [
        ["Total Gross Billed", `UGX ${Number(data.total_billed).toLocaleString()}`],
        ["Total Realized Revenue", `UGX ${Number(data.total_payments).toLocaleString()}`],
        ["Total Overdue Accounts", `${data.overdue_accounts}`],
        ["Total Outstanding Debt", `UGX ${Number(data.outstanding_balances).toLocaleString()}`]
      ]
    };

    await doc.table(kpiTable, {
      width: 300,
      x: 30,
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor('#0b2e63'),
      prepareRow: () => doc.font("Helvetica").fontSize(10).fillColor('#333333'),
    });

    doc.moveDown(3);

    const table = {
      title: "Top 20 Outstanding Customer Balances",
      headers: ["Customer Name", "Customer Number", "Amount Due (UGX)"],
      rows: data.outstanding_list.map(r => [r.full_name, r.customer_number, Number(r.amount_due).toLocaleString()])
    };

    if (data.outstanding_list.length > 0) {
      await doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor('#0b2e63'),
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font("Helvetica").fontSize(10).fillColor('#333333');
          },
      });
    }

    doc.end();
  } catch (error) {
    console.error('PDF Export Error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Server error generating PDF' });
  }
};

exports.generateInvoicePdf = async (req, res) => {
  const { id } = req.params;
  const themeColor = '#0b2e63'; // Deep Blue
  try {
    const [bills] = await pool.query(`
      SELECT b.*, c.customer_number, c.full_name as customer_name, c.address, c.category,
             m.meter_number, u.full_name as generated_by_name
      FROM bills b
      JOIN customers c ON b.customer_id = c.id
      JOIN meters m ON b.meter_id = m.id
      LEFT JOIN users u ON b.generated_by = u.id
      WHERE b.id = ?
    `, [id]);

    if (bills.length === 0) return res.status(404).json({ success: false, message: 'Bill not found' });
    const bill = bills[0];
    const [items] = await pool.query('SELECT * FROM bill_items WHERE bill_id = ?', [id]);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_${bill.bill_number}.pdf"`);
    doc.pipe(res);

    addHeader(doc, 'TAX INVOICE', themeColor);

    // Info Section
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text('BILL TO:', 30, 160);
    doc.font('Helvetica').text(bill.customer_name, 30, 175);
    doc.font('Helvetica').text(bill.customer_number, 30, 188);
    doc.font('Helvetica').text(bill.address || 'N/A', 30, 201);
    
    doc.font('Helvetica-Bold').text('INVOICE DETAILS:', 350, 160);
    doc.font('Helvetica').text(`Invoice #: ${bill.bill_number}`, 350, 175);
    doc.font('Helvetica').text(`Billing Period: ${bill.billing_month}/${bill.billing_year}`, 350, 188);
    doc.font('Helvetica').text(`Due Date: ${new Date(bill.due_date).toLocaleDateString()}`, 350, 201);
    doc.font('Helvetica').text(`Meter #: ${bill.meter_number}`, 350, 214);

    doc.moveDown(4);

    const table = {
      headers: ["Description", "Quantity/Units", "Amount (UGX)"],
      rows: items.map(i => [
        i.item_name, 
        i.item_type === 'consumption' ? `${Number(i.amount / (bill.energy_charge || 1) * bill.units_consumed || 0).toFixed(2)} kWh` : '-', 
        Number(i.amount || 0).toLocaleString()
      ])
    };

    await doc.table(table, {
      width: 480,
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor(themeColor),
      prepareRow: () => doc.font("Helvetica").fontSize(10).fillColor('#333333'),
      columnSize: [280, 100, 100]
    });

    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(themeColor).text(`TOTAL PAYABLE: UGX ${Number(bill.total_amount).toLocaleString()}`, { align: 'right' });
    
    doc.fontSize(8).fillColor('#777777').text('Terms: Please pay by the due date to avoid disconnection and late penalties.', 30, 750, { align: 'center' });
    doc.end();
  } catch (error) {
    console.error('Invoice PDF Error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.generateReceiptPdf = async (req, res) => {
  const { id } = req.params;
  const themeColor = '#166534'; // Forest Green
  try {
    const [receipts] = await pool.query(`
      SELECT r.*, c.customer_number, c.full_name as customer_name, p.payment_reference, p.payment_method, p.transaction_reference
      FROM receipts r
      JOIN customers c ON r.customer_id = c.id
      JOIN payments p ON r.payment_id = p.id
      WHERE r.id = ? OR r.payment_id = ?
    `, [id, id]);

    if (receipts.length === 0) return res.status(404).json({ success: false, message: 'Receipt not found' });
    const receipt = receipts[0];

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Receipt_${receipt.receipt_number}.pdf"`);
    doc.pipe(res);

    addHeader(doc, 'OFFICIAL RECEIPT', themeColor);

    doc.fontSize(12).font('Helvetica-Bold').fillColor(themeColor).text(`Receipt Number: ${receipt.receipt_number}`, 30, 160);
    doc.fontSize(10).font('Helvetica').fillColor('#333333').text(`Date Issued: ${new Date(receipt.issued_at).toLocaleString()}`, 30, 178);
    
    doc.moveDown(2);
    
    const detailsTable = {
      headers: ["Description", "Details"],
      rows: [
        ["Received From", receipt.customer_name],
        ["Customer Account", receipt.customer_number],
        ["Payment Method", receipt.payment_method.toUpperCase()],
        ["Transaction Ref", receipt.transaction_reference],
        ["Payment Ref", receipt.payment_reference],
        ["Amount Paid", `UGX ${Number(receipt.amount).toLocaleString()}`]
      ]
    };

    await doc.table(detailsTable, {
      width: 480,
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor(themeColor),
      prepareRow: () => doc.font("Helvetica").fontSize(10).fillColor('#333333'),
      columnSize: [150, 330]
    });

    // Watermark/Badge
    doc.save();
    doc.opacity(0.1);
    doc.fillColor(themeColor).fontSize(80).font('Helvetica-Bold');
    doc.rotate(30, { origin: [300, 450] });
    doc.text('PAID', 280, 420);
    doc.restore();

    doc.moveDown(3);
    doc.fontSize(18).font('Helvetica-Bold').fillColor(themeColor).text('PAYMENT SUCCESSFUL', { align: 'center' });
    doc.fontSize(10).fillColor('#333333').text('Thank you for your payment.', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Receipt PDF Error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Server error' });
  }
};
