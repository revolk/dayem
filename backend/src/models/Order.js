const mongoose = require('mongoose');

// ── Auto-incrementing order counter ──────────────────────
const counterSchema = new mongoose.Schema({
  _id:   { type: String, required: true },
  seq:   { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },

  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  customer: {
    name:        { type: String, required: true },
    phone:       { type: String, required: true },
    email:       { type: String },
    address:     { type: String, required: true },
    governorate: { type: String, required: true },
  },

  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nameAr:   { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image:    { type: String },
  }],

  totalPrice:    { type: Number, required: true },
  shippingPrice: { type: Number, default: 60 },
  discount:      { type: Number, default: 0 },
  finalPrice:    { type: Number, required: true },

  paymentMethod: {
    type: String,
    enum: ['cash', 'vodafone_cash', 'instapay', 'fawry', 'card'],
    default: 'cash'
  },
  paymentRef:    { type: String },
  isPaid:        { type: Boolean, default: false },

  orderStatus: {
    type: String,
    enum: ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'new'
  },

  couponCode: { type: String },
  notes:      { type: String },

  // Notifications
  telegramNotified: { type: Boolean, default: false },
  emailNotified:    { type: Boolean, default: false },

}, { timestamps: true });

// ── Auto order number ─────────────────────────────────────
orderSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  try {
    const counter = await Counter.findByIdAndUpdate(
      'orderNumber',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.orderNumber = `DAY-${String(counter.seq).padStart(5, '0')}`;
    next();
  } catch(e) { next(e); }
});

// ── Indexes ───────────────────────────────────────────────
orderSchema.index({ merchant: 1, createdAt: -1 });
orderSchema.index({ merchant: 1, orderStatus: 1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
