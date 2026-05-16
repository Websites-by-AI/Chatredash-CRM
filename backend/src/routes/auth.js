const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { makeToken, authenticate } = require('../middleware/auth');

router.post('/send-otp', async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'شماره موبایل نامعتبر' });
    }
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += digits[Math.floor(Math.random() * 10)];

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.findOneAndUpdate(
      { phone },
      { phone, code, expiresAt },
      { upsert: true, new: true }
    );
    return res.json({ sent: true, dev_otp: code, message: 'کد یک‌بارمصرف ارسال شد (حالت آزمایشی)' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    const code = (req.body.code || '').trim();

    const rec = await OTP.findOne({ phone });
    if (!rec || rec.code !== code) {
      return res.status(400).json({ error: 'کد وارد شده نامعتبر است' });
    }
    if (rec.expiresAt < new Date()) {
      return res.status(400).json({ error: 'کد منقضی شده' });
    }

    let user = await User.findOne({ phone }).lean();
    if (!user) {
      user = await User.create({
        userId: uuidv4(),
        phone,
        name: '',
        role: 'registrant',
      });
      user = user.toObject();
    }

    await OTP.deleteOne({ phone });

    const token = makeToken(user.userId, user.role);
    const { _id, __v, ...userOut } = user;
    return res.json({ token, user: userOut });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const Referrer = require('../models/Referrer');
    const { _id, __v, ...userOut } = req.user;
    const out = { user: userOut };
    if (req.user.role === 'referrer') {
      const ref = await Referrer.findOne({ userId: req.user.userId }).lean();
      if (ref) {
        const { _id: rId, __v: rV, ...refOut } = ref;
        out.referrer = refOut;
      }
    }
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
