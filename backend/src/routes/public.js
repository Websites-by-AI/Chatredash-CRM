const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Settings = require('../models/Settings');
const Referrer = require('../models/Referrer');
const Registration = require('../models/Registration');

const nowISO = () => new Date().toISOString();

router.get('/settings', async (req, res) => {
  try {
    const s = await Settings.findOne({ settings_id: 'global' });
    return res.json({
      base_price: s.base_price,
      default_discount_pct: s.default_discount_pct,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/referrer/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const ref = await Referrer.findOne({ referral_code: code, status: 'active' });
    if (!ref) return res.status(404).json({ error: 'کد معرف معتبر نیست' });
    const s = await Settings.findOne({ settings_id: 'global' });
    return res.json({
      valid: true,
      name: ref.name || '',
      referral_code: ref.referral_code,
      discount_pct: s.default_discount_pct,
      base_price: s.base_price,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, phone, field, exam, rank, referrer_code } = req.body;
    const s = await Settings.findOne({ settings_id: 'global' });
    const base_price = parseFloat(s.base_price);

    let discount_pct = 0, referrerCode = null, referrer_id = null, commission_pct = 0;

    if (referrer_code) {
      const rc = referrer_code.toUpperCase().trim();
      const ref = await Referrer.findOne({ referral_code: rc, status: 'active' });
      if (ref) {
        referrerCode = ref.referral_code;
        referrer_id = ref.id;
        commission_pct = parseFloat(ref.commission_pct || s.default_commission_pct);
        discount_pct = parseFloat(s.default_discount_pct);
      }
    }

    const discount_amount = Math.round(base_price * discount_pct / 100);
    const paid_amount = base_price - discount_amount;
    const commission_amount = referrer_id ? Math.round(paid_amount * commission_pct / 100) : 0;

    const reg = await Registration.create({
      id: uuidv4(),
      name, phone, field, exam, rank,
      referrer_code: referrerCode,
      referrer_id,
      discount_pct,
      discount_amount,
      base_price,
      paid_amount,
      commission_pct,
      commission_amount,
      status: 'pending',
      created_at: nowISO(),
    });

    return res.json(reg.toObject ? reg.toObject() : reg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/pay/:regId', async (req, res) => {
  try {
    let reg = await Registration.findOne({ id: req.params.regId });
    if (!reg) return res.status(404).json({ error: 'ثبت‌نام پیدا نشد' });
    if (reg.status === 'paid') {
      return res.json({ success: true, already: true, registration: reg });
    }

    await Registration.updateOne(
      { id: req.params.regId },
      { $set: { status: 'paid', paid_at: nowISO() } }
    );

    if (reg.referrer_id && reg.commission_amount > 0) {
      await Referrer.updateOne(
        { id: reg.referrer_id },
        {
          $inc: {
            total_earnings: reg.commission_amount,
            available_balance: reg.commission_amount,
            total_signups: 1,
          }
        }
      );
    }

    reg = await Registration.findOne({ id: req.params.regId });
    return res.json({ success: true, registration: reg });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
