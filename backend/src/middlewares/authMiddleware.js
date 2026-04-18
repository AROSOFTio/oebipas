const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey2026');
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `The ${req.user.role} role cannot access this resource.` });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
