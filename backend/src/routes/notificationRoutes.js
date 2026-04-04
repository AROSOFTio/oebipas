const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.post('/mark-read', notificationController.markAsRead);
router.post('/broadcast', restrictTo('Super Admin', 'Billing Officer'), notificationController.sendBroadcast);

module.exports = router;
