const express = require('express');
const router = express.Router();
const serviceConnectionController = require('../controllers/serviceConnectionController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', restrictTo('Super Admin', 'Billing Officer'), serviceConnectionController.getConnections);
router.post('/', restrictTo('Super Admin', 'Billing Officer'), serviceConnectionController.createConnection);
router.put('/:id', restrictTo('Super Admin', 'Billing Officer'), serviceConnectionController.updateConnection);

module.exports = router;
