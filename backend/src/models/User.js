const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'referrer', 'registrant'], default: 'registrant' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
