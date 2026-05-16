const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Settings = require('../models/Settings');
const Referrer = require('../models/Referrer');
const Registration = require('../models/Registration');

router.get('/settings', async (req, res) => {
  try {
    const s = await Settings.findOne({ settingsId: 'global' }).lean();
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
    const ref = await Referrer.findOne({ referralCode: code, status: 'active' }).lean();
    if (!ref) return res.status(404).json({ error: 'کد معرف معتبر نیست' });

    const s = await Settings.findOne({ settingsId: 'global' }).lean();
    return res.json({
      valid: true,
      name: ref.name || '',
      referral_code: ref.referralCode,
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
    const s = await Settings.findOne({ settingsId: 'global' }).lean();
    const basePrice = parseFloat(s.base_price);

    let discountPct = 0, referrerCode = null, referrerId = null, commissionPct = 0;

    if (referrer_code) {
      const rc = referrer_code.toUpperCase().trim();
      const ref = await Referrer.findOne({ referralCode: rc, status: 'active' }).lean();
      if (ref) {
        referrerCode = ref.referralCode;
        referrerId = ref.referrerId;
        commissionPct = parseFloat(ref.commissionPct || s.default_commission_pct);
        discountPct = parseFloat(s.default_discount_pct);
      }
    }

    const discountAmount = Math.round(basePrice * discountPct / 100);
    const paidAmount = basePrice - discountAmount;
    const commissionAmount = referrerId ? Math.round(paidAmount * commissionPct / 100) : 0;

    const reg = await Registration.create({
      regId: uuidv4(),
      name, phone, field, exam, rank,
      referrerCode, referrerId,
      discountPct, discountAmount,
      basePrice: basePrice,
      paidAmount, commissionPct, commissionAmount,
      status: 'pending',
    });

    const { _id, __v, ...regOut } = reg.toObject();
    return res.json(regOut);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/pay/:regId', async (req, res) => {
  try {
    let reg = await Registration.findOne({ regId: req.params.regId }).lean();
    if (!reg) return res.status(404).json({ error: 'ثبت‌نام پیدا نشد' });
    if (reg.status === 'paid') {
      const { _id, __v, ...regOut } = reg;
      return res.json({ success: true, already: true, registration: regOut });
    }

    await Registration.updateOne(
      { regId: req.params.regId },
      { $set: { status: 'paid', paidAt: new Date() } }
    );

    if (reg.referrerId && reg.commissionAmount > 0) {
      await Referrer.updateOne(
        { referrerId: reg.referrerId },
        {
          $inc: {
            totalEarnings: reg.commissionAmount,
            availableBalance: reg.commissionAmount,
            totalSignups: 1,
          }
        }
      );
    }

    reg.status = 'paid';
    const { _id, __v, ...regOut } = reg;
    return res.json({ success: true, registration: regOut });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
