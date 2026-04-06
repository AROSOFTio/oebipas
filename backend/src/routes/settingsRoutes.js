const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', restrictTo('IT Officer', 'General Manager'), settingsController.getSettings);
router.put('/', restrictTo('IT Officer'), settingsController.updateSettings);

module.exports = router;
