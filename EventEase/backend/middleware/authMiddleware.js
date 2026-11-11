const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized, token missing' });
    const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or disabled' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
};
exports.optionalAuth = async (req, _res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (h.startsWith('Bearer ')) req.user = await User.findById(jwt.verify(h.split(' ')[1], process.env.JWT_SECRET).id);
  } catch {}
  next();
};
