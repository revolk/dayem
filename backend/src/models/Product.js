const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nameAr: { type: String, required: true, trim: true },
  name: { type: String, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  category: { type: String, trim: true },
  images: [{ url: String }],
  stock: { type: Number, default: 0, min: 0 },
  sold: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  aiGenerated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);