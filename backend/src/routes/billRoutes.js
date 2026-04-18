const express = require('express');
const billController = require('../controllers/billController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/mine', authorizeRoles('Customer'), billController.getMyBills);
router.get('/', authorizeRoles('Branch Manager', 'Billing Staff'), billController.getBills);
router.get('/:id', billController.getBillById);

module.exports = router;
