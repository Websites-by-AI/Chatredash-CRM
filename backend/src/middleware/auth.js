const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-secret-key-rotbar';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ userId: payload.sub }).lean();
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

const requireReferrer = (req, res, next) => {
  if (!req.user || !['referrer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Referrer only' });
  }
  next();
};

const makeToken = (userId, role) => {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { authenticate, requireAdmin, requireReferrer, makeToken };
