const express = require('express');
const tariffController = require('../controllers/tariffController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('System administrators', 'Billing officers'), tariffController.getTariffs);
router.post('/', authorizeRoles('System administrators'), tariffController.createTariff);
router.put('/:id', authorizeRoles('System administrators'), tariffController.updateTariff);
router.delete('/:id', authorizeRoles('System administrators'), tariffController.deleteTariff);

module.exports = router;
