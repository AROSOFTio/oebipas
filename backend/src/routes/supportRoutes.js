const express = require('express');
const supportController = require('../controllers/supportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/tickets', authorizeRoles('Customer'), supportController.createTicket);
router.get('/tickets/mine', authorizeRoles('Customer'), supportController.getMyTickets);
router.get('/tickets', authorizeRoles('System administrator', 'Billing Officer'), supportController.getTickets);
router.get('/tickets/:id', authorizeRoles('System administrator', 'Billing Officer'), supportController.getTicketById);
router.put('/tickets/:id', authorizeRoles('System administrator', 'Billing Officer'), supportController.updateTicket);

module.exports = router;
