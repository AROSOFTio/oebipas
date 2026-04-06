const express = require('express');
const router = express.Router();
const serviceConnectionController = require('../controllers/serviceConnectionController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), serviceConnectionController.getConnections);
router.post('/', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), serviceConnectionController.createConnection);
router.put('/:id', restrictTo('General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer'), serviceConnectionController.updateConnection);

module.exports = router;

