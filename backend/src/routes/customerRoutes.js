const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

const paymentController = require('../controllers/paymentController');
const penaltyController = require('../controllers/penaltyController');

router.use(authenticateToken);

// Customer can get their own profile
router.get('/my-profile', customerController.getMyProfile);

// Admins & Billing Officers can manage customers
router.get('/', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer'), customerController.getCustomers);
router.post('/', restrictTo('Super Admin', 'Billing Officer'), customerController.createCustomer);
router.put('/:id', restrictTo('Super Admin', 'Billing Officer'), customerController.updateCustomer);
router.patch('/:id/status', restrictTo('Super Admin', 'Billing Officer'), customerController.updateCustomerStatus);
router.delete('/:id', restrictTo('Super Admin', 'Billing Officer'), customerController.deleteCustomer);

// Required specific nested endpoints
router.get('/:id/payments', paymentController.getCustomerPayments);
router.get('/:id/penalties', penaltyController.getCustomerPenalties);

module.exports = router;
