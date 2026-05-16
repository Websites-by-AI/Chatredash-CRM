const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'referrer', 'registrant'], default: 'registrant' },
  created_at: { type: String },
}, { _id: true, versionKey: false });

userSchema.set('toJSON', { transform: (doc, ret) => { delete ret._id; return ret; } });
userSchema.set('toObject', { transform: (doc, ret) => { delete ret._id; return ret; } });

const MongoModel = mongoose.model('User', userSchema);

module.exports = new Proxy({}, {
  get(_, prop) {
    const model = global.__memModels?.User || MongoModel;
    const val = model[prop];
    return typeof val === 'function' ? val.bind(model) : val;
  }
});
