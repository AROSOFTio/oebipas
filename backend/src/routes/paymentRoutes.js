const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

// Public IPN Route (no auth token required as it's a webhook)
router.post('/pesapal/ipn', paymentController.pesapalIpn);
router.post('/ipn', paymentController.pesapalIpn); // Fallback

router.use(authenticateToken);

// Payments
router.get('/', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), paymentController.getAllPayments);
router.post('/', paymentController.processPayment); // Customers can also pay
router.get('/:id', paymentController.getPaymentById);
router.get('/customer/:id', paymentController.getCustomerPayments);

// Receipts
router.get('/receipts/all', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), paymentController.getAllReceipts);

module.exports = router;

