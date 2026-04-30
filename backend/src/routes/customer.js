// backend/src/routes/customer.js
const express  = require('express')
const router   = express.Router()
const jwt      = require('jsonwebtoken')
const Customer = require('../models/Customer')
const Order    = require('../models/Order')
const Review   = require('../models/Review')
const User     = require('../models/User')

/* ── Auth middleware ── */
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'غير مصرح' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.customer = await Customer.findById(decoded.id)
    if (!req.customer) return res.status(401).json({ message: 'العميل غير موجود' })
    next()
  } catch { res.status(401).json({ message: 'توكن غير صالح' }) }
}

const makeToken = id => jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' })

/* ══════════════════════════════════════════
   POST /api/customer/login
   العميل يدخل رقم الموبايل — لو موجود يدخل، لو جديد يتسجل
══════════════════════════════════════════ */
router.post('/login', async (req, res) => {
  try {
    const { phone, name } = req.body
    if (!phone) return res.status(400).json({ message: 'رقم الموبايل مطلوب' })

    // normalize phone
    const cleanPhone = phone.replace(/\s/g, '').replace(/^0/, '20').replace(/^\+/, '')

    let customer = await Customer.findOne({ phone: cleanPhone })

    if (!customer) {
      // عميل جديد — محتاج اسم
      if (!name) return res.status(400).json({ message: 'الاسم مطلوب للتسجيل', newUser: true })
      customer = await Customer.create({ name, phone: cleanPhone })
    }

    res.json({
      success: true,
      isNew: false,
      token: makeToken(customer._id),
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        governorate: customer.governorate,
        address: customer.address,
      }
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

/* ══════════════════════════════════════════
   GET /api/customer/me
══════════════════════════════════════════ */
router.get('/me', auth, async (req, res) => {
  res.json({ success: true, customer: req.customer })
})

/* ══════════════════════════════════════════
   PUT /api/customer/me
   تحديث بيانات العميل
══════════════════════════════════════════ */
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, governorate, address } = req.body
    const updated = await Customer.findByIdAndUpdate(
      req.customer._id,
      { $set: { name, email, governorate, address } },
      { new: true }
    )
    res.json({ success: true, customer: updated })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

/* ══════════════════════════════════════════
   GET /api/customer/orders
   كل طلبات العميل
══════════════════════════════════════════ */
router.get('/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const phone = req.customer.phone

    // البحث بالتليفون في بيانات العميل داخل الطلب
    const orders = await Order.find({ 'customer.phone': { $regex: phone.slice(-10) } })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('merchant', 'store.name store.slug store.logo')

    const total = await Order.countDocuments({ 'customer.phone': { $regex: phone.slice(-10) } })

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

/* ══════════════════════════════════════════
   GET /api/customer/orders/:orderNumber
   تتبع طلب برقمه (بدون login)
══════════════════════════════════════════ */
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('merchant', 'store.name store.slug store.logo store.phone')

    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' })

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        finalPrice:  order.finalPrice,
        paymentMethod: order.paymentMethod,
        createdAt:   order.createdAt,
        customer:    { name: order.customer.name },
        items:       order.items.map(i => ({ nameAr: i.nameAr, quantity: i.quantity, price: i.price, image: i.image })),
        store: {
          name: order.merchant?.store?.name,
          slug: order.merchant?.store?.slug,
          logo: order.merchant?.store?.logo,
          phone: order.merchant?.store?.phone,
        }
      }
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

/* ══════════════════════════════════════════
   POST /api/customer/reviews
   إضافة تقييم
══════════════════════════════════════════ */
router.post('/reviews', auth, async (req, res) => {
  try {
    const { merchantId, orderId, rating, comment } = req.body
    if (!merchantId || !rating) return res.status(400).json({ message: 'التقييم والمتجر مطلوبين' })

    // تأكد إن العميل عنده طلب من المتجر ده
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        merchant: merchantId,
        'customer.phone': { $regex: req.customer.phone.slice(-10) }
      })
      if (!order) return res.status(403).json({ message: 'مش قادر تقيّم متجر من غير ما تشتري منه' })
    }

    const review = await Review.create({
      merchant: merchantId,
      customer: req.customer._id,
      order: orderId || undefined,
      rating,
      comment,
    })

    res.status(201).json({ success: true, review })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'قيّمت الطلب ده قبل كده' })
    res.status(500).json({ message: err.message })
  }
})

/* ══════════════════════════════════════════
   GET /api/customer/reviews/:merchantId
   تقييمات متجر معين (public)
══════════════════════════════════════════ */
router.get('/reviews/:merchantId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const reviews = await Review.find({ merchant: req.params.merchantId, isVisible: true })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('customer', 'name')

    const total   = await Review.countDocuments({ merchant: req.params.merchantId, isVisible: true })
    const avgData = await Review.aggregate([
      { $match: { merchant: require('mongoose').Types.ObjectId.createFromHexString(req.params.merchantId), isVisible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])

    res.json({
      success: true,
      reviews,
      total,
      pages: Math.ceil(total / limit),
      avg: avgData[0]?.avg?.toFixed(1) || 0,
      count: avgData[0]?.count || 0,
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
