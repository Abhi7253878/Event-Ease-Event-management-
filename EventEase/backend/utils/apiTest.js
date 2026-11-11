// Run: npm run test  (requires API running on :5000 and seeded DB)
const B = process.env.API || 'http://localhost:5000/api';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${cond ? '' : extra}`); };
const call = async (method, path, body, token, form) => {
  const r = await fetch(B + path, { method, headers: { ...(body && !form ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: form || (body ? JSON.stringify(body) : undefined) });
  let d = {}; try { d = await r.json(); } catch {} return { s: r.status, d };
};
const login = async (email) => (await call('POST', '/auth/login', { email, password: 'password123' })).d.token;
(async () => {
  const uniq = Date.now();
  // 1 register
  let r = await call('POST', '/auth/register', { name: 'Test User', email: `t${uniq}@x.com`, password: 'secret12', role: 'admin' });
  ok('1 register returns 201 + token', r.s === 201 && r.d.token);
  ok('1 register cannot self-assign admin', r.d.user.role === 'attendee');
  ok('1 password not exposed', !JSON.stringify(r.d).includes('secret12') && !r.d.user.password);
  r = await call('POST', '/auth/register', { name: 'Dup', email: `t${uniq}@x.com`, password: 'secret12' }); ok('1 duplicate email -> 409', r.s === 409);
  r = await call('POST', '/auth/register', { name: 'A', email: 'bad', password: '1' }); ok('1 invalid input -> 400', r.s === 400);
  // 2/3 login + JWT
  r = await call('POST', '/auth/login', { email: 'attendee@eventease.com', password: 'wrong' }); ok('2 wrong password -> 401', r.s === 401);
  const att = await login('attendee@eventease.com'), org = await login('organizer@eventease.com'), adm = await login('admin@eventease.com');
  ok('2 login success', att && org && adm);
  r = await call('GET', '/auth/me', null, att); ok('3 /auth/me with token', r.s === 200 && r.d.user.email === 'attendee@eventease.com');
  r = await call('GET', '/auth/me'); ok('3 /auth/me without token -> 401', r.s === 401);
  r = await call('GET', '/auth/me', null, 'garbage.token.here'); ok('3 invalid token -> 401', r.s === 401);
  // 4 roles
  r = await call('GET', '/admin/users', null, att); ok('4 attendee blocked from admin -> 403', r.s === 403);
  r = await call('GET', '/admin/users', null, org); ok('4 organizer blocked from admin -> 403', r.s === 403);
  const cats = (await call('GET', '/admin/categories')).d.categories; const cat = cats[0]._id;
  const ev = { title: 'Test Event', description: 'desc', category: cat, date: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10), startTime: '09:00', endTime: '11:00', location: 'Test City', ticketPrice: 0, capacity: 2 };
  r = await call('POST', '/events', ev, att); ok('4 attendee cannot create event -> 403', r.s === 403);
  // 5 create
  r = await call('POST', '/events', { ...ev, title: '' }, org); ok('5 create validation -> 400', r.s === 400);
  r = await call('POST', '/events', ev, org); ok('5 organizer creates event -> 201', r.s === 201); const id = r.d.event._id;
  // upload
  const fd = new FormData(); fd.append('title', 'Banner Event'); Object.entries({ ...ev, title: 'Banner Event' }).forEach(([k, v]) => fd.set(k, v));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  fd.append('bannerImage', new Blob([png], { type: 'image/png' }), 'b.png');
  r = await call('POST', '/events', null, org, fd); ok('5 banner upload works', r.s === 201 && r.d.event.bannerImage.startsWith('/uploads/'), JSON.stringify(r.d));
  const bannerId = r.d.event._id;
  const fd2 = new FormData(); Object.entries(ev).forEach(([k, v]) => fd2.set(k, v)); fd2.append('bannerImage', new Blob(['<?php ?>'], { type: 'text/plain' }), 'x.php');
  r = await call('POST', '/events', null, org, fd2); ok('5 non-image upload rejected -> 400', r.s === 400);
  // 6 edit
  r = await call('PUT', `/events/${id}`, { title: 'Test Event Edited' }, org); ok('6 owner edits event', r.s === 200 && r.d.event.title === 'Test Event Edited');
  const org2 = (await call('POST', '/auth/register', { name: 'Org Two', email: `o${uniq}@x.com`, password: 'secret12', role: 'organizer' })).d.token;
  r = await call('PUT', `/events/${id}`, { title: 'Hack' }, org2); ok('6 other organizer cannot edit -> 403', r.s === 403);
  r = await call('DELETE', `/events/${id}`, null, org2); ok('6 other organizer cannot delete -> 403', r.s === 403);
  // 8/9 browse+filter
  r = await call('GET', '/events?limit=3&page=1'); ok('8 pagination works', r.s === 200 && r.d.events.length === 3 && r.d.pages >= 1);
  r = await call('GET', '/events?search=marathon'); ok('9 search works', r.d.events.length === 1 && /marathon/i.test(r.d.events[0].title));
  r = await call('GET', `/events?category=${cat}`); ok('9 category filter', r.d.events.every(e => e.category._id === cat) && r.d.events.length > 0);
  r = await call('GET', '/events?free=false'); ok('9 paid filter', r.d.events.every(e => e.ticketPrice > 0));
  r = await call('GET', '/events?search=.*(' ); ok('9 regex chars safe (no 500)', r.s === 200);
  r = await call('GET', `/events/${id}`); ok('8 event detail', r.s === 200 && r.d.event._id === id);
  r = await call('GET', '/events/notanid'); ok('8 bad id -> 400', r.s === 400);
  // 10 register
  r = await call('POST', '/registrations', { eventId: id }); ok('10 unauthenticated register -> 401', r.s === 401);
  r = await call('POST', '/registrations', { eventId: id }, att); ok('10 register -> 201 with reference', r.s === 201 && /^EE-/.test(r.d.registration.bookingReference)); const regId = r.d.registration._id;
  r = await call('GET', `/events/${id}`); ok('10 registrationCount = 1', r.d.event.registrationCount === 1);
  // 11 duplicate
  r = await call('POST', '/registrations', { eventId: id }, att); ok('11 duplicate -> 409', r.s === 409);
  r = await call('GET', `/events/${id}`); ok('11 count unchanged after duplicate', r.d.event.registrationCount === 1);
  // 12 capacity + concurrency
  const u2 = (await call('POST', '/auth/register', { name: 'U Two', email: `u2${uniq}@x.com`, password: 'secret12' })).d.token;
  const u3 = (await call('POST', '/auth/register', { name: 'U Three', email: `u3${uniq}@x.com`, password: 'secret12' })).d.token;
  const u4 = (await call('POST', '/auth/register', { name: 'U Four', email: `u4${uniq}@x.com`, password: 'secret12' })).d.token;
  const race = await Promise.all([u2, u3, u4].map(t => call('POST', '/registrations', { eventId: id }, t)));
  ok('12 concurrent: exactly 1 more seat granted (capacity 2)', race.filter(x => x.s === 201).length === 1 && race.filter(x => x.s === 409).length === 2, JSON.stringify(race.map(x => x.s)));
  r = await call('GET', `/events/${id}`); ok('12 count never exceeds capacity', r.d.event.registrationCount === 2);
  r = await call('PUT', `/events/${id}`, { capacity: 1 }, org); ok('12 cannot reduce capacity below registrations', r.s === 400);
  const paid = (await call('GET', '/events?free=false&limit=50')).d.events.find(e => e.ticketPrice > 0);
  r = await call('POST', '/registrations', { eventId: paid._id }, att); ok('12 paid event honestly rejected (not faked)', r.s === 400 && /not implemented/i.test(r.d.message));
  // participants
  r = await call('GET', `/registrations/event/${id}`, null, org); ok('organizer sees participants', r.s === 200 && r.d.registrations.length === 2);
  r = await call('GET', `/registrations/event/${id}`, null, att); ok('attendee cannot see participants -> 403', r.s === 403);
  r = await call('GET', `/registrations/event/${id}`, null, org2); ok('other organizer cannot see participants -> 403', r.s === 403);
  r = await call('GET', '/registrations/my', null, att); ok('my registrations', r.s === 200 && r.d.registrations.length >= 1);
  // 13 cancel
  r = await call('DELETE', `/registrations/${regId}`, null, u2); ok('13 cannot cancel others booking -> 403', r.s === 403);
  r = await call('DELETE', `/registrations/${regId}`, null, att); ok('13 cancel own booking', r.s === 200);
  r = await call('DELETE', `/registrations/${regId}`, null, att); ok('13 double cancel -> 400', r.s === 400);
  r = await call('GET', `/events/${id}`); ok('13 count decremented exactly once (=1)', r.d.event.registrationCount === 1, r.d.event.registrationCount);
  r = await call('POST', '/registrations', { eventId: id }, att); ok('13 re-book after cancel works', r.s === 201);
  r = await call('GET', `/events/${id}`); ok('13 count back to 2', r.d.event.registrationCount === 2);
  // notifications
  r = await call('GET', '/notifications', null, att); ok('notifications list', r.s === 200 && r.d.notifications.length > 0);
  r = await call('PATCH', `/notifications/${r.d.notifications[0]._id}/read`, null, att); ok('notification mark read', r.s === 200 && r.d.notification.isRead);
  // profile
  r = await call('PUT', '/users/profile', { phone: '9999999999', name: 'Alex A' }, att); ok('profile update', r.s === 200 && r.d.user.phone === '9999999999' && !r.d.user.password);
  // dashboards
  r = await call('GET', '/users/dashboard/organizer', null, org); ok('organizer dashboard', r.s === 200 && r.d.stats.totalEvents >= 1);
  r = await call('GET', '/users/dashboard/attendee', null, att); ok('attendee dashboard', r.s === 200 && r.d.stats.total >= 1);
  // 14 admin
  r = await call('GET', '/admin/dashboard', null, adm); ok('14 admin dashboard', r.s === 200 && r.d.stats.users >= 4 && r.d.trend.length === 7);
  r = await call('GET', '/admin/users', null, adm); ok('14 admin lists users', r.s === 200 && r.d.users.length >= 4);
  r = await call('GET', '/admin/events', null, adm); ok('14 admin lists events', r.s === 200 && r.d.events.length >= 9);
  const target = r.d && (await call('GET', '/admin/users?search=Org Two', null, adm)).d.users[0];
  r = await call('PATCH', `/admin/users/${target._id}`, { isActive: false }, adm); ok('14 admin disables user', r.s === 200 && r.d.user.isActive === false);
  r = await call('GET', '/auth/me', null, org2); ok('14 disabled user token rejected', r.s === 401);
  r = await call('POST', '/admin/categories', { name: 'TestCat' + uniq }, adm); ok('14 admin creates category', r.s === 201); const cid = r.d.category._id;
  r = await call('DELETE', `/admin/categories/${cid}`, null, adm); ok('14 admin deletes category', r.s === 200);
  r = await call('DELETE', `/admin/categories/${cat}`, null, adm); ok('14 cannot delete category in use -> 400', r.s === 400);
  // 6 delete
  r = await call('DELETE', `/events/${id}`, null, org); ok('6 owner deletes event', r.s === 200);
  r = await call('GET', `/events/${id}`); ok('6 deleted event -> 404', r.s === 404);
  r = await call('DELETE', `/events/${bannerId}`, null, adm); ok('14 admin deletes any event', r.s === 200);
  r = await call('GET', '/nope'); ok('unknown route -> 404 JSON', r.s === 404 && r.d.message);
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
