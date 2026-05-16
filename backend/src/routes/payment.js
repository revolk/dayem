const express = require('express')
const router  = express.Router()
const crypto  = require('crypto')
const axios   = require('axios')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')

// ── Auth middleware ───────────────────────────────────────
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'غير مصرح' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.id }
    next()
  } catch {
    res.status(401).json({ message: 'توكن غير صالح' })
  }
}

// ── Plans ─────────────────────────────────────────────────
const PLANS = {
  starter: {
    name: 'ستارتر', nameEn: 'Starter',
    price: 100, priceInCents: 10000,
    maxProducts: 5,
    features: ['5 منتجات', 'متجر كامل', 'رابط مخصص', 'كل طرق الدفع', 'دعم فني']
  },
  merchant: {
    name: 'تاجر', nameEn: 'Merchant',
    price: 199, priceInCents: 19900,
    maxProducts: 20,
    features: ['20 منتج', 'تقارير مبيعات', 'كوبونات وخصومات', 'AI كتالوج', 'إشعارات فورية', 'دعم أولوية']
  },
  pro: {
    name: 'برو', nameEn: 'Pro',
    price: 349, priceInCents: 34900,
    maxProducts: -1,
    features: ['منتجات غير محدودة', 'متاجر متعددة', 'تحليلات متقدمة', 'API Integration', 'مدير حساب مخصص']
  }
}

// ── Paymob helpers ────────────────────────────────────────
const getAuthToken = async () => {
  const res = await axios.post('https://accept.paymob.com/api/auth/tokens', {
    api_key: process.env.PAYMOB_API_KEY
  }, { timeout: 10000 })
  return res.data.token
}

const createPaymobOrder = async (authToken, amount, merchantId, planId) => {
  const res = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: amount,
    currency: 'EGP',
    merchant_order_id: `dayem_${merchantId}_${planId}_${Date.now()}`,
    items: [{ name: `دايم - خطة ${PLANS[planId]?.name}`, amount_cents: amount, description: `اشتراك شهري`, quantity: 1 }]
  }, { timeout: 10000 })
  return res.data.id
}

const getPaymentKey = async (authToken, orderId, amount, merchant) => {
  const res = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
    auth_token: authToken,
    amount_cents: amount,
    expiration: 3600,
    order_id: orderId,
    billing_data: {
      apartment: 'NA', email: merchant.email || 'test@example.com',
      floor: 'NA', first_name: merchant.name?.split(' ')[0] || 'Customer',
      last_name: merchant.name?.split(' ')[1] || 'Dayem',
      street: 'NA', building: 'NA',
      phone_number: merchant.phone || '+20100000000',
      shipping_method: 'NA', postal_code: 'NA',
      city: 'Cairo', country: 'EG', state: 'Cairo'
    },
    currency: 'EGP',
    integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID),
    lock_order_when_paid: false
  }, { timeout: 10000 })
  return res.data.token
}

// ── HMAC verification ─────────────────────────────────────
const verifyPaymobHMAC = (body, hmacHeader) => {
  const secret = process.env.PAYMOB_HMAC_SECRET
  // If secret not configured, skip in development only
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ PAYMOB_HMAC_SECRET not set in production!')
      return false
    }
    console.warn('⚠️ HMAC verification skipped (dev mode)')
    return true
  }

  try {
    // Paymob HMAC: concatenate specific fields in order
    const obj = typeof body === 'string' ? JSON.parse(body) : body
    const t = obj.obj || {}
    const hmacFields = [
      t.amount_cents, t.created_at, t.currency, t.error_occured,
      t.has_parent_transaction, obj.id, t.integration_id, t.is_3d_secure,
      t.is_auth, t.is_capture, t.is_refunded, t.is_standalone_payment,
      t.is_voided, t.order?.id, t.owner, t.pending,
      t.source_data?.pan, t.source_data?.sub_type, t.source_data?.type,
      t.success
    ]
    const hmacString = hmacFields.map(v => v === null || v === undefined ? '' : String(v)).join('')
    const computed   = crypto.createHmac('sha512', secret).update(hmacString).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmacHeader || ''))
  } catch (e) {
    console.error('HMAC error:', e.message)
    return false
  }
}

// ── Routes ────────────────────────────────────────────────

// GET /plans
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS })
})

// POST /initiate
router.post('/initiate', auth, async (req, res) => {
  try {
    const { planId } = req.body
    const plan = PLANS[planId]
    if (!plan) return res.status(400).json({ message: 'خطة غير صحيحة' })

    const merchant = await User.findById(req.user.id).select('email name phone')
    if (!merchant) return res.status(404).json({ message: 'التاجر غير موجود' })

    const authToken  = await getAuthToken()
    const orderId    = await createPaymobOrder(authToken, plan.priceInCents, merchant._id, planId)
    const paymentKey = await getPaymentKey(authToken, orderId, plan.priceInCents, merchant)

    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`

    await User.findByIdAndUpdate(req.user.id, {
      'store.pendingPlan':    planId,
      'store.pendingOrderId': orderId.toString()
    })

    res.json({ success: true, paymentUrl, paymentKey, plan: { id: planId, ...plan } })
  } catch (err) {
    console.error('Paymob initiate error:', err.response?.data || err.message)
    res.status(500).json({ message: 'خطأ في بوابة الدفع' })
  }
})

// POST /webhook  ← Paymob callback
router.post('/webhook', async (req, res) => {
  try {
    // HMAC verification — prevents fake webhooks
    const hmacHeader = req.query.hmac || req.headers['x-paymob-hmac']
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body)

    if (!verifyPaymobHMAC(rawBody, hmacHeader)) {
      console.warn('❌ Invalid HMAC — webhook rejected')
      return res.status(401).json({ message: 'Invalid signature' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { obj } = body

    // Only process successful payments
    if (obj?.success !== true) {
      return res.json({ success: true, message: 'Payment not successful — ignored' })
    }

    // Prevent duplicate processing
    const txnId = obj.id?.toString()
    if (!txnId) return res.json({ success: true })

    const alreadyProcessed = await User.findOne({ 'store.lastPaymobTxn': txnId })
    if (alreadyProcessed) {
      console.log(`⚠️ Duplicate webhook for txn ${txnId} — ignored`)
      return res.json({ success: true })
    }

    // Parse merchant_order_id: dayem_MERCHANTID_PLANID_TIMESTAMP
    const merchantOrderId = obj.order?.merchant_order_id || ''
    const parts = merchantOrderId.split('_')

    if (parts.length < 3 || parts[0] !== 'dayem') {
      console.warn('⚠️ Unknown merchant_order_id format:', merchantOrderId)
      return res.json({ success: true })
    }

    const merchantId = parts[1]
    const planId     = parts[2]
    const plan       = PLANS[planId]

    if (!plan) {
      console.warn('⚠️ Unknown planId:', planId)
      return res.json({ success: true })
    }

    // Activate subscription
    await User.findByIdAndUpdate(merchantId, {
      'store.plan':           planId,
      'store.planActivatedAt': new Date(),
      'store.planExpiresAt':  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      'store.maxProducts':    plan.maxProducts,
      'store.isActive':       true,
      'store.pendingPlan':    null,
      'store.lastPaymobTxn':  txnId,
      isActive: true
    })

    console.log(`✅ Plan activated: ${planId} for merchant ${merchantId} (txn: ${txnId})`)
    res.json({ success: true })

  } catch (err) {
    console.error('Webhook error:', err.message)
    // Always return 200 to prevent Paymob retries on our errors
    res.status(200).json({ success: true })
  }
})

// GET /status
router.get('/status', auth, async (req, res) => {
  try {
    const merchant  = await User.findById(req.user.id).select('store isActive')
    const planId    = merchant.store?.plan || 'starter'
    const plan      = PLANS[planId]
    const expiresAt = merchant.store?.planExpiresAt
    const isExpired = expiresAt ? new Date() > new Date(expiresAt) : false

    res.json({
      success: true,
      plan: { id: planId, ...plan },
      activatedAt: merchant.store?.planActivatedAt,
      expiresAt,
      isExpired,
      maxProducts: merchant.store?.maxProducts || 5,
      isActive: merchant.store?.isActive && !isExpired,
      daysLeft: expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000)) : null
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /activate-test  ← dev only
router.post('/activate-test', auth, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'غير مسموح في الـ production' })
  }
  try {
    const { planId } = req.body
    const plan = PLANS[planId]
    if (!plan) return res.status(400).json({ message: 'خطة غير صحيحة' })

    await User.findByIdAndUpdate(req.user.id, {
      'store.plan': planId,
      'store.planActivatedAt': new Date(),
      'store.planExpiresAt': new Date(Date.now() + 30*24*60*60*1000),
      'store.maxProducts': plan.maxProducts,
      'store.isActive': true,
      isActive: true
    })
    res.json({ success: true, message: `تم تفعيل خطة ${plan.name} (TEST)` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
module.exports.PLANS = PLANS
