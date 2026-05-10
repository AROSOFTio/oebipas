const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const logoPath = path.join(__dirname, '../assets/logo.png');

const formatCurrency = amount => `UGX ${Number(amount || 0).toLocaleString()}`;
const formatDate = value => (value ? new Date(value).toLocaleDateString('en-UG') : 'N/A');
const formatPeriod = (month, year) => `${String(month).padStart(2, '0')}/${year}`;
const statusLabel = value => String(value || 'N/A').replace(/_/g, ' ');
const energyCharge = bill => Number((Number(bill?.units_consumed || 0) * Number(bill?.rate_per_unit || 0)).toFixed(2));

const supportContact = () => ({
  company: process.env.COMPANY_NAME || 'Uganda Electricity Distribution Company Limited',
  email: process.env.SUPPORT_EMAIL || process.env.SMTP_FROM_EMAIL || 'support@oebipas.local',
  phone: process.env.SUPPORT_PHONE || 'Support phone not configured',
  address: process.env.SUPPORT_ADDRESS || process.env.COMPANY_ADDRESS || 'OEBIPAS Support Desk',
  website: process.env.FRONTEND_URL || process.env.BACKEND_PUBLIC_URL || '',
});

const addFooter = doc => {
  const contact = supportContact();
  const bottom = doc.page.height - 54;

  doc
    .moveTo(50, bottom - 12)
    .lineTo(545, bottom - 12)
    .strokeColor('#e5e7eb')
    .stroke()
    .fontSize(7)
    .fillColor('#6b7280')
    .text(contact.company, 50, bottom, { width: 495, align: 'center' })
    .text(`Support: ${contact.email} | ${contact.phone}`, 50, bottom + 10, { width: 495, align: 'center' });

  if (contact.website || contact.address) {
    doc.text([contact.address, contact.website].filter(Boolean).join(' | '), 50, bottom + 20, {
      width: 495,
      align: 'center',
    });
  }
};

const collectPdf = build => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  build(doc);
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    addFooter(doc);
  }
  doc.end();
});

const addHeader = (doc, title) => {
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 42, { fit: [72, 52] });
  }

  doc
    .fontSize(17)
    .fillColor('#111827')
    .text(title, 140, 50, { align: 'left' })
    .fontSize(9)
    .fillColor('#6b7280')
    .text('OEBIPAS Platform', 140, 74)
    .moveTo(50, 108)
    .lineTo(545, 108)
    .strokeColor('#e5e7eb')
    .stroke();

  doc.moveDown(4);
};

const ensureSpace = (doc, height = 28) => {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
};

const addKeyValueRows = (doc, rows) => {
  const labelX = 50;
  const valueX = 230;

  rows.forEach(([label, value]) => {
    ensureSpace(doc);
    const y = doc.y;
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(label, labelX, y, { width: 160 })
      .fillColor('#111827')
      .text(String(value ?? 'N/A'), valueX, y, { width: 300 });
    doc.y = y + 20;
  });
};

const addTable = (doc, columns, rows) => {
  const startX = 50;
  const tableWidth = 495;
  const columnWidth = tableWidth / columns.length;

  ensureSpace(doc, 42);
  doc.fontSize(8).fillColor('#111827');
  const headerY = doc.y;
  columns.forEach((column, index) => {
    doc.text(column.label, startX + index * columnWidth, headerY, {
      width: columnWidth - 8,
      continued: false,
    });
  });
  doc.y = headerY + 18;
  doc.moveTo(startX, doc.y).lineTo(startX + tableWidth, doc.y).strokeColor('#e5e7eb').stroke();
  doc.y += 8;

  rows.forEach(row => {
    ensureSpace(doc, 36);
    const y = doc.y;
    columns.forEach((column, index) => {
      doc
        .fontSize(8)
        .fillColor('#374151')
        .text(String(row[column.key] ?? ''), startX + index * columnWidth, y, { width: columnWidth - 8 });
    });
    doc.y = y + 26;
  });
};

const createReportPdfBuffer = ({ title, columns, rows }) => collectPdf(doc => {
  addHeader(doc, title);
  addTable(doc, columns, rows);
});

const createInvoicePdfBuffer = ({ bill, customer }) => collectPdf(doc => {
  addHeader(doc, 'Electricity Invoice');
  addKeyValueRows(doc, [
    ['Bill number', bill.bill_number],
    ['Customer name', customer.full_name],
    ['Customer number', customer.customer_number],
    ['Meter number', customer.meter_number],
    ['Billing period', formatPeriod(bill.billing_month, bill.billing_year)],
    ['Units consumed', `${Number(bill.units_consumed || 0).toLocaleString()} kWh`],
    ['Cost per unit', `${formatCurrency(bill.rate_per_unit)} / kWh`],
    ['Energy charge', formatCurrency(energyCharge(bill))],
    ['Fixed charge', formatCurrency(bill.fixed_charge)],
    ['Bill amount', formatCurrency(bill.bill_amount)],
    ['Total amount', formatCurrency(bill.total_amount)],
    ['Balance due', formatCurrency(bill.balance_due)],
    ['Due date', formatDate(bill.due_date)],
    ['Status', statusLabel(bill.status)],
  ]);
});

const createReceiptPdfBuffer = ({
  payment,
  appliedAmount,
  outstandingBalance,
  billStatus,
  confirmationCode,
  receiptDate,
  allocations,
}) => collectPdf(doc => {
  addHeader(doc, 'Payment Receipt');
  addKeyValueRows(doc, [
    ['Payment reference', payment.payment_reference],
    ['Pesapal reference', payment.transaction_reference || payment.order_tracking_id || 'N/A'],
    ['Confirmation code', confirmationCode || payment.confirmation_code || 'Pending confirmation code'],
    ['Amount paid', formatCurrency(appliedAmount)],
    ['Outstanding balance', formatCurrency(outstandingBalance)],
    ['Bill status', statusLabel(billStatus)],
    ['Receipt date', receiptDate],
  ]);

  if (allocations?.length) {
    doc.moveDown();
    doc.fontSize(11).fillColor('#111827').text('Bill allocation details');
    doc.moveDown(0.5);
    addTable(
      doc,
      [
        { key: 'bill_number', label: 'Bill' },
        { key: 'units', label: 'Units' },
        { key: 'rate', label: 'Rate' },
        { key: 'energyCharge', label: 'Energy' },
        { key: 'appliedAmount', label: 'Amount applied' },
        { key: 'newBalance', label: 'Outstanding' },
        { key: 'newBillStatus', label: 'Status' },
      ],
      allocations.map(allocation => ({
        bill_number: allocation.bill_number,
        units: `${Number(allocation.units_consumed || 0).toLocaleString()} kWh`,
        rate: formatCurrency(allocation.rate_per_unit),
        energyCharge: formatCurrency(energyCharge(allocation)),
        appliedAmount: formatCurrency(allocation.appliedAmount),
        newBalance: formatCurrency(allocation.newBalance),
        newBillStatus: statusLabel(allocation.newBillStatus),
      }))
    );
  }
});

module.exports = {
  createInvoicePdfBuffer,
  createReceiptPdfBuffer,
  createReportPdfBuffer,
  formatCurrency,
  formatDate,
  statusLabel,
};
