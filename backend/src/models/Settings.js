const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  settings_id: { type: String, required: true, unique: true },
  base_price: { type: Number, default: 1000000 },
  default_commission_pct: { type: Number, default: 20 },
  default_discount_pct: { type: Number, default: 10 },
  openai_api_key: { type: String, default: '' },
  updated_at: { type: String },
}, { versionKey: false });

settingsSchema.set('toJSON', { transform: (doc, ret) => { delete ret._id; return ret; } });
settingsSchema.set('toObject', { transform: (doc, ret) => { delete ret._id; return ret; } });

const MongoModel = mongoose.model('Settings', settingsSchema);

module.exports = new Proxy({}, {
  get(_, prop) {
    const model = global.__memModels?.Settings || MongoModel;
    const val = model[prop];
    return typeof val === 'function' ? val.bind(model) : val;
  }
});
