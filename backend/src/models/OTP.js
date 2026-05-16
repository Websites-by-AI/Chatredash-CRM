const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expires_at: { type: String },
}, { versionKey: false });

otpSchema.index({ expires_at: 1 });
otpSchema.set('toJSON', { transform: (doc, ret) => { delete ret._id; return ret; } });

const MongoModel = mongoose.model('OTP', otpSchema);

module.exports = new Proxy({}, {
  get(_, prop) {
    const model = global.__memModels?.OTP || MongoModel;
    const val = model[prop];
    return typeof val === 'function' ? val.bind(model) : val;
  }
});
