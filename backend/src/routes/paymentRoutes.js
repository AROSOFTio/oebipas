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
router.get('/', authorizeRoles('Branch Manager', 'Billing Staff'), paymentController.getPayments);
router.post('/initiate', authorizeRoles('Branch Manager', 'Billing Staff', 'Customer'), paymentController.initiatePayment);

module.exports = router;
