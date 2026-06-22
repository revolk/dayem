const express = require('express')
const router  = express.Router()
const jwt     = require('jsonwebtoken')
const Review  = require('../models/Review')
const Order   = require('../models/Order')
const User    = require('../models/User')

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'غير مصرح' })
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch { res.status(401).json({ message: 'توكن غير صالح' }) }
}

// ── GET /reviews/:slug — public store reviews ─────────────
router.get('/:slug', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query

    const merchant = await User.findOne({ 'store.slug': req.params.slug }).select('_id store.name').lean()
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' })

    const sortMap = {
      recent:  { createdAt: -1 },
      highest: { rating: -1 },
      lowest:  { rating: 1 },
    }

    const [reviews, total, stats] = await Promise.all([
      Review.find({ merchant: merchant._id, isVisible: true })
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip((page-1) * limit)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ merchant: merchant._id, isVisible: true }),
      Review.aggregate([
        { $match: { merchant: merchant._id, isVisible: true } },
        { $group: {
          _id: null,
          avgRating:  { $avg: '$rating' },
          total:      { $sum: 1 },
          stars5:     { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          stars4:     { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          stars3:     { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          stars2:     { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          stars1:     { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        }}
      ])
    ])

    res.json({
      success: true,
      reviews,
      total,
      pages: Math.ceil(total / limit),
      stats: stats[0] || { avgRating: 0, total: 0 }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /reviews/:slug — add review ──────────────────────
router.post('/:slug', async (req, res) => {
  try {
    const { rating, comment, customerName, customerPhone, orderNumber } = req.body

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'التقييم من 1 إلى 5' })
    if (!customerName)
      return res.status(400).json({ message: 'الاسم مطلوب' })

    const merchant = await User.findOne({ 'store.slug': req.params.slug }).select('_id').lean()
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' })

    // Verify order if provided
    let order = null
    let isVerified = false
    if (orderNumber) {
      order = await Order.findOne({
        orderNumber: orderNumber.toUpperCase(),
        merchant: merchant._id,
        orderStatus: 'delivered'
      }).lean()
      if (order) isVerified = true
    }

    // Check duplicate
    if (order) {
      const existing = await Review.findOne({ order: order._id })
      if (existing) return res.status(400).json({ message: 'قيّمت هذا الطلب من قبل' })
    }

    const review = await Review.create({
      merchant:      merchant._id,
      order:         order?._id,
      customerName,
      customerPhone,
      rating:        Number(rating),
      comment,
      isVerified,
    })

    // Update merchant store rating
    const stats = await Review.aggregate([
      { $match: { merchant: merchant._id, isVisible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    if (stats.length) {
      await User.findByIdAndUpdate(merchant._id, {
        'store.rating':      Math.round(stats[0].avg * 10) / 10,
        'store.reviewCount': stats[0].count
      })
    }

    res.status(201).json({ success: true, review })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PUT /reviews/:id/reply — merchant reply ───────────────
router.put('/:id/reply', auth, async (req, res) => {
  try {
    const { reply } = req.body
    if (!reply?.trim()) return res.status(400).json({ message: 'الرد مطلوب' })

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, merchant: req.user.id },
      { reply: reply.trim(), repliedAt: new Date() },
      { new: true }
    )
    if (!review) return res.status(404).json({ message: 'التقييم غير موجود' })
    res.json({ success: true, review })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /reviews/merchant/all — merchant view ─────────────
router.get('/merchant/all', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const reviews = await Review.find({ merchant: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page-1) * limit)
      .limit(Number(limit))
      .lean()
    const total = await Review.countDocuments({ merchant: req.user.id })
    res.json({ success: true, reviews, total, pages: Math.ceil(total/limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
