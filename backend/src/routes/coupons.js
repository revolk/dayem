// backend/src/routes/coupons.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Coupon = require('../models/Coupon');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    req.merchant = await User.findById(decoded.id);
    if (!req.merchant || req.merchant.role !== 'merchant') return res.status(401).json({ message: 'غير مصرح' });
    next();
  } catch { res.status(401).json({ message: 'توكن غير صالح' }); }
};

// ── GET /api/coupons — كل كوبونات التاجر ─────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const coupons = await Coupon.find({ merchant: req.merchant._id }).sort('-createdAt');
    res.json({ success: true, coupons });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/coupons — إنشاء كوبون ──────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = req.body;
    if (!code || !value) return res.status(400).json({ message: 'الكود والقيمة مطلوبان' });

    const existing = await Coupon.findOne({ merchant: req.merchant._id, code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'الكود موجود بالفعل' });

    const coupon = await Coupon.create({
      merchant: req.merchant._id,
      code: code.toUpperCase(),
      type: type || 'percent',
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      maxUses: Number(maxUses) || 0,
      expiresAt: expiresAt || null,
    });
    res.status(201).json({ success: true, coupon });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/coupons/:id — تعديل ──────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, merchant: req.merchant._id },
      req.body, { new: true }
    );
    if (!coupon) return res.status(404).json({ message: 'الكوبون غير موجود' });
    res.json({ success: true, coupon });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/coupons/:id — حذف ────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Coupon.findOneAndDelete({ _id: req.params.id, merchant: req.merchant._id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/coupons/validate — التحقق من كوبون (للعميل) ────────────────
router.post('/validate', async (req, res) => {
  try {
    const { code, merchantId, orderTotal } = req.body;
    if (!code || !merchantId) return res.status(400).json({ message: 'بيانات ناقصة' });

    const mongoose = require('mongoose');
    const coupon = await Coupon.findOne({
      merchant: new mongoose.Types.ObjectId(merchantId),
      code: code.toUpperCase()
    });

    if (!coupon) return res.status(404).json({ success: false, message: 'كوبون غير صحيح' });

    const check = coupon.isValid(orderTotal);
    if (!check.valid) return res.status(400).json({ success: false, message: check.msg });

    const discount = coupon.calcDiscount(orderTotal);
    res.json({
      success: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
