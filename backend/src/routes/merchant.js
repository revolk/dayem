const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const User     = require('../models/User');
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const { sendEmail } = require('../services/email');

// ── Auth middleware ───────────────────────────────────────
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'غير مصرح' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'توكن غير صالح' });
  }
};

// ── POST /register ────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, storeName } = req.body;

    if (!name || !email || !password || !storeName)
      return res.status(400).json({ message: 'كل الحقول مطلوبة' });

    if (password.length < 6)
      return res.status(400).json({ message: 'كلمة المرور 6 أحرف على الأقل' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'البريد مسجل من قبل' });

    // Generate slug
    let slug = storeName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
      .substring(0, 30);
    if (!slug) slug = `store-${Date.now()}`;

    // Ensure slug is unique
    let finalSlug = slug;
    let counter = 1;
    while (await User.findOne({ 'store.slug': finalSlug })) {
      finalSlug = `${slug}-${counter++}`;
    }

    // Email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      verifyToken,
      verifyTokenExpiry,
      store: {
        name: storeName,
        slug: finalSlug,
        isActive: true,
        plan: 'starter',
        maxProducts: 5,
      }
    });

    // Send verification email
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    await sendEmail({
      to: email,
      template: 'verify',
      data: { name, link: verifyLink }
    });

    // Send welcome email
    const storeUrl = `${process.env.CLIENT_URL}/store/${finalSlug}`;
    await sendEmail({
      to: email,
      template: 'welcomeMerchant',
      data: { name, storeName, storeUrl }
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      token,
      merchant: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        store: user.store,
      },
      message: 'تم التسجيل! راجع إيميلك لتفعيل الحساب'
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'البريد أو رابط المتجر مسجل مسبقاً' });
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'خطأ في التسجيل' });
  }
});

// ── POST /login ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبين' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'بيانات غير صحيحة' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'بيانات غير صحيحة' });

    if (!user.isActive) return res.status(403).json({ message: 'الحساب موقوف' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      merchant: {
        _id:        user._id,
        name:       user.name,
        email:      user.email,
        isVerified: user.isVerified,
        store:      user.store,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول' });
  }
});

// ── POST /forgot-password ─────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'لو البريد موجود هيوصلك إيميل' });

    const resetToken  = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry: resetExpiry
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      template: 'resetPassword',
      data: { name: user.name, link: resetLink }
    });

    res.json({ success: true, message: 'لو البريد موجود هيوصلك إيميل' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الإرسال' });
  }
});

// ── POST /reset-password ──────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'بيانات ناقصة' });
    if (password.length < 6) return res.status(400).json({ message: 'كلمة المرور 6 أحرف على الأقل' });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    }).select('+resetToken +resetTokenExpiry');

    if (!user) return res.status(400).json({ message: 'الرابط منتهي الصلاحية' });

    user.password         = password;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في تغيير كلمة المرور' });
  }
});

// ── GET /verify-email ─────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() }
    }).select('+verifyToken +verifyTokenExpiry');

    if (!user) return res.status(400).json({ message: 'رابط التفعيل منتهي أو غير صحيح' });

    user.isVerified        = true;
    user.verifyToken       = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'تم تفعيل حسابك بنجاح!' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في التفعيل' });
  }
});

// ── GET /me ───────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ success: true, merchant: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /store ─────────────────────────────────────────────
router.put('/store', auth, async (req, res) => {
  try {
    const allowed = ['name','description','phone','address','governorate','category','logo','vodafoneCash','instapay','fawryCode','theme'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[`store.${k}`] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, store: user.store });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /stats ────────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const [orderStats, products] = await Promise.all([
      Order.aggregate([
        { $match: { merchant: new (require('mongoose').Types.ObjectId)(req.user.id) } },
        { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $ne: ['$orderStatus', 'cancelled'] }, '$finalPrice', 0] } },
          newOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'new'] }, 1, 0] } },
        }}
      ]),
      Product.countDocuments({ merchant: req.user.id, isActive: true }),
    ]);

    const s = orderStats[0] || { totalOrders: 0, totalRevenue: 0, newOrders: 0 };

    res.json({
      success: true,
      stats: {
        totalOrders:    s.totalOrders,
        newOrders:      s.newOrders,
        totalRevenue:   s.totalRevenue,
        totalProducts:  products,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /products ─────────────────────────────────────────
router.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find({ merchant: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /products ────────────────────────────────────────
router.post('/products', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const maxProducts = user.store?.maxProducts || 5;

    if (maxProducts !== -1) {
      const count = await Product.countDocuments({ merchant: req.user.id, isActive: true });
      if (count >= maxProducts)
        return res.status(403).json({ message: `وصلت للحد الأقصى (${maxProducts} منتج). رقّي خطتك للإضافة أكتر` });
    }

    const product = await Product.create({ ...req.body, merchant: req.user.id });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /products/:id ─────────────────────────────────────
router.put('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, merchant: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /products/:id ──────────────────────────────────
router.delete('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, merchant: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /orders ───────────────────────────────────────────
router.get('/orders', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = { merchant: req.user.id };
    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /orders/:id ───────────────────────────────────────
router.put('/orders/:id', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, merchant: req.user.id },
      { orderStatus },
      { new: true }
    ).lean();

    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    // Send email notification to customer if email exists
    if (order.customer?.email) {
      const user = await User.findById(req.user.id).lean();
      await sendEmail({
        to: order.customer.email,
        template: 'orderStatus',
        data: { order, storeName: user.store?.name, newStatus: orderStatus }
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET/PUT /telegram ─────────────────────────────────────
router.get('/telegram', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    res.json({ success: true, connected: !!user.telegramChatId, chatId: user.telegramChatId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/telegram', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { telegramChatId: req.body.chatId || '' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
