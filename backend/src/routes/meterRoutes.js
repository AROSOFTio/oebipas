const express = require('express');
const router = express.Router();
const meterController = require('../controllers/meterController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', restrictTo('Super Admin', 'Billing Officer'), meterController.getMeters);
router.post('/', restrictTo('Super Admin', 'Billing Officer'), meterController.createMeter);
router.put('/:id', restrictTo('Super Admin', 'Billing Officer'), meterController.updateMeter);

module.exports = router;
