const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const notify = require('../utils/notify');
const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const clean = u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, profileImage: u.profileImage, createdAt: u.createdAt });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (await User.findOne({ email: String(email).toLowerCase() })) throw httpError(409, 'Email already registered');
  // Admin can never be self-assigned
  const safeRole = role === 'organizer' ? 'organizer' : 'attendee';
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: safeRole });
  notify(user._id, 'Welcome to EventEase!', 'Your account is ready. Start exploring events.', 'system');
  res.status(201).json({ token: sign(user._id), user: clean(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw httpError(401, 'Invalid email or password');
  if (!user.isActive) throw httpError(403, 'Account disabled');
  res.json({ token: sign(user._id), user: clean(user) });
});

exports.me = asyncHandler(async (req, res) => res.json({ user: clean(req.user) }));
