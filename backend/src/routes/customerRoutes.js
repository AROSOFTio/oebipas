const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Admins & Billing Officers can manage customers
router.get('/', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer'), customerController.getCustomers);
router.post('/', restrictTo('Super Admin', 'Billing Officer'), customerController.createCustomer);
router.put('/:id', restrictTo('Super Admin', 'Billing Officer'), customerController.updateCustomer);
router.patch('/:id/status', restrictTo('Super Admin', 'Billing Officer'), customerController.updateCustomerStatus);

module.exports = router;
