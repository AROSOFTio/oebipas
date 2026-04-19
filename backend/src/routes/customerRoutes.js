const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', authorizeRoles('Electricity consumers'), customerController.getMyProfile);
router.put('/me', authorizeRoles('Electricity consumers'), customerController.updateMyProfile);

router.get('/', authorizeRoles('System administrators', 'Billing officers'), customerController.getCustomers);
router.get('/:id', authorizeRoles('System administrators', 'Billing officers'), customerController.getCustomerById);
router.post('/', authorizeRoles('System administrators', 'Billing officers'), customerController.createCustomer);
router.put('/:id', authorizeRoles('System administrators', 'Billing officers'), customerController.updateCustomer);
router.delete('/:id', authorizeRoles('System administrators', 'Billing officers'), customerController.deleteCustomer);

module.exports = router;
