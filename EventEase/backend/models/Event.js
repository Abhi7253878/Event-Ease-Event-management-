const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bannerImage: { type: String, default: '' },
  date: { type: Date, required: true, index: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  ticketPrice: { type: Number, default: 0, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  registrationCount: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });
eventSchema.virtual('isFree').get(function () { return this.ticketPrice === 0; });
eventSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Event', eventSchema);
