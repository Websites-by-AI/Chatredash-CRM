const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  regId: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  field: String,
  exam: String,
  rank: String,
  referrerCode: { type: String, default: null },
  referrerId: { type: String, default: null },
  discountPct: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  basePrice: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  commissionPct: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
