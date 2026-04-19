const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('System administrators'));

router.get('/', userController.getUsers);
router.get('/roles', userController.getRoles);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
