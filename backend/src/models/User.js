const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true },
  password: { type: String, minlength: 6, select: false },

  // OAuth
  googleId:   { type: String, sparse: true },
  facebookId: { type: String, sparse: true },
  avatar:     { type: String },

  role: { type: String, enum: ['customer', 'merchant', 'admin'], default: 'merchant' },

  // Email verification
  isVerified:        { type: Boolean, default: false },
  verifyToken:       { type: String, select: false },
  verifyTokenExpiry: { type: Date,   select: false },

  // Password reset
  resetToken:       { type: String, select: false },
  resetTokenExpiry: { type: Date,   select: false },

  store: {
    name:        { type: String, trim: true },
    slug:        { type: String, lowercase: true, trim: true },
    description: { type: String },
    logo:        { type: String, default: '' },
    phone:       { type: String },
    governorate: { type: String },
    address:     { type: String },
    category:    { type: String },
    isActive:    { type: Boolean, default: true },

    // ── Theme ──────────────────────────────────────────
    theme: {
      type: String,
      enum: ['midnight','obsidian','rose','forest','desert','ocean','royal','crimson','sky','mint','blush','lemon','lavender','peach'],
      default: 'midnight'
    },

    // ── Plan ───────────────────────────────────────────
    plan: {
      type: String,
      enum: ['starter', 'merchant', 'pro'],
      default: 'starter'
    },
    planActivatedAt: { type: Date },
    planExpiresAt:   { type: Date },
    maxProducts:     { type: Number, default: 5 },
    lastPaymobTxn:   { type: String },

    // Payment methods
    vodafoneCash: { type: String, default: '' },
    instapay:     { type: String, default: '' },
    fawryCode:    { type: String, default: '' },
  },

  isActive:       { type: Boolean, default: true },
  telegramChatId: { type: String, default: '' },

}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────
userSchema.index({ 'store.slug': 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ facebookId: 1 }, { sparse: true });

// ── Password hash ─────────────────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
