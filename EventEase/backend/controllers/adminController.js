const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const lastNDays = n => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (n - 1 - i)); return d; });
async function trend(match, days = 7) {
  const ds = lastNDays(days);
  const regs = await Registration.find({ ...match, registeredAt: { $gte: ds[0] } }).select('registeredAt');
  return ds.map(d => ({ date: d.toISOString().slice(5, 10), registrations: regs.filter(r => r.registeredAt.toDateString() === d.toDateString()).length }));
}
exports.trend = trend;

exports.dashboard = asyncHandler(async (req, res) => {
  const [users, events, registrations, organizers, categories, recentUsers, recentRegs] = await Promise.all([
    User.countDocuments(), Event.countDocuments(), Registration.countDocuments({ registrationStatus: 'confirmed' }),
    Event.distinct('organizer'), Category.find(),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    Registration.find().sort({ registeredAt: -1 }).limit(6).populate('user', 'name').populate('event', 'title'),
  ]);
  const byCategory = await Promise.all(categories.map(async c => ({ name: c.name, events: await Event.countDocuments({ category: c._id }) })));
  res.json({ stats: { users, events, registrations, activeOrganizers: organizers.length }, trend: await trend({ registrationStatus: 'confirmed' }, 7), byCategory, recentUsers, recentRegs });
});

exports.users = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const q = {};
  if (role) q.role = role;
  if (search) q.$or = [{ name: { $regex: esc(search), $options: 'i' } }, { email: { $regex: esc(search), $options: 'i' } }];
  res.json({ users: await User.find(q).sort({ createdAt: -1 }) });
});
exports.updateUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw httpError(404, 'User not found');
  if (String(u._id) === String(req.user._id)) throw httpError(400, 'You cannot modify your own account here');
  if (req.body.role && ['attendee', 'organizer', 'admin'].includes(req.body.role)) u.role = req.body.role;
  if (req.body.isActive !== undefined) u.isActive = !!req.body.isActive;
  await u.save();
  res.json({ user: u });
});
exports.deleteUser = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw httpError(404, 'User not found');
  if (String(u._id) === String(req.user._id)) throw httpError(400, 'You cannot delete yourself');
  await u.deleteOne();
  res.json({ message: 'User deleted' });
});
exports.events = asyncHandler(async (req, res) => {
  res.json({ events: await Event.find().sort({ createdAt: -1 }).populate('category', 'name').populate('organizer', 'name email') });
});

exports.listCategories = asyncHandler(async (_req, res) => res.json({ categories: await Category.find().sort({ name: 1 }) }));
exports.createCategory = asyncHandler(async (req, res) => {
  if (!req.body.name?.trim()) throw httpError(400, 'Category name is required');
  res.status(201).json({ category: await Category.create({ name: req.body.name.trim(), description: req.body.description || '' }) });
});
exports.updateCategory = asyncHandler(async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description }, { new: true, runValidators: true });
  if (!c) throw httpError(404, 'Category not found');
  res.json({ category: c });
});
exports.deleteCategory = asyncHandler(async (req, res) => {
  if (await Event.exists({ category: req.params.id })) throw httpError(400, 'Category is used by existing events');
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});
