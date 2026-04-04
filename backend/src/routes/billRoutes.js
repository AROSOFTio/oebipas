const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer'), billController.getAllBills);
router.post('/generate', restrictTo('Super Admin', 'Billing Officer'), billController.generateBill);
router.get('/customer/:customer_id', billController.getCustomerBills);
router.get('/:id', billController.getBillById);

module.exports = router;
