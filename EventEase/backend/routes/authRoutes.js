const r = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
r.post('/register', c.register); r.post('/login', c.login); r.get('/me', protect, c.me);
module.exports = r;
