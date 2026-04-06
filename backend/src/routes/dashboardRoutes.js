const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/admin-summary', restrictTo('General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer', 'Field Officer'), dashboardController.getAdminSummary);
router.get('/customer-summary/:customer_id', dashboardController.getCustomerSummary);
router.get('/search', restrictTo('General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer', 'Field Officer'), dashboardController.globalSearch);

module.exports = router;

