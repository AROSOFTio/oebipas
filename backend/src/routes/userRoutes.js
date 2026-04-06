const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

// Administration: General Manager can view, IT Officer can view and mutate
router.use(authenticateToken);

router.get('/', restrictTo('IT Officer', 'General Manager'), userController.getUsers);
router.post('/', restrictTo('IT Officer'), userController.createUser);
router.put('/:id', restrictTo('IT Officer'), userController.updateUser);
router.delete('/:id', restrictTo('IT Officer'), userController.deleteUser);

module.exports = router;
