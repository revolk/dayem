const express = require('express')
const router = express.Router()
const axios = require('axios')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

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

const PLANS = {
  starter: {
    name: 'ستارتر',
    nameEn: 'Starter',
    price: 100,
    priceInCents: 10000,
    maxProducts: 5,
    features: ['5 منتجات', 'متجر كامل', 'رابط مخصص', 'كل طرق الدفع']
  },
  merchant: {
    name: 'تاجر',
    nameEn: 'Merchant',
    price: 199,
    priceInCents: 19900,
    maxProducts: 20,
    features: ['20 منتج', 'تقارير مبيعات', 'كوبونات وخصومات', 'دعم أولوية 24/7']
  },
  pro: {
    name: 'برو',
    nameEn: 'Pro',
    price: 349,
    priceInCents: 34900,
    maxProducts: -1, // unlimited
    features: ['منتجات غير محدودة', 'متاجر متعددة', 'API Integration', 'مدير حساب مخصص']
  }
}

// Get plans info
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS })
})

// Step 1: Authenticate with Paymob → get auth token
const getAuthToken = async () => {
  const res = await axios.post('https://accept.paymob.com/api/auth/tokens', {
    api_key: process.env.PAYMOB_API_KEY
  })
  return res.data.token
}

// Step 2: Create order in Paymob
const createPaymobOrder = async (authToken, amount, merchantId, planId) => {
  const res = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
    auth_token: authToken,
    delivery_needed: false,
    amount_cents: amount,
    currency: 'EGP',
    merchant_order_id: `dayem_${merchantId}_${planId}_${Date.now()}`,
    items: [{
      name: `دايم - خطة ${PLANS[planId]?.name}`,
      amount_cents: amount,
      description: `اشتراك شهري - ${PLANS[planId]?.name}`,
      quantity: 1
    }]
  })
  return res.data.id
}

// Step 3: Get payment key
const getPaymentKey = async (authToken, orderId, amount, merchant) => {
  const res = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
    auth_token: authToken,
    amount_cents: amount,
    expiration: 3600,
    order_id: orderId,
    billing_data: {
      apartment: 'NA',
      email: merchant.email || 'NA',
      floor: 'NA',
      first_name: merchant.name?.split(' ')[0] || 'NA',
      last_name: merchant.name?.split(' ')[1] || 'NA',
      street: 'NA',
      building: 'NA',
      phone_number: merchant.phone || '+20100000000',
      shipping_method: 'NA',
      postal_code: 'NA',
      city: 'NA',
      country: 'EG',
      state: 'NA'
    },
    currency: 'EGP',
    integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID),
    lock_order_when_paid: false
  })
  return res.data.token
}

// Initiate payment
router.post('/initiate', auth, async (req, res) => {
  try {
    const { planId } = req.body
    const plan = PLANS[planId]
    if (!plan) return res.status(400).json({ message: 'خطة غير صحيحة' })

    const merchant = await User.findById(req.user.id)
    if (!merchant) return res.status(404).json({ message: 'التاجر غير موجود' })

    // Get Paymob auth token
    const authToken = await getAuthToken()

    // Create order
    const orderId = await createPaymobOrder(authToken, plan.priceInCents, merchant._id, planId)

    // Get payment key
    const paymentKey = await getPaymentKey(authToken, orderId, plan.priceInCents, merchant)

    // Payment URL
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`

    // Save pending subscription
    await User.findByIdAndUpdate(req.user.id, {
      'store.pendingPlan': planId,
      'store.pendingOrderId': orderId.toString()
    })

    res.json({
      success: true,
      paymentUrl,
      paymentKey,
      plan: { id: planId, ...plan }
    })
  } catch (err) {
    console.error('Paymob error:', err.response?.data || err.message)
    res.status(500).json({ message: 'خطأ في بوابة الدفع' })
  }
})

// Webhook - Paymob callback after payment
router.post('/webhook', async (req, res) => {
  try {
    const { obj } = req.body

    if (obj?.success === true) {
      const merchantOrderId = obj.order?.merchant_order_id || ''
      // Format: dayem_MERCHANTID_PLANID_TIMESTAMP
      const parts = merchantOrderId.split('_')
      if (parts.length >= 3) {
        const merchantId = parts[1]
        const planId = parts[2]
        const plan = PLANS[planId]

        if (plan) {
          await User.findByIdAndUpdate(merchantId, {
            'store.plan': planId,
            'store.planActivatedAt': new Date(),
            'store.planExpiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            'store.maxProducts': plan.maxProducts,
            'store.isActive': true,
            'store.pendingPlan': null,
            isActive: true
          })
          console.log(`✅ Plan activated: ${planId} for merchant ${merchantId}`)
        }
      }
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// Get current subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const merchant = await User.findById(req.user.id)
    const planId = merchant.store?.plan || 'starter'
    const plan = PLANS[planId]
    const expiresAt = merchant.store?.planExpiresAt
    const isExpired = expiresAt ? new Date() > new Date(expiresAt) : false

    res.json({
      success: true,
      plan: { id: planId, ...plan },
      activatedAt: merchant.store?.planActivatedAt,
      expiresAt,
      isExpired,
      maxProducts: merchant.store?.maxProducts || 5,
      isActive: merchant.store?.isActive && !isExpired
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Manual activation (for testing)
router.post('/activate-test', auth, async (req, res) => {
  try {
    const { planId } = req.body
    const plan = PLANS[planId]
    if (!plan) return res.status(400).json({ message: 'خطة غير صحيحة' })

    await User.findByIdAndUpdate(req.user.id, {
      'store.plan': planId,
      'store.planActivatedAt': new Date(),
      'store.planExpiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      'store.maxProducts': plan.maxProducts,
      'store.isActive': true,
      isActive: true
    })

    res.json({ success: true, message: `تم تفعيل خطة ${plan.name}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
module.exports.PLANS = PLANS
