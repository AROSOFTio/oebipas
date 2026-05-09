const express = require('express');
const tariffController = require('../controllers/tariffController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('System administrator', 'Billing Officer'), tariffController.getTariffs);
router.post('/', authorizeRoles('System administrator'), tariffController.createTariff);
router.put('/:id', authorizeRoles('System administrator'), tariffController.updateTariff);
router.delete('/:id', authorizeRoles('System administrator'), tariffController.deleteTariff);

module.exports = router;
