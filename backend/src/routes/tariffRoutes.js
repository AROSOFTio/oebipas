const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.get('/', tariffController.getTariffs);
router.post('/', restrictTo('General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer'), tariffController.createTariff);
router.put('/:id', restrictTo('General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer'), tariffController.updateTariff);
router.delete('/:id', restrictTo('General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer'), tariffController.deleteTariff);

module.exports = router;

