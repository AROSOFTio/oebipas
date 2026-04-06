const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// 1. Staff-Only Data Reports & CSV Exports
router.get('/daily-revenue', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.getDailyRevenue);
router.get('/monthly-billing', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.getMonthlyBilling);
router.get('/outstanding-balances', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.getOutstandingBalances);
router.get('/overdue-customers', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.getOverdueCustomers);
router.get('/export/csv', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.exportCsv);
router.get('/export/pdf', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.exportPdf);

// 2. Transnational Documents (Available to both Staff and Customers)
router.get('/invoice/:id', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.generateInvoicePdf);
router.get('/receipt/:id', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), reportController.generateReceiptPdf);

module.exports = router;

