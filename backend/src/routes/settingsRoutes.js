const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', settingsController.getSettings);
// Only Super Admin can mutate settings
router.put('/', restrictTo('Super Admin'), settingsController.updateSettings);

module.exports = router;
