// backend/src/models/Review.js
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, trim: true, maxlength: 500 },
  isVisible:{ type: Boolean, default: true },
}, { timestamps: true })

// منع تقييم أكتر من مرة على نفس الطلب
reviewSchema.index({ order: 1, customer: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Review', reviewSchema)
