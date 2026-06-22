const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  merchant:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  order:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },

  customerName:  { type: String, required: true },
  customerPhone: { type: String },

  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 500 },

  // Merchant reply
  reply:      { type: String, trim: true },
  repliedAt:  { type: Date },

  isVerified: { type: Boolean, default: false }, // verified purchase
  isVisible:  { type: Boolean, default: true },

}, { timestamps: true });

// ── Prevent duplicate reviews per order ───────────────────
reviewSchema.index({ order: 1, customer: 1 }, { unique: true, sparse: true });
reviewSchema.index({ merchant: 1, isVisible: 1 });
reviewSchema.index({ product: 1, isVisible: 1 });

// ── Update product rating after save ─────────────────────
reviewSchema.post('save', async function() {
  if (!this.product) return;
  try {
    const Product = mongoose.model('Product');
    const stats = await mongoose.model('Review').aggregate([
      { $match: { product: this.product, isVisible: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(this.product, {
        rating:      Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count
      });
    }
  } catch(e) { console.error('Review post-save error:', e.message); }
});

module.exports = mongoose.model('Review', reviewSchema);
