const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/', tariffController.getTariffs);
router.post('/', restrictTo('Super Admin'), tariffController.createTariff);
router.put('/:id', restrictTo('Super Admin'), tariffController.updateTariff);
router.delete('/:id', restrictTo('Super Admin'), tariffController.deleteTariff);

module.exports = router;
