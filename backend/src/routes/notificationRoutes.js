const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.post('/', authorizeRoles('System administrators'), notificationController.sendNotification);

module.exports = router;
