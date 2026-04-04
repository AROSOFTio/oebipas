const express = require('express');
const router = express.Router();
const penaltyController = require('../controllers/penaltyController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer'), penaltyController.getAllPenalties);
router.post('/apply', restrictTo('Super Admin', 'Billing Officer'), penaltyController.applyBulkPenalties);
router.get('/customer/:id', penaltyController.getCustomerPenalties);
router.put('/:id/waive', restrictTo('Super Admin', 'Billing Officer'), penaltyController.waivePenalty);

module.exports = router;
