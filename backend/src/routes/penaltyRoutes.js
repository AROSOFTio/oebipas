const express = require('express');
const penaltyController = require('../controllers/penaltyController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.get('/', authorizeRoles('Branch Manager', 'Billing Staff'), penaltyController.getPenalties);

module.exports = router;
