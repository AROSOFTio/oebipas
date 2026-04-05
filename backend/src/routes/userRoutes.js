const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

// Only Super Admin and Billing Officer can interact with users directly in this demo
router.use(authenticateToken);

router.get('/', restrictTo('Super Admin', 'Billing Officer'), userController.getUsers);
router.post('/', restrictTo('Super Admin'), userController.createUser);
router.put('/:id', restrictTo('Super Admin'), userController.updateUser);
router.delete('/:id', restrictTo('Super Admin'), userController.deleteUser);

module.exports = router;
