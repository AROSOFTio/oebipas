const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/verify', paymentController.verifyPesapalPayment);
router.post('/verify', paymentController.verifyPesapalPayment);
router.post('/ipn', paymentController.handlePesapalIpn);
router.get('/ipn', paymentController.handlePesapalIpn);

router.use(authenticateToken);

router.get('/mine', authorizeRoles('Customer'), paymentController.getMyPayments);
router.get('/', authorizeRoles('System administrator', 'Billing Officer'), paymentController.getPayments);
router.post('/initiate', authorizeRoles('System administrator', 'Billing Officer', 'Customer'), paymentController.initiatePayment);

module.exports = router;
