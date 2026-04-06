const express = require('express');
const router = express.Router();
const penaltyController = require('../controllers/penaltyController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), penaltyController.getAllPenalties);
router.post('/apply', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), penaltyController.applyBulkPenalties);
router.get('/customer/:id', penaltyController.getCustomerPenalties);
router.put('/:id/waive', restrictTo('General Manager', 'Branch Manager', 'Finance Officer'), penaltyController.waivePenalty);

module.exports = router;

