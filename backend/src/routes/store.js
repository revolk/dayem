// backend/src/routes/store.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { sendTelegram, buildNewOrderMessage } = require('../services/telegram');

// ── Discovery — البحث عن متاجر ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, governorate, page = 1, limit = 12 } = req.query
    const query = { role: 'merchant', isActive: true, 'store.isActive': true }

    if (search)      query['$or'] = [
      { 'store.name':        { $regex: search, $options: 'i' } },
      { 'store.description': { $regex: search, $options: 'i' } },
    ]
    if (category)    query['store.category']    = category
    if (governorate) query['store.governorate'] = governorate

    const total = await User.countDocuments(query)
    const merchants = await User.find(query)
      .select('store.name store.slug store.description store.logo store.category store.governorate store.plan createdAt')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))

    // جيب متوسط التقييم لكل متجر
    const Review = require('../models/Review')
    const merchantsWithRating = await Promise.all(merchants.map(async m => {
      const avg = await Review.aggregate([
        { $match: { merchant: m._id, isVisible: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
      return {
        _id: m._id,
        name: m.store.name,
        slug: m.store.slug,
        description: m.store.description,
        logo: m.store.logo,
        category: m.store.category,
        governorate: m.store.governorate,
        plan: m.store.plan,
        rating: avg[0]?.avg?.toFixed(1) || 0,
        reviewCount: avg[0]?.count || 0,
        joinedAt: m.createdAt,
      }
    }))

    res.json({ success: true, stores: merchantsWithRating, total, pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Get store info
router.get('/:slug', async (req, res) => {
  try {
    const merchant = await User.findOne({ 'store.slug': req.params.slug, role: 'merchant', isActive: true });
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' });
    res.json({
      success: true,
      store: {
        name: merchant.store.name,
        slug: merchant.store.slug,
        description: merchant.store.description,
        logo: merchant.store.logo,
        phone: merchant.store.phone,
        // بيانات الدفع للعميل
        vodafoneCash: merchant.store.vodafoneCash || '',
        instapay:     merchant.store.instapay     || '',
        fawryCode:    merchant.store.fawryCode    || '',
        merchantId:   merchant._id,
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get store products
router.get('/:slug/products', async (req, res) => {
  try {
    const merchant = await User.findOne({ 'store.slug': req.params.slug, role: 'merchant' });
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' });
    const products = await Product.find({ merchant: merchant._id, isActive: true });
    res.json({ success: true, products });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Place order (with coupon support)
router.post('/:slug/orders', async (req, res) => {
  try {
    const merchant = await User.findOne({ 'store.slug': req.params.slug, role: 'merchant' });
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' });

    const { customer, items, paymentMethod, notes, couponCode } = req.body;
    const totalPrice    = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const shippingPrice = totalPrice >= 500 ? 0 : 60;

    // تطبيق الكوبون
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ merchant: merchant._id, code: couponCode.toUpperCase() });
      if (coupon) {
        const check = coupon.isValid(totalPrice);
        if (check.valid) {
          discount = coupon.calcDiscount(totalPrice);
          appliedCoupon = coupon;
        }
      }
    }

    const finalPrice = Math.max(0, totalPrice - discount + shippingPrice);

    const order = await Order.create({
      merchant: merchant._id,
      customer, items, totalPrice, shippingPrice, finalPrice,
      discount, couponCode: couponCode?.toUpperCase() || '',
      paymentMethod: paymentMethod || 'cash', notes
    });

    // زيادة عداد استخدام الكوبون
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
    }

    // Telegram notification
    if (merchant.telegramChatId) {
      const msg = buildNewOrderMessage(order, merchant.store.name);
      sendTelegram(merchant.telegramChatId, msg);
    }

    res.status(201).json({
      success: true,
      order: { orderNumber: order.orderNumber, finalPrice: order.finalPrice, orderStatus: order.orderStatus }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
