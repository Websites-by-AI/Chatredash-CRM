const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  referrer_id: { type: String, required: true },
  referrer_name: { type: String },
  amount: { type: Number, required: true },
  iban: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  processed_at: { type: String, default: null },
  created_at: { type: String },
}, { versionKey: false });

payoutSchema.set('toJSON', { transform: (doc, ret) => { delete ret._id; return ret; } });
payoutSchema.set('toObject', { transform: (doc, ret) => { delete ret._id; return ret; } });

const MongoModel = mongoose.model('Payout', payoutSchema);

module.exports = new Proxy({}, {
  get(_, prop) {
    const model = global.__memModels?.Payout || MongoModel;
    const val = model[prop];
    return typeof val === 'function' ? val.bind(model) : val;
  }
});
