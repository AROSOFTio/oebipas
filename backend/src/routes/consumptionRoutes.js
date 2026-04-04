const express = require('express');
const router = express.Router();
const consumptionController = require('../controllers/consumptionController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Customer fetching their own history
router.get('/customer/:customer_id', consumptionController.getCustomerConsumption);

// Admin / Staff operations
router.get('/', restrictTo('Super Admin', 'Billing Officer'), consumptionController.getConsumptionRecords);
router.post('/', restrictTo('Super Admin', 'Billing Officer'), consumptionController.createConsumptionRecord);
router.put('/:id', restrictTo('Super Admin', 'Billing Officer'), consumptionController.updateConsumptionRecord);

module.exports = router;
