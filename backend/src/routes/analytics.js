// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ─── Middleware: Auth ─────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'غير مصرح' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'توكن غير صالح' });
  }
}

// ─── Helper: Date Range ───────────────────────────────────────────────────────
function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  switch (period) {
    case '7d':  start.setDate(now.getDate() - 7);  break;
    case '30d': start.setDate(now.getDate() - 30); break;
    case '90d': start.setDate(now.getDate() - 90); break;
    case '1y':  start.setFullYear(now.getFullYear() - 1); break;
    default:    start.setDate(now.getDate() - 30);
  }
  return { start, end: now };
}

// ─── GET /api/analytics/overview ─────────────────────────────────────────────
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const merchantObjId = new mongoose.Types.ObjectId(req.user.id);
    const { period = '30d' } = req.query;
    const { start, end } = getDateRange(period);
    const prevStart = new Date(start.getTime() - (end - start));

    const [current, previous] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            merchant: merchantObjId,
            createdAt: { $gte: start, $lte: end },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalPrice' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$finalPrice' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            merchant: merchantObjId,
            createdAt: { $gte: prevStart, $lte: start },
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalPrice' },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const curr = current[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const prev = previous[0] || { totalRevenue: 0, totalOrders: 0 };

    const revenueGrowth = prev.totalRevenue
      ? (((curr.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100).toFixed(1)
      : 0;
    const ordersGrowth = prev.totalOrders
      ? (((curr.totalOrders - prev.totalOrders) / prev.totalOrders) * 100).toFixed(1)
      : 0;

    const pendingOrders = await Order.countDocuments({
      merchant: merchantObjId,
      orderStatus: 'new'
    });

    const totalProducts = await Product.countDocuments({ merchant: merchantObjId });

    res.json({
      revenue:       { value: curr.totalRevenue,              growth: parseFloat(revenueGrowth) },
      orders:        { value: curr.totalOrders,               growth: parseFloat(ordersGrowth), pending: pendingOrders },
      avgOrderValue: { value: Math.round(curr.avgOrderValue || 0) },
      products:      { value: totalProducts }
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// ─── GET /api/analytics/revenue-chart ────────────────────────────────────────
router.get('/revenue-chart', authMiddleware, async (req, res) => {
  try {
    const merchantObjId = new mongoose.Types.ObjectId(req.user.id);
    const { period = '30d' } = req.query;
    const { start, end } = getDateRange(period);

    let groupFormat;
    if (period === '7d' || period === '30d') {
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === '90d') {
      groupFormat = {
        $concat: [
          { $toString: { $year: '$createdAt' } },
          '-W',
          { $toString: { $week: '$createdAt' } }
        ]
      };
    } else {
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const data = await Order.aggregate([
      {
        $match: {
          merchant: merchantObjId,
          createdAt: { $gte: start, $lte: end },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$finalPrice' },
          orders:  { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data.map(d => ({ label: d._id, revenue: d.revenue, orders: d.orders })));
  } catch (err) {
    console.error('Revenue chart error:', err);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// ─── GET /api/analytics/top-products ─────────────────────────────────────────
router.get('/top-products', authMiddleware, async (req, res) => {
  try {
    const merchantObjId = new mongoose.Types.ObjectId(req.user.id);
    const { period = '30d' } = req.query;
    const { start, end } = getDateRange(period);

    const data = await Order.aggregate([
      {
        $match: {
          merchant: merchantObjId,
          createdAt: { $gte: start, $lte: end },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id:          '$items.product',
          name:         { $first: '$items.nameAr' },
          image:        { $first: '$items.image' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalSold:    { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json(data);
  } catch (err) {
    console.error('Top products error:', err);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// ─── GET /api/analytics/orders-by-status ─────────────────────────────────────
router.get('/orders-by-status', authMiddleware, async (req, res) => {
  try {
    const merchantObjId = new mongoose.Types.ObjectId(req.user.id);
    const { period = '30d' } = req.query;
    const { start, end } = getDateRange(period);

    const data = await Order.aggregate([
      {
        $match: {
          merchant: merchantObjId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id:     '$orderStatus',
          count:   { $sum: 1 },
          revenue: { $sum: '$finalPrice' }
        }
      }
    ]);

    const statusMap = {
      new:        { label: 'جديد',         color: '#F59E0B' },
      confirmed:  { label: 'مؤكد',         color: '#3B82F6' },
      processing: { label: 'جاري التجهيز', color: '#8B5CF6' },
      shipped:    { label: 'تم الشحن',     color: '#06B6D4' },
      delivered:  { label: 'تم التوصيل',   color: '#10B981' },
      cancelled:  { label: 'ملغي',          color: '#EF4444' }
    };

    res.json(data.map(d => ({
      status:  d._id,
      label:   statusMap[d._id]?.label || d._id,
      color:   statusMap[d._id]?.color || '#6B7280',
      count:   d.count,
      revenue: d.revenue
    })));
  } catch (err) {
    console.error('Orders by status error:', err);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// ─── GET /api/analytics/hourly-heatmap ───────────────────────────────────────
router.get('/hourly-heatmap', authMiddleware, async (req, res) => {
  try {
    const merchantObjId = new mongoose.Types.ObjectId(req.user.id);
    const { period = '30d' } = req.query;
    const { start, end } = getDateRange(period);

    const data = await Order.aggregate([
      {
        $match: {
          merchant: merchantObjId,
          createdAt: { $gte: start, $lte: end },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            day:  { $dayOfWeek: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(data.map(d => ({
      hour:  d._id.hour,
      day:   d._id.day - 1,
      count: d.count
    })));
  } catch (err) {
    console.error('Heatmap error:', err);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// ─── GET /api/analytics/recent-orders ────────────────────────────────────────
router.get('/recent-orders', authMiddleware, async (req, res) => {
  try {
    const merchantObjId = new mongoose.Types.ObjectId(req.user.id);

    const orders = await Order.find({ merchant: merchantObjId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id customer finalPrice orderStatus createdAt orderNumber');

    res.json(orders.map(o => ({
      _id:          o._id,
      customerName: o.customer?.name,
      total:        o.finalPrice,
      status:       o.orderStatus,
      createdAt:    o.createdAt,
      orderNumber:  o.orderNumber
    })));
  } catch (err) {
    console.error('Recent orders error:', err);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

module.exports = router;
