const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

const paymentController = require('../controllers/paymentController');
const penaltyController = require('../controllers/penaltyController');
const billController = require('../controllers/billController');

router.use(authenticateToken);

// Customer can get their own profile
router.get('/my-profile', customerController.getMyProfile);

// Admins & Billing Officers can manage customers
router.get('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), customerController.getCustomers);
router.get('/:id', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), customerController.getCustomerById);
router.post('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), customerController.createCustomer);
router.put('/:id', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), customerController.updateCustomer);
router.patch('/:id/status', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), customerController.updateCustomerStatus);
router.delete('/:id', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), customerController.deleteCustomer);

// Required specific nested endpoints
router.get('/:id/payments', paymentController.getCustomerPayments);
router.get('/:id/penalties', penaltyController.getCustomerPenalties);
router.get('/:id/bills', billController.getCustomerBills);

module.exports = router;

