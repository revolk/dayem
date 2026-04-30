// backend/src/models/Customer.js
const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true, unique: true, trim: true },
  email:     { type: String, trim: true, lowercase: true },
  governorate: { type: String },
  address:   { type: String },
  isActive:  { type: Boolean, default: true },
  // آخر طلب — للتعرف السريع
  lastOrderAt: { type: Date },
  totalOrders: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Customer', customerSchema)
