const express = require('express');
const consumptionController = require('../controllers/consumptionController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/mine', authorizeRoles('Electricity consumers'), consumptionController.getMyConsumption);
router.get('/', authorizeRoles('System administrators', 'Billing officers'), consumptionController.getConsumptionRecords);
router.post('/', authorizeRoles('System administrators', 'Billing officers'), consumptionController.createConsumptionRecord);
router.put('/:id', authorizeRoles('System administrators', 'Billing officers'), consumptionController.updateConsumptionRecord);

module.exports = router;
