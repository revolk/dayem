const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    governorate: { type: String, required: true },
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nameAr: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  }],
  totalPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 60 },
  finalPrice: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cash', 'vodafone_cash', 'instapay', 'fawry'],
    default: 'cash'
  },
  orderStatus: {
    type: String,
    enum: ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'new'
  },
  notes: { type: String },
  orderNumber: { type: String, unique: true },
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `DAY-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);