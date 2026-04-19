const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.get('/', authorizeRoles('System administrators', 'Billing officers', 'Electricity consumers'), dashboardController.getDashboard);

module.exports = router;
