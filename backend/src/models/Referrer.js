const mongoose = require('mongoose');

const referrerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  referral_code: { type: String, required: true, unique: true },
  security_pin: { type: String },
  commission_pct: { type: Number, default: 20 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  total_earnings: { type: Number, default: 0 },
  available_balance: { type: Number, default: 0 },
  total_signups: { type: Number, default: 0 },
  iban: { type: String, default: '' },
  created_at: { type: String },
}, { versionKey: false });

referrerSchema.set('toJSON', { transform: (doc, ret) => { delete ret._id; return ret; } });
referrerSchema.set('toObject', { transform: (doc, ret) => { delete ret._id; return ret; } });

const MongoModel = mongoose.model('Referrer', referrerSchema);

module.exports = new Proxy({}, {
  get(_, prop) {
    const model = global.__memModels?.Referrer || MongoModel;
    const val = model[prop];
    return typeof val === 'function' ? val.bind(model) : val;
  }
});
