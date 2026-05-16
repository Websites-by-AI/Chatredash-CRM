const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  field: String,
  exam: String,
  rank: String,
  referrer_code: { type: String, default: null },
  referrer_id: { type: String, default: null },
  discount_pct: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  base_price: { type: Number, default: 0 },
  paid_amount: { type: Number, default: 0 },
  commission_pct: { type: Number, default: 0 },
  commission_amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paid_at: { type: String, default: null },
  created_at: { type: String },
}, { versionKey: false });

registrationSchema.set('toJSON', { transform: (doc, ret) => { delete ret._id; return ret; } });
registrationSchema.set('toObject', { transform: (doc, ret) => { delete ret._id; return ret; } });

const MongoModel = mongoose.model('Registration', registrationSchema);

module.exports = new Proxy({}, {
  get(_, prop) {
    const model = global.__memModels?.Registration || MongoModel;
    const val = model[prop];
    return typeof val === 'function' ? val.bind(model) : val;
  }
});
