const r = require('express').Router();
const c = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/', c.getNotifications); r.patch('/read-all', c.markAllRead); r.patch('/:id/read', c.markRead);
module.exports = r;
