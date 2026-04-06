const express = require('express');
const router = express.Router();
const consumptionController = require('../controllers/consumptionController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Customer fetching their own history
router.get('/customer/:customer_id', consumptionController.getCustomerConsumption);

// Admin / Staff operations
router.get('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), consumptionController.getConsumptionRecords);
router.post('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), consumptionController.createConsumptionRecord);
router.put('/:id', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), consumptionController.updateConsumptionRecord);

module.exports = router;

