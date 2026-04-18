const express = require('express');
const tariffController = require('../controllers/tariffController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('Branch Manager', 'Billing Staff'), tariffController.getTariffs);
router.post('/', authorizeRoles('Branch Manager'), tariffController.createTariff);
router.put('/:id', authorizeRoles('Branch Manager'), tariffController.updateTariff);
router.delete('/:id', authorizeRoles('Branch Manager'), tariffController.deleteTariff);

module.exports = router;
