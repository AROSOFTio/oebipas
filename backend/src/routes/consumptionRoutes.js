const express = require('express');
const consumptionController = require('../controllers/consumptionController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/mine', authorizeRoles('Customer'), consumptionController.getMyConsumption);
router.get('/', authorizeRoles('System administrator', 'Billing Officer'), consumptionController.getConsumptionRecords);
router.post('/', authorizeRoles('System administrator', 'Billing Officer'), consumptionController.createConsumptionRecord);
router.put('/:id', authorizeRoles('System administrator', 'Billing Officer'), consumptionController.updateConsumptionRecord);

module.exports = router;
