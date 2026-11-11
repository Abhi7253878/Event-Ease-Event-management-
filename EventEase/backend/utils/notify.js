const Notification = require('../models/Notification');
module.exports = (user, title, message, type = 'system') => Notification.create({ user, title, message, type }).catch(() => {});
