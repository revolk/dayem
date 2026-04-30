const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendTelegram } = require('../services/telegram');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.merchant = await User.findById(decoded.id);
    if (!req.merchant || req.merchant.role !== 'merchant') {
      return res.status(401).json({ message: 'غير مصرح' });
    }
    next();
  } catch {
    res.status(401).json({ message: 'توكن غير صالح' });
  }
};

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const makeSlug = (str) => {
  return str.trim().replace(/\s+/g, '-').replace(/[^\u0621-\u064Aa-zA-Z0-9-]/g, '').toLowerCase() || 'store-' + Date.now();
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, storeName, category, governorate } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'البريد مسجل بالفعل' });
    }
    let slug = makeSlug(storeName);
    let counter = 1;
    while (await User.findOne({ 'store.slug': slug })) {
      slug = `${makeSlug(storeName)}-${counter++}`;
    }
    const merchant = await User.create({
      name, email, phone, password,
      role: 'merchant',
      store: {
        name: storeName,
        slug,
        isActive: true,
        plan: 'starter',
        category: category || '',
        governorate: governorate || '',
      }
    });
    res.status(201).json({
      success: true,
      token: makeToken(merchant._id),
      merchant: { id: merchant._id, name: merchant.name, email: merchant.email, store: merchant.store }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const merchant = await User.findOne({ email, role: 'merchant' }).select('+password');
    if (!merchant || !(await merchant.matchPassword(password))) {
      return res.status(401).json({ message: 'بيانات غير صحيحة' });
    }
    res.json({
      success: true,
      token: makeToken(merchant._id),
      merchant: { id: merchant._id, name: merchant.name, email: merchant.email, store: merchant.store }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ success: true, merchant: req.merchant });
});

router.get('/stats', protect, async (req, res) => {
  try {
    const [products, orders] = await Promise.all([
      Product.countDocuments({ merchant: req.merchant._id }),
      Order.find({ merchant: req.merchant._id })
    ]);
    const revenue = orders.filter(o => o.orderStatus !== 'cancelled').reduce((s, o) => s + o.finalPrice, 0);
    const newOrders = orders.filter(o => o.orderStatus === 'new').length;
    res.json({ success: true, stats: { products, orders: orders.length, revenue, newOrders } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/products', protect, async (req, res) => {
  try {
    const products = await Product.find({ merchant: req.merchant._id }).sort('-createdAt');
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/products', protect, async (req, res) => {
  try {
    const { nameAr, name, description, price, stock, category, images } = req.body;
    const product = await Product.create({
      nameAr: nameAr || name,
      name: name || nameAr,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      images: images || [],
      merchant: req.merchant._id
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/products/:id', protect, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, merchant: req.merchant._id },
      req.body, { new: true }
    );
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', protect, async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, merchant: req.merchant._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ merchant: req.merchant._id }).sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, merchant: req.merchant._id },
      { orderStatus: req.body.orderStatus }, { new: true }
    );
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/store', protect, async (req, res) => {
  try {
    const merchant = await User.findByIdAndUpdate(
      req.merchant._id,
      { $set: { store: { ...req.merchant.store.toObject(), ...req.body } } },
      { new: true }
    );
    res.json({ success: true, store: merchant.store });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Telegram: ربط الحساب ──────────────────────────────────────────────────
router.put('/telegram', protect, async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ message: 'Chat ID مطلوب' });

    await User.findByIdAndUpdate(req.merchant._id, { telegramChatId: chatId.toString() });

    // رسالة تأكيد فورية
    await sendTelegram(chatId.toString(),
      `✅ <b>تم الربط بنجاح!</b>\n\nمتجر <b>${req.merchant.store.name}</b> هيوصلك إشعار على تليجرام مع كل طلب جديد 🎉\n\n<i>DAYEM ∞ — دايم معاك</i>`
    );

    res.json({ success: true, message: 'تم ربط تليجرام بنجاح ✅' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Telegram: جلب الحالة ──────────────────────────────────────────────────
router.get('/telegram', protect, async (req, res) => {
  res.json({
    success: true,
    connected: !!req.merchant.telegramChatId,
    chatId: req.merchant.telegramChatId || ''
  });
});

module.exports = router;
