const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['customer', 'merchant', 'admin'], default: 'customer' },
  store: {
    name:         { type: String, trim: true },
    slug:         { type: String, unique: true, sparse: true },
    description:  { type: String },
    logo:         { type: String, default: '' },
    phone:        { type: String },
    governorate:  { type: String },
    address:      { type: String },
    category:     { type: String },
    isActive:     { type: Boolean, default: true },
    plan:         { type: String, enum: ['starter', 'tajer', 'pro'], default: 'starter' },
    // ── وسائل الدفع ──────────────────────────────
    vodafoneCash: { type: String, default: '' },  // رقم فودافون كاش
    instapay:     { type: String, default: '' },  // رقم انستاباي / IPA
    fawryCode:    { type: String, default: '' },  // رقم موبايل فوري
  },
  isActive:       { type: Boolean, default: true },
  telegramChatId: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
