const { Parser } = require('json2csv');
const { createReportPdfBuffer } = require('../services/documentService');
const { REPORTS, prepareRowsForExport } = require('../services/reportService');

const sendReportJson = report => async (req, res) => {
  try {
    const rows = await report.load();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: `Unable to load ${report.title.toLowerCase()} report.` });
  }
};

const sendReportPdf = report => async (req, res) => {
  try {
    const rows = prepareRowsForExport(report, await report.load());
    const pdf = await createReportPdfBuffer({
      title: report.title,
      columns: report.columns,
      rows,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}.pdf"`);
    return res.status(200).send(pdf);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: `Unable to export ${report.title.toLowerCase()} PDF.` });
  }
};

const sendReportCsv = report => async (req, res) => {
  try {
    const rows = prepareRowsForExport(report, await report.load());
    const parser = new Parser({
      fields: report.columns.map(column => ({ label: column.label, value: column.key })),
    });
    const csv = `\ufeff${parser.parse(rows)}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: `Unable to export ${report.title.toLowerCase()} CSV.` });
  }
};

exports.getDailyRevenue = sendReportJson(REPORTS.dailyRevenue);
exports.getMonthlyBillingSummary = sendReportJson(REPORTS.monthlyBillingSummary);
exports.getOutstandingPayments = sendReportJson(REPORTS.outstandingPayments);

exports.downloadDailyRevenuePdf = sendReportPdf(REPORTS.dailyRevenue);
exports.downloadDailyRevenueCsv = sendReportCsv(REPORTS.dailyRevenue);
exports.downloadMonthlyBillingSummaryPdf = sendReportPdf(REPORTS.monthlyBillingSummary);
exports.downloadMonthlyBillingSummaryCsv = sendReportCsv(REPORTS.monthlyBillingSummary);
exports.downloadOutstandingPaymentsPdf = sendReportPdf(REPORTS.outstandingPayments);
exports.downloadOutstandingPaymentsCsv = sendReportCsv(REPORTS.outstandingPayments);
