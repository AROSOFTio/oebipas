const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('System administrator'));

router.get('/daily-revenue', reportController.getDailyRevenue);
router.get('/daily-revenue/pdf', reportController.downloadDailyRevenuePdf);
router.get('/daily-revenue/csv', reportController.downloadDailyRevenueCsv);
router.get('/monthly-billing-summary', reportController.getMonthlyBillingSummary);
router.get('/monthly-billing-summary/pdf', reportController.downloadMonthlyBillingSummaryPdf);
router.get('/monthly-billing-summary/csv', reportController.downloadMonthlyBillingSummaryCsv);
router.get('/outstanding-payments', reportController.getOutstandingPayments);
router.get('/outstanding-payments/pdf', reportController.downloadOutstandingPaymentsPdf);
router.get('/outstanding-payments/csv', reportController.downloadOutstandingPaymentsCsv);

module.exports = router;
