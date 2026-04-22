const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get store info
router.get('/:slug', async (req, res) => {
  try {
    const merchant = await User.findOne({
      'store.slug': req.params.slug,
      role: 'merchant',
      isActive: true
    });
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' });
    res.json({
      success: true,
      store: {
        name: merchant.store.name,
        slug: merchant.store.slug,
        description: merchant.store.description,
        logo: merchant.store.logo,
        phone: merchant.store.phone,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get store products
router.get('/:slug/products', async (req, res) => {
  try {
    const merchant = await User.findOne({ 'store.slug': req.params.slug, role: 'merchant' });
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' });
    const products = await Product.find({ merchant: merchant._id, isActive: true });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Place order
router.post('/:slug/orders', async (req, res) => {
  try {
    const merchant = await User.findOne({ 'store.slug': req.params.slug, role: 'merchant' });
    if (!merchant) return res.status(404).json({ message: 'المتجر غير موجود' });
    const { customer, items, paymentMethod, notes } = req.body;
    const totalPrice = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const shippingPrice = totalPrice >= 500 ? 0 : 60;
    const finalPrice = totalPrice + shippingPrice;
    const order = await Order.create({
      merchant: merchant._id,
      customer, items, totalPrice, shippingPrice, finalPrice,
      paymentMethod: paymentMethod || 'cash', notes
    });
    res.status(201).json({
      success: true,
      order: { orderNumber: order.orderNumber, finalPrice: order.finalPrice, orderStatus: order.orderStatus }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;