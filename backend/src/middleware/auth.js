const jwt = require('jsonwebtoken');
const User = require('../models/User');

const merchantAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'توكن غير صالح' }); }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'أدمين فقط' });
    req.admin = user;
    next();
  } catch { res.status(401).json({ message: 'توكن غير صالح' }); }
};

const customerAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    const Customer = require('../models/Customer');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = await Customer.findById(decoded.id);
    if (!req.customer) return res.status(401).json({ message: 'العميل غير موجود' });
    next();
  } catch { res.status(401).json({ message: 'توكن غير صالح' }); }
};

module.exports = { merchantAuth, adminAuth, customerAuth };
