const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticateToken, restrictTo } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(restrictTo('Super Admin', 'Viewer'));

router.get('/', auditLogController.getAuditLogs);

module.exports = router;
