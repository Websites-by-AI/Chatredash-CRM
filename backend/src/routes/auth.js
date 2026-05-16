const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { makeToken, authenticate } = require('../middleware/auth');

const nowISO = () => new Date().toISOString();

router.post('/send-otp', async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'شماره موبایل نامعتبر' });
    }
    let code = '';
    for (let i = 0; i < 5; i++) code += Math.floor(Math.random() * 10);
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await OTP.findOneAndUpdate(
      { phone },
      { $set: { phone, code, expires_at } },
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
    if (rec.expires_at && new Date(rec.expires_at) < new Date()) {
      return res.status(400).json({ error: 'کد منقضی شده' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      const newUser = {
        id: uuidv4(),
        phone,
        name: '',
        role: 'registrant',
        created_at: nowISO(),
      };
      user = await User.create(newUser);
      user = newUser;
    }

    await OTP.deleteOne({ phone });

    const token = makeToken(user.id, user.role);
    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const out = { user: req.user };
    if (req.user.role === 'referrer') {
      const Referrer = require('../models/Referrer');
      const ref = await Referrer.findOne({ user_id: req.user.id });
      if (ref) out.referrer = ref;
    }
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
