const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('System administrators'));

router.get('/daily-revenue', reportController.getDailyRevenue);
router.get('/monthly-billing-summary', reportController.getMonthlyBillingSummary);
router.get('/outstanding-payments', reportController.getOutstandingPayments);

module.exports = router;
