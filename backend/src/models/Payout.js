const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  payoutId: { type: String, required: true, unique: true },
  referrerId: { type: String, required: true },
  referrerName: { type: String },
  amount: { type: Number, required: true },
  iban: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  processedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
