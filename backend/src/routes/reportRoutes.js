const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// 1. Staff-Only Data Reports & CSV Exports
router.get('/daily-revenue', restrictTo('Super Admin', 'Finance Officer', 'Viewer'), reportController.getDailyRevenue);
router.get('/monthly-billing', restrictTo('Super Admin', 'Billing Officer', 'Viewer'), reportController.getMonthlyBilling);
router.get('/outstanding-balances', restrictTo('Super Admin', 'Finance Officer', 'Viewer'), reportController.getOutstandingBalances);
router.get('/overdue-customers', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer', 'Viewer'), reportController.getOverdueCustomers);
router.get('/export/csv', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer', 'Viewer'), reportController.exportCsv);
router.get('/export/pdf', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer', 'Viewer'), reportController.exportPdf);

// 2. Transnational Documents (Available to both Staff and Customers)
router.get('/invoice/:id', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer', 'Viewer', 'Customer'), reportController.generateInvoicePdf);
router.get('/receipt/:id', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer', 'Viewer', 'Customer'), reportController.generateReceiptPdf);

module.exports = router;
