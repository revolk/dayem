// backend/src/routes/admin.js
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const mongoose = require('mongoose');
const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const Coupon  = require('../models/Coupon');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Admin Auth Middleware ─────────────────────────────────────────────────────
const adminGuard = async (req, res, next) => {
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

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/admin/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: 'بيانات غير صحيحة' });
    res.json({
      success: true,
      token: makeToken(admin._id),
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', adminGuard, async (req, res) => {
  try {
    const [
      totalMerchants, activeMerchants,
      starterCount, tajerCount, proCount,
      totalOrders, totalRevenue,
      newToday, ordersToday
    ] = await Promise.all([
      User.countDocuments({ role: 'merchant' }),
      User.countDocuments({ role: 'merchant', isActive: true }),
      User.countDocuments({ role: 'merchant', 'store.plan': 'starter' }),
      User.countDocuments({ role: 'merchant', 'store.plan': 'merchant' }),
      User.countDocuments({ role: 'merchant', 'store.plan': 'pro' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { orderStatus: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$finalPrice' } } }]),
      User.countDocuments({ role: 'merchant', createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    ]);

    // آخر 7 أيام تجار جدد — Egypt timezone (UTC+2)
    const last7 = await User.aggregate([
      { $match: { role: 'merchant', createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Africa/Cairo' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // آخر 7 أيام طلبات — Egypt timezone
    const ordersLast7 = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Africa/Cairo' } },
        count: { $sum: 1 },
        revenue: { $sum: '$finalPrice' }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        merchants: { total: totalMerchants, active: activeMerchants, newToday },
        plans: { starter: starterCount, tajer: tajerCount, pro: proCount },
        orders: { total: totalOrders, today: ordersToday },
        revenue: totalRevenue[0]?.total || 0,
        charts: { merchants: last7, orders: ordersLast7 }
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/merchants ──────────────────────────────────────────────────
router.get('/merchants', adminGuard, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', plan = '', status = '' } = req.query;
    const query = { role: 'merchant' };
    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
        { 'store.name': { $regex: safe, $options: 'i' } },
      ];
    }
    if (plan) query['store.plan'] = plan;
    if (status === 'active')   query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const [merchants, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip((page-1)*limit).limit(Number(limit))
        .select('-password'),
      User.countDocuments(query)
    ]);

    // جلب إحصائيات كل تاجر
    const ids = merchants.map(m => m._id);
    const orderStats = await Order.aggregate([
      { $match: { merchant: { $in: ids } } },
      { $group: { _id: '$merchant', orders: { $sum: 1 }, revenue: { $sum: '$finalPrice' } } }
    ]);
    const statsMap = {};
    orderStats.forEach(s => { statsMap[s._id.toString()] = s; });

    res.json({
      success: true,
      merchants: merchants.map(m => ({
        ...m.toObject(),
        orders:  statsMap[m._id.toString()]?.orders  || 0,
        revenue: statsMap[m._id.toString()]?.revenue || 0,
      })),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/merchants/:id ──────────────────────────────────────────────
router.get('/merchants/:id', adminGuard, async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('-password');
    if (!merchant) return res.status(404).json({ message: 'التاجر غير موجود' });

    const [orders, products] = await Promise.all([
      Order.find({ merchant: merchant._id }).sort('-createdAt').limit(10),
      Product.countDocuments({ merchant: merchant._id })
    ]);
    const revenue = orders.filter(o => o.orderStatus !== 'cancelled').reduce((s,o) => s + o.finalPrice, 0);

    res.json({ success: true, merchant, orders, stats: { products, orders: orders.length, revenue } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/admin/merchants/:id ──────────────────────────────────────────────
router.put('/merchants/:id', adminGuard, async (req, res) => {
  try {
    const { plan, isActive } = req.body;
    // Support both { plan: 'pro' } and { 'store.plan': 'pro' }
    const planValue = plan || req.body['store.plan'];
    const update = {};
    if (planValue !== undefined)  update['store.plan'] = planValue;
    if (isActive !== undefined)   update.isActive = isActive;

    const merchant = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).select('-password');
    if (!merchant) return res.status(404).json({ message: 'التاجر غير موجود' });
    res.json({ success: true, merchant });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/admin/merchants/:id ──────────────────────────────────────────
router.delete('/merchants/:id', adminGuard, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
router.get('/orders', adminGuard, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [orders, total] = await Promise.all([
      Order.find().sort('-createdAt').skip((page-1)*limit).limit(Number(limit))
        .populate('merchant', 'name store.name store.slug'),
      Order.countDocuments()
    ]);
    res.json({ success: true, orders, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
