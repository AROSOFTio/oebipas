const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', feedbackController.getFeedback);
router.post('/', feedbackController.submitFeedback);
router.patch('/:id/status', restrictTo('General Manager', 'Branch Manager', 'Help Desk'), feedbackController.updateFeedbackStatus);

module.exports = router;

