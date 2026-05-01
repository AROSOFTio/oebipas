const express = require('express');
const supportController = require('../controllers/supportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/tickets', authorizeRoles('Electricity consumers'), supportController.createTicket);
router.get('/tickets/mine', authorizeRoles('Electricity consumers'), supportController.getMyTickets);
router.get('/tickets', authorizeRoles('System administrators', 'Billing officers'), supportController.getTickets);
router.get('/tickets/:id', authorizeRoles('System administrators', 'Billing officers'), supportController.getTicketById);
router.put('/tickets/:id', authorizeRoles('System administrators', 'Billing officers'), supportController.updateTicket);

module.exports = router;
