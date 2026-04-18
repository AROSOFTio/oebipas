const express = require('express');
const consumptionController = require('../controllers/consumptionController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/mine', authorizeRoles('Customer'), consumptionController.getMyConsumption);
router.get('/', authorizeRoles('Branch Manager', 'Billing Staff'), consumptionController.getConsumptionRecords);
router.post('/', authorizeRoles('Branch Manager', 'Billing Staff'), consumptionController.createConsumptionRecord);
router.put('/:id', authorizeRoles('Branch Manager', 'Billing Staff'), consumptionController.updateConsumptionRecord);

module.exports = router;
