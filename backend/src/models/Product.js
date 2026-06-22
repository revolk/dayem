const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  nameAr:      { type: String, required: true, trim: true },
  nameEn:      { type: String, trim: true },
  description: { type: String, trim: true },
  price:       { type: Number, required: true, min: 0 },
  comparePrice:{ type: Number, min: 0 }, // original price before discount

  // ── Multi-image ───────────────────────────────────────
  images: [{
    url:       { type: String, required: true },
    publicId:  { type: String }, // Cloudinary public_id for deletion
    isPrimary: { type: Boolean, default: false },
  }],

  category:   { type: String },
  stock:      { type: Number, default: 0, min: 0 },
  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  // AI generated
  aiDescription: { type: String },
  aiTags:        [{ type: String }],

  // Stats
  views:       { type: Number, default: 0 },
  totalSold:   { type: Number, default: 0 },
  totalRevenue:{ type: Number, default: 0 },

  // Reviews summary
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },

}, { timestamps: true });

// ── Virtual: primary image ────────────────────────────────
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images?.find(i => i.isPrimary);
  return primary?.url || this.images?.[0]?.url || null;
});

// ── Indexes ───────────────────────────────────────────────
productSchema.index({ merchant: 1, isActive: 1 });
productSchema.index({ merchant: 1, isFeatured: 1 });
productSchema.index({ merchant: 1, category: 1 });
productSchema.index({ totalRevenue: -1 });

module.exports = mongoose.model('Product', productSchema);
