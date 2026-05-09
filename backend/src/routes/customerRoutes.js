const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', authorizeRoles('Customer'), customerController.getMyProfile);
router.put('/me', authorizeRoles('Customer'), customerController.updateMyProfile);
router.post('/me/deactivate', authorizeRoles('Customer'), customerController.deactivateMyAccount);

router.get('/', authorizeRoles('System administrator', 'Billing Officer'), customerController.getCustomers);
router.get('/:id', authorizeRoles('System administrator', 'Billing Officer'), customerController.getCustomerById);
router.post('/', authorizeRoles('System administrator', 'Billing Officer'), customerController.createCustomer);
router.put('/:id', authorizeRoles('System administrator', 'Billing Officer'), customerController.updateCustomer);
router.delete('/:id', authorizeRoles('System administrator', 'Billing Officer'), customerController.deleteCustomer);

module.exports = router;
