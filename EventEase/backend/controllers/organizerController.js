const Event = require('../models/Event');
const Registration = require('../models/Registration');
const asyncHandler = require('../utils/asyncHandler');
const { trend } = require('./adminController');

exports.dashboard = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).populate('category', 'name').sort({ date: 1 });
  const ids = events.map(e => e._id);
  const now = new Date();
  const recent = await Registration.find({ event: { $in: ids } }).sort({ registeredAt: -1 }).limit(8).populate('user', 'name email').populate('event', 'title');
  res.json({
    stats: {
      totalEvents: events.length,
      totalParticipants: events.reduce((s, e) => s + e.registrationCount, 0),
      upcomingEvents: events.filter(e => e.status === 'upcoming' && e.date >= now).length,
      totalCapacity: events.reduce((s, e) => s + e.capacity, 0),
    },
    events, recent,
    trend: await trend({ event: { $in: ids }, registrationStatus: 'confirmed' }, 7),
    perEvent: events.map(e => ({ name: e.title.slice(0, 18), registrations: e.registrationCount, capacity: e.capacity })),
  });
});
exports.attendeeDashboard = asyncHandler(async (req, res) => {
  const regs = await Registration.find({ user: req.user._id, registrationStatus: 'confirmed' }).sort({ registeredAt: -1 }).populate({ path: 'event', populate: { path: 'category', select: 'name' } });
  const valid = regs.filter(r => r.event);
  const now = new Date(new Date().toDateString());
  res.json({
    stats: { total: valid.length, upcoming: valid.filter(r => r.event.date >= now && r.event.status === 'upcoming').length, completed: valid.filter(r => r.event.date < now || r.event.status === 'completed').length },
    recent: valid.slice(0, 5),
  });
});
