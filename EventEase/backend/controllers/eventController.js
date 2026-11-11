const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { saveImage } = require('../utils/upload');

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
function validate(b, partial = false) {
  const req = ['title', 'description', 'category', 'date', 'startTime', 'endTime', 'location', 'capacity'];
  if (!partial) for (const f of req) if (b[f] === undefined || b[f] === '') throw httpError(400, `${f} is required`);
  if (b.startTime && !timeRe.test(b.startTime)) throw httpError(400, 'startTime must be HH:mm');
  if (b.endTime && !timeRe.test(b.endTime)) throw httpError(400, 'endTime must be HH:mm');
  if (b.capacity !== undefined && (!Number.isInteger(+b.capacity) || +b.capacity < 1)) throw httpError(400, 'capacity must be a positive integer');
  if (b.ticketPrice !== undefined && (isNaN(+b.ticketPrice) || +b.ticketPrice < 0)) throw httpError(400, 'ticketPrice must be >= 0');
  if (b.date && isNaN(new Date(b.date))) throw httpError(400, 'Invalid date');
}
const FIELDS = ['title', 'description', 'category', 'date', 'startTime', 'endTime', 'location', 'ticketPrice', 'capacity'];
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getEvents = asyncHandler(async (req, res) => {
  const { search, category, from, to, free, featured, status, organizer, page = 1, limit = 9, sort = 'date' } = req.query;
  const q = {};
  if (search) q.$or = ['title', 'description', 'location'].map(f => ({ [f]: { $regex: esc(search), $options: 'i' } }));
  if (category && mongoose.isValidObjectId(category)) q.category = category;
  if (organizer && mongoose.isValidObjectId(organizer)) q.organizer = organizer;
  if (from || to) { q.date = {}; if (from) q.date.$gte = new Date(from); if (to) q.date.$lte = new Date(to); }
  if (free === 'true') q.ticketPrice = 0;
  if (free === 'false') q.ticketPrice = { $gt: 0 };
  if (featured === 'true') q.featured = true;
  if (status !== 'all') q.status = status || { $ne: 'cancelled' };
  const p = Math.max(1, +page), l = Math.min(50, Math.max(1, +limit));
  const sorts = { date: { date: 1 }, newest: { createdAt: -1 }, price: { ticketPrice: 1 }, popular: { registrationCount: -1 } };
  const [events, total] = await Promise.all([
    Event.find(q).populate('category', 'name').populate('organizer', 'name').sort(sorts[sort] || sorts.date).skip((p - 1) * l).limit(l),
    Event.countDocuments(q),
  ]);
  res.json({ events, page: p, pages: Math.ceil(total / l), total });
});

exports.getEvent = asyncHandler(async (req, res) => {
  const e = await Event.findById(req.params.id).populate('category', 'name').populate('organizer', 'name email profileImage');
  if (!e) throw httpError(404, 'Event not found');
  let myRegistration = null;
  if (req.user) myRegistration = await Registration.findOne({ user: req.user._id, event: e._id, registrationStatus: 'confirmed' });
  res.json({ event: e, myRegistration });
});

exports.createEvent = asyncHandler(async (req, res) => {
  validate(req.body);
  if (!(await Category.findById(req.body.category))) throw httpError(400, 'Category does not exist');
  const data = { organizer: req.user._id };
  FIELDS.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
  const img = await saveImage(req.file); if (img) data.bannerImage = img;
  const e = await Event.create(data);
  res.status(201).json({ event: e });
});

async function loadOwned(req) {
  const e = await Event.findById(req.params.id);
  if (!e) throw httpError(404, 'Event not found');
  if (req.user.role !== 'admin' && String(e.organizer) !== String(req.user._id)) throw httpError(403, 'You can only manage your own events');
  return e;
}
exports.updateEvent = asyncHandler(async (req, res) => {
  const e = await loadOwned(req);
  validate(req.body, true);
  if (req.body.capacity !== undefined && +req.body.capacity < e.registrationCount) throw httpError(400, `Capacity cannot be lower than current registrations (${e.registrationCount})`);
  FIELDS.forEach(f => { if (req.body[f] !== undefined) e[f] = req.body[f]; });
  if (req.body.status && ['upcoming', 'completed', 'cancelled'].includes(req.body.status)) e.status = req.body.status;
  if (req.user.role === 'admin' && req.body.featured !== undefined) e.featured = String(req.body.featured) === 'true';
  const img = await saveImage(req.file); if (img) e.bannerImage = img;
  await e.save();
  res.json({ event: e });
});
exports.deleteEvent = asyncHandler(async (req, res) => {
  const e = await loadOwned(req);
  await Registration.deleteMany({ event: e._id });
  await e.deleteOne();
  res.json({ message: 'Event deleted' });
});
