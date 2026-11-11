const r = require('express').Router();
const c = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
r.get('/categories', c.listCategories); // public
r.use(protect, role('admin'));
r.get('/dashboard', c.dashboard);
r.get('/users', c.users); r.patch('/users/:id', c.updateUser); r.delete('/users/:id', c.deleteUser);
r.get('/events', c.events);
r.post('/categories', c.createCategory); r.put('/categories/:id', c.updateCategory); r.delete('/categories/:id', c.deleteCategory);
module.exports = r;
