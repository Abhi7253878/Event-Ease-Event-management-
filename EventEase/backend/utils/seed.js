require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Category, Event, Registration, Notification].map(m => m.deleteMany({})));
  const pw = await bcrypt.hash('password123', 10);
  const [admin, org] = await User.create([
    { name: 'Admin User', email: 'admin@eventease.com', password: pw, role: 'admin' },
    { name: 'Olivia Organizer', email: 'organizer@eventease.com', password: pw, role: 'organizer' },
    { name: 'Alex Attendee', email: 'attendee@eventease.com', password: pw, role: 'attendee' },
  ]);
  const cats = await Category.create(['Technology', 'Music', 'Business', 'Sports', 'Art & Culture', 'Education', 'Food & Drink'].map(name => ({ name, description: `${name} events` })));
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(0, 0, 0, 0); return d; };
  const items = [
    ['React & MERN Bootcamp', 0, 6, 'Bangalore Tech Park', 0, 100, true, 'A hands-on one-day workshop building a full-stack MERN app from scratch.'],
    ['Indie Music Night', 1, 10, 'Blue Frog, Mumbai', 0, 150, true, 'An evening of live indie bands, open mic and good vibes.'],
    ['Startup Pitch Summit', 2, 14, 'Delhi Convention Centre', 0, 300, true, 'Founders pitch to investors. Network with the startup ecosystem.'],
    ['City Marathon 5K', 3, 20, 'Marine Drive, Mumbai', 0, 500, false, 'Community 5K fun run open to all fitness levels.'],
    ['Modern Art Expo', 4, 25, 'National Gallery, Pune', 0, 80, false, 'Contemporary art from emerging Indian artists.'],
    ['Cloud & DevOps Meetup', 0, 3, 'Hyderabad HITEC City', 0, 60, false, 'Talks on Kubernetes, CI/CD and cloud-native architecture.'],
    ['Campus Career Fair', 5, 30, 'IIT Patna Campus', 0, 400, false, 'Meet 40+ recruiters, attend resume reviews and mock interviews.'],
    ['Street Food Festival', 6, 18, 'Connaught Place, Delhi', 0, 250, false, 'Taste regional street food from over 50 vendors.'],
    ['Premium AI Conference', 0, 40, 'Taj Convention Centre, Mumbai', 999, 200, false, 'Paid conference (checkout not implemented; listed for display).'],
  ];
  await Event.create(items.map(([title, c, d, location, ticketPrice, capacity, featured, description], i) => ({
    title, description, category: cats[c]._id, organizer: org._id, date: day(d), startTime: '10:00', endTime: '17:00', location, ticketPrice, capacity, featured,
  })));
  console.log('Seeded. Logins (password: password123): admin@eventease.com, organizer@eventease.com, attendee@eventease.com');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
