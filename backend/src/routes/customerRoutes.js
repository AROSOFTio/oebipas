const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', authorizeRoles('Customer'), customerController.getMyProfile);
router.put('/me', authorizeRoles('Customer'), customerController.updateMyProfile);

router.get('/', authorizeRoles('Branch Manager', 'Billing Staff'), customerController.getCustomers);
router.get('/:id', authorizeRoles('Branch Manager', 'Billing Staff'), customerController.getCustomerById);
router.post('/', authorizeRoles('Branch Manager'), customerController.createCustomer);
router.put('/:id', authorizeRoles('Branch Manager'), customerController.updateCustomer);
router.delete('/:id', authorizeRoles('Branch Manager'), customerController.deleteCustomer);

module.exports = router;
