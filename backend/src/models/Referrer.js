const mongoose = require('mongoose');

const referrerSchema = new mongoose.Schema({
  referrerId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  securityPin: { type: String },
  commissionPct: { type: Number, default: 20 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  totalEarnings: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  totalSignups: { type: Number, default: 0 },
  iban: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Referrer', referrerSchema);
