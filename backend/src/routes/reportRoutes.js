const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
// Restrict all reports to Admin level roles
router.use(restrictTo('Super Admin', 'Billing Officer', 'Finance Officer', 'Viewer'));

router.get('/daily-revenue', reportController.getDailyRevenue);
router.get('/monthly-billing', reportController.getMonthlyBilling);
router.get('/outstanding-balances', reportController.getOutstandingBalances);
router.get('/overdue-customers', reportController.getOverdueCustomers);

router.get('/export/csv', reportController.exportCsv);
router.get('/export/pdf', reportController.exportPdf);

module.exports = router;
