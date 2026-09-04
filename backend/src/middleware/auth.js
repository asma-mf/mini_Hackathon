const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the JWT from the Authorization header and attaches req.user.
 * Returns 401 if token is missing or invalid.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimal user info from token; fetch from DB only when needed
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Factory: returns middleware that enforces a specific role.
 * Must be used AFTER authenticate.
 * @param {string} role - 'user' | 'pharmacist'
 */
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: `Access restricted to ${role}s` });
  }
  next();
};

module.exports = { authenticate, requireRole };
