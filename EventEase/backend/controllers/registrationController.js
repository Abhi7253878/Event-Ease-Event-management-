const crypto = require('crypto');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const notify = require('../utils/notify');
const genRef = () => 'EE-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

exports.register = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw httpError(404, 'Event not found');
  if (event.status !== 'upcoming' || new Date(event.date) < new Date(new Date().toDateString())) throw httpError(400, 'Registration is closed for this event');
  if (event.ticketPrice > 0) throw httpError(400, 'Paid event checkout is not implemented yet. Only free events can be booked.');
  if (String(event.organizer) === String(req.user._id)) throw httpError(400, 'Organizers cannot register for their own event');

  const existing = await Registration.findOne({ user: req.user._id, event: event._id });
  if (existing && existing.registrationStatus === 'confirmed') throw httpError(409, 'You are already registered for this event');

  // Atomic seat claim: succeeds only if seats remain -> prevents overbooking under concurrency.
  const claimed = await Event.findOneAndUpdate(
    { _id: event._id, registrationCount: { $lt: event.capacity } },
    { $inc: { registrationCount: 1 } }, { new: true });
  if (!claimed) throw httpError(409, 'Event is full');

  let reg;
  try {
    if (existing) { // re-book after cancellation
      reg = await Registration.findOneAndUpdate({ _id: existing._id, registrationStatus: 'cancelled' },
        { registrationStatus: 'confirmed', registeredAt: new Date(), bookingReference: genRef() }, { new: true });
      if (!reg) throw httpError(409, 'You are already registered for this event');
    } else {
      reg = await Registration.create({ user: req.user._id, event: event._id, bookingReference: genRef() });
    }
  } catch (err) {
    await Event.updateOne({ _id: event._id }, { $inc: { registrationCount: -1 } }); // roll back the seat
    throw err.code === 11000 ? httpError(409, 'You are already registered for this event') : err;
  }
  // Second safeguard (defence in depth): confirm this booking is within the first `capacity` confirmed
  // bookings (ordered deterministically). If not, a concurrent request beat us -> roll back.
  const winners = await Registration.find({ event: event._id, registrationStatus: 'confirmed' }).sort({ registeredAt: 1, _id: 1 }).limit(event.capacity).select('_id');
  if (!winners.some(w => String(w._id) === String(reg._id))) {
    await Registration.updateOne({ _id: reg._id }, { registrationStatus: 'cancelled' });
    await Event.updateOne({ _id: event._id, registrationCount: { $gt: 0 } }, { $inc: { registrationCount: -1 } });
    throw httpError(409, 'Event is full');
  }
  notify(req.user._id, 'Booking confirmed', `You are registered for "${event.title}". Ref: ${reg.bookingReference}`, 'booking');
  notify(event.organizer, 'New registration', `${req.user.name} registered for "${event.title}".`, 'event');
  res.status(201).json({ registration: reg });
});

exports.myRegistrations = asyncHandler(async (req, res) => {
  const regs = await Registration.find({ user: req.user._id }).sort({ registeredAt: -1 })
    .populate({ path: 'event', populate: [{ path: 'category', select: 'name' }, { path: 'organizer', select: 'name' }] });
  res.json({ registrations: regs.filter(r => r.event) });
});

exports.getOne = asyncHandler(async (req, res) => {
  const r = await Registration.findById(req.params.id).populate('user', 'name email').populate({ path: 'event', populate: { path: 'category', select: 'name' } });
  if (!r) throw httpError(404, 'Booking not found');
  const owner = String(r.user._id) === String(req.user._id);
  if (!owner && req.user.role !== 'admin' && String(r.event.organizer) !== String(req.user._id)) throw httpError(403, 'Not allowed');
  res.json({ registration: r });
});

exports.eventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw httpError(404, 'Event not found');
  if (req.user.role !== 'admin' && String(event.organizer) !== String(req.user._id)) throw httpError(403, 'You can only view participants of your own events');
  const regs = await Registration.find({ event: event._id }).sort({ registeredAt: -1 }).populate('user', 'name email phone');
  res.json({ event, registrations: regs });
});

exports.cancel = asyncHandler(async (req, res) => {
  const reg = await Registration.findById(req.params.id).populate('event');
  if (!reg) throw httpError(404, 'Registration not found');
  const isOwner = String(reg.user) === String(req.user._id);
  const isOrganizer = reg.event && String(reg.event.organizer) === String(req.user._id);
  if (!isOwner && !isOrganizer && req.user.role !== 'admin') throw httpError(403, 'Not allowed');
  // Atomic status flip: only the request that actually flips it decrements the counter.
  const flipped = await Registration.findOneAndUpdate({ _id: reg._id, registrationStatus: 'confirmed' }, { registrationStatus: 'cancelled' }, { new: true });
  if (!flipped) throw httpError(400, 'Registration already cancelled');
  await Event.updateOne({ _id: reg.event._id, registrationCount: { $gt: 0 } }, { $inc: { registrationCount: -1 } });
  notify(reg.user, 'Registration cancelled', `Your booking for "${reg.event.title}" was cancelled.`, 'cancellation');
  res.json({ message: 'Registration cancelled', registration: flipped });
});
