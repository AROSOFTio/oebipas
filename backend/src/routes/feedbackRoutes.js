const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', feedbackController.getFeedback);
router.post('/', feedbackController.submitFeedback);
router.patch('/:id/status', restrictTo('Super Admin', 'Billing Officer', 'Finance Officer'), feedbackController.updateFeedbackStatus);

module.exports = router;
