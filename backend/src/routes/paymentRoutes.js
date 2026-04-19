const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/verify', paymentController.verifyPesapalPayment);
router.post('/verify', paymentController.verifyPesapalPayment);
router.post('/ipn', paymentController.handlePesapalIpn);
router.get('/ipn', paymentController.handlePesapalIpn);

router.use(authenticateToken);

router.get('/mine', authorizeRoles('Electricity consumers'), paymentController.getMyPayments);
router.get('/', authorizeRoles('System administrators', 'Billing officers'), paymentController.getPayments);
router.post('/initiate', authorizeRoles('System administrators', 'Billing officers', 'Electricity consumers'), paymentController.initiatePayment);

module.exports = router;
