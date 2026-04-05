const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/admin-summary', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer'), dashboardController.getAdminSummary);
router.get('/customer-summary/:customer_id', dashboardController.getCustomerSummary);
router.get('/search', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer'), dashboardController.globalSearch);

module.exports = router;
