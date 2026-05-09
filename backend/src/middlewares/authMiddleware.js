const jwt = require('jsonwebtoken');
const { normalizeRoleName } = require('../utils/roles');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey2026');
    req.user.role = normalizeRoleName(req.user.role);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const userRole = normalizeRoleName(req.user.role);
  const allowedRoles = roles.map(normalizeRoleName);

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, message: `The ${req.user.role} role cannot access this resource.` });
  }

  req.user.role = userRole;
  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
