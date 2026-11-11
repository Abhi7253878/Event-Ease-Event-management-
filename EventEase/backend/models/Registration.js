const mongoose = require('mongoose');
const regSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  bookingReference: { type: String, required: true, unique: true },
  registrationStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  registeredAt: { type: Date, default: Date.now },
});
// One registration document per (user,event): re-registering after cancel reuses it -> no duplicates ever.
regSchema.index({ user: 1, event: 1 }, { unique: true });
module.exports = mongoose.model('Registration', regSchema);
