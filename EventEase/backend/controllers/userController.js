const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { saveImage } = require('../utils/upload');

exports.getProfile = asyncHandler(async (req, res) => res.json({ user: req.user }));
exports.updateProfile = asyncHandler(async (req, res) => {
  const u = await User.findById(req.user._id).select('+password');
  if (req.body.name) u.name = req.body.name;
  if (req.body.phone !== undefined) u.phone = req.body.phone;
  if (req.body.password) {
    if (req.body.password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
    u.password = await bcrypt.hash(req.body.password, 10);
  }
  const img = await saveImage(req.file);
  if (img) u.profileImage = img;
  await u.save();
  const { password, ...rest } = u.toObject();
  res.json({ user: rest });
});
exports.getNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ notifications: items, unread: items.filter(n => !n.isRead).length });
});
exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true });
  if (!n) throw httpError(404, 'Notification not found');
  res.json({ notification: n });
});
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
});
