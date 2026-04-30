// backend/src/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code:     { type: String, required: true, uppercase: true, trim: true },
  type:     { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value:    { type: Number, required: true }, // % أو جنيه
  minOrder: { type: Number, default: 0 },     // حد أدنى للطلب
  maxUses:  { type: Number, default: 0 },     // 0 = غير محدود
  usedCount:{ type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt:{ type: Date, default: null },
}, { timestamps: true });

// unique per merchant
couponSchema.index({ merchant: 1, code: 1 }, { unique: true });

couponSchema.methods.isValid = function(orderTotal) {
  if (!this.isActive) return { valid: false, msg: 'الكوبون غير نشط' };
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, msg: 'انتهت صلاحية الكوبون' };
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return { valid: false, msg: 'تم استخدام الكوبون بالكامل' };
  if (orderTotal < this.minOrder) return { valid: false, msg: `الحد الأدنى للطلب ${this.minOrder} ج` };
  return { valid: true };
};

couponSchema.methods.calcDiscount = function(orderTotal) {
  if (this.type === 'percent') return Math.round((orderTotal * this.value) / 100);
  return Math.min(this.value, orderTotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
