const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  settingsId: { type: String, required: true, unique: true },
  base_price: { type: Number, default: 1000000 },
  default_commission_pct: { type: Number, default: 20 },
  default_discount_pct: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
