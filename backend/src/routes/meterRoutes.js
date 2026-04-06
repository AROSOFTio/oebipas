const express = require('express');
const router = express.Router();
const meterController = require('../controllers/meterController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), meterController.getMeters);
router.post('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), meterController.createMeter);
router.put('/:id', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), meterController.updateMeter);

module.exports = router;

