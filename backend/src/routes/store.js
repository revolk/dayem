const express = require('express')
const router  = express.Router()
const User    = require('../models/User')
const Product = require('../models/Product')
const Order   = require('../models/Order')
const Coupon  = require('../models/Coupon')
const { sendEmail }    = require('../services/email')
const { sendTelegram } = require('../services/telegram')

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ── GET /store/:slug ──────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const store = await User.findOne({
      'store.slug': req.params.slug,
      'store.isActive': true,
      isActive: true
    }).select('store name').lean()

    if (!store) return res.status(404).json({ message: 'المتجر غير موجود' })

    res.json({ success: true, store: { ...store.store, merchantId: store._id } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /store/:slug/featured-coupon ──────────────────────
// كوبون واحد نشط يُعرض في بانر المتجر (لا يكشف كل الكوبونات)
router.get('/:slug/featured-coupon', async (req, res) => {
  try {
    const merchant = await User.findOne({
      'store.slug': req.params.slug,
      'store.isActive': true,
      isActive: true
    }).select('_id').lean()
    if (!merchant) return res.json({ success: true, coupon: null })

    const coupon = await Coupon.findOne({
      merchant:   merchant._id,
      isActive:   true,
      validUntil: { $gte: new Date() },
    }).sort('-createdAt').select('code type value maxDiscount').lean()

    res.json({ success: true, coupon: coupon || null })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /store/:slug/products ─────────────────────────────
router.get('/:slug/products', async (req, res) => {
  try {
    const { category, search, sort = 'createdAt', page = 1, limit = 24 } = req.query

    const merchant = await User.findOne({ 'store.slug': req.params.slug }).select('_id').lean()
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' })

    const query = { merchant: merchant._id, isActive: true }
    if (category) query.category = category
    if (search)   query.$or = [
      { nameAr: { $regex: escapeRegex(search), $options: 'i' } },
      { description: { $regex: escapeRegex(search), $options: 'i' } }
    ]

    const sortMap = {
      createdAt:    { createdAt: -1 },
      price_asc:    { price: 1 },
      price_desc:   { price: -1 },
      popular:      { totalSold: -1 },
      rating:       { rating: -1 },
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip((page-1) * limit)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query)
    ])

    res.json({ success: true, products, total, pages: Math.ceil(total/limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /store/:slug/orders ──────────────────────────────
router.post('/:slug/orders', async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes, couponCode, paymentRef } = req.body

    // Validate required
    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.governorate)
      return res.status(400).json({ message: 'بيانات العميل ناقصة' })
    if (!items?.length)
      return res.status(400).json({ message: 'الطلب فاضي' })

    // Get merchant
    const merchant = await User.findOne({
      'store.slug': req.params.slug,
      'store.isActive': true,
      isActive: true
    }).lean()
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' })

    // Validate & price products from DB (prevent price manipulation)
    const productIds  = items.map(i => i.product).filter(Boolean)
    const dbProducts  = await Product.find({
      _id: { $in: productIds },
      merchant: merchant._id,
      isActive: true
    }).lean()

    const productMap = {}
    dbProducts.forEach(p => { productMap[p._id.toString()] = p })

    let totalPrice = 0
    const validatedItems = items.map(item => {
      const dbProd = productMap[item.product?.toString()]
      const price  = dbProd ? dbProd.price : item.price
      const qty    = Math.max(1, item.quantity || 1)
      totalPrice  += price * qty
      return {
        product:  item.product,
        nameAr:   dbProd?.nameAr || item.nameAr,
        price,
        quantity: qty,
        image:    dbProd?.images?.[0]?.url || item.image,
      }
    })

    // Coupon
    let discount = 0
    let couponDoc = null
    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code:       couponCode.toUpperCase(),
        merchant:   merchant._id,
        isActive:   true,
        validUntil: { $gte: new Date() },
      })
      if (couponDoc) {
        if (couponDoc.type === 'percent') {
          discount = Math.round(totalPrice * couponDoc.value / 100)
          if (couponDoc.maxDiscount) discount = Math.min(discount, couponDoc.maxDiscount)
        } else {
          discount = couponDoc.value
        }
        discount = Math.min(discount, totalPrice)
      }
    }

    // Shipping
    const shippingPrice = totalPrice >= 500 ? 0 : 60
    const finalPrice    = Math.max(0, totalPrice - discount + shippingPrice)

    // Create order
    const order = await Order.create({
      merchant:     merchant._id,
      customer,
      items:        validatedItems,
      totalPrice,
      shippingPrice,
      discount,
      finalPrice,
      paymentMethod: paymentMethod || 'cash',
      paymentRef,
      couponCode:   couponDoc ? couponCode.toUpperCase() : undefined,
      notes,
    })

    // Update coupon usage
    if (couponDoc) {
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } })
    }

    // Update product stats
    await Promise.all(validatedItems.map(item =>
      Product.findByIdAndUpdate(item.product, {
        $inc: {
          totalSold:    item.quantity,
          totalRevenue: item.price * item.quantity,
          stock:        -item.quantity,
        }
      })
    ))

    // ── Notifications ─────────────────────────────────────

    // 1. Telegram to merchant
    if (merchant.telegramChatId) {
      const itemsList = validatedItems.map(i => `• ${i.nameAr} × ${i.quantity}`).join('\n')
      await sendTelegram(merchant.telegramChatId, `
🛍️ *طلب جديد!*
━━━━━━━━━━━━━━━
📋 رقم الطلب: \`${order.orderNumber}\`
👤 العميل: ${customer.name}
📱 الموبايل: ${customer.phone}
📍 المحافظة: ${customer.governorate}
📦 المنتجات:
${itemsList}
━━━━━━━━━━━━━━━
💰 الإجمالي: *${finalPrice} ج*
💳 الدفع: ${paymentMethod === 'cash' ? 'كاش' : paymentMethod}
      `.trim())
    }

    // 2. Email to merchant
    await sendEmail({
      to:       merchant.email,
      template: 'newOrder',
      data:     { merchantName: merchant.name, order, storeName: merchant.store.name }
    })

    // 3. Email to customer (if email provided)
    if (customer.email) {
      await sendEmail({
        to:       customer.email,
        template: 'orderConfirmed',
        data:     { order, storeName: merchant.store.name }
      })
    }

    res.status(201).json({ success: true, order })
  } catch (err) {
    console.error('Order error:', err.message)
    res.status(500).json({ message: 'خطأ في إنشاء الطلب' })
  }
})

// ── GET /store (discover) ─────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, governorate, page = 1, limit = 12 } = req.query

    const query = { 'store.isActive': true, isActive: true, 'store.slug': { $exists: true } }

    if (category)   query['store.category']    = category
    if (governorate && governorate !== 'الكل') query['store.governorate'] = governorate
    if (search) {
      const safe = escapeRegex(search)
      query.$or = [
        { 'store.name':        { $regex: safe, $options: 'i' } },
        { 'store.description': { $regex: safe, $options: 'i' } },
        { 'store.category':    { $regex: safe, $options: 'i' } },
      ]
    }

    const [stores, total] = await Promise.all([
      User.find(query)
        .select('store.name store.slug store.logo store.description store.category store.governorate store.plan store.rating store.reviewCount')
        .sort({ 'store.plan': -1, createdAt: -1 })
        .skip((page-1) * limit)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query)
    ])

    const formatted = stores.map(s => ({
      _id:         s._id,
      name:        s.store.name,
      slug:        s.store.slug,
      logo:        s.store.logo,
      description: s.store.description,
      category:    s.store.category,
      governorate: s.store.governorate,
      plan:        s.store.plan,
      rating:      s.store.rating || 0,
      reviewCount: s.store.reviewCount || 0,
    }))

    res.json({ success: true, stores: formatted, total, pages: Math.ceil(total/limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
