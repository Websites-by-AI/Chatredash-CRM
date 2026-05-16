const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Referrer = require('../models/Referrer');
const Registration = require('../models/Registration');
const Payout = require('../models/Payout');
const Settings = require('../models/Settings');
const { genCode, genPin } = require('../utils/helpers');

const nowISO = () => new Date().toISOString();

router.use(authenticate, requireAdmin);

router.post('/referrers', async (req, res) => {
  try {
    const { phone, name, commission_pct } = req.body;
    const cleanPhone = (phone || '').trim();
    const s = await Settings.findOne({ settings_id: 'global' });
    const commissionPct = commission_pct != null ? parseFloat(commission_pct) : parseFloat(s.default_commission_pct);

    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      const newUser = { id: uuidv4(), phone: cleanPhone, name: name || '', role: 'referrer', created_at: nowISO() };
      await User.create(newUser);
      user = newUser;
    } else {
      await User.updateOne({ id: user.id }, { $set: { role: 'referrer', name: name || user.name } });
    }

    const existing = await Referrer.findOne({ user_id: user.id });
    if (existing) return res.status(400).json({ error: 'این کاربر قبلاً به‌عنوان معرف ثبت شده است' });

    let code;
    for (let i = 0; i < 20; i++) {
      code = genCode(5);
      const dup = await Referrer.findOne({ referral_code: code });
      if (!dup) break;
    }

    const ref = {
      id: uuidv4(),
      user_id: user.id,
      phone: cleanPhone,
      name: name || '',
      referral_code: code,
      security_pin: genPin(5),
      commission_pct: commissionPct,
      status: 'active',
      total_earnings: 0,
      available_balance: 0,
      total_signups: 0,
      iban: '',
      created_at: nowISO(),
    };
    await Referrer.create(ref);
    return res.status(201).json(ref);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/referrers', async (req, res) => {
  try {
    const refQuery = await Referrer.find({});
    const refs = await (refQuery.sort ? refQuery.sort({ created_at: -1 }).lean() : Promise.resolve(refQuery));
    return res.json(Array.isArray(refs) ? refs : []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/referrers/:id', async (req, res) => {
  try {
    const update = {};
    if (req.body.status != null) update.status = req.body.status;
    if (req.body.commission_pct != null) update.commission_pct = parseFloat(req.body.commission_pct);
    if (req.body.name != null) update.name = req.body.name;
    if (!Object.keys(update).length) return res.status(400).json({ error: 'هیچ تغییری ارسال نشد' });

    await Referrer.updateOne({ id: req.params.id }, { $set: update });
    const ref = await Referrer.findOne({ id: req.params.id });
    if (!ref) return res.status(404).json({ error: 'معرف پیدا نشد' });
    return res.json(ref);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/registrations', async (req, res) => {
  try {
    const regQuery = await Registration.find({});
    const regs = await (regQuery.sort ? regQuery.sort({ created_at: -1 }).lean() : Promise.resolve(regQuery));
    return res.json(Array.isArray(regs) ? regs : []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/payouts', async (req, res) => {
  try {
    const payQuery = await Payout.find({});
    const pays = await (payQuery.sort ? payQuery.sort({ created_at: -1 }).lean() : Promise.resolve(payQuery));
    return res.json(Array.isArray(pays) ? pays : []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/payouts/:id', async (req, res) => {
  try {
    const payout = await Payout.findOne({ id: req.params.id });
    if (!payout) return res.status(404).json({ error: 'درخواست تسویه پیدا نشد' });
    const newStatus = req.body.status;
    if (!['approved', 'rejected', 'paid'].includes(newStatus)) {
      return res.status(400).json({ error: 'وضعیت نامعتبر' });
    }
    await Payout.updateOne({ id: req.params.id }, { $set: { status: newStatus, processed_at: nowISO() } });
    if (newStatus === 'rejected' && payout.status !== 'rejected') {
      await Referrer.updateOne({ id: payout.referrer_id }, { $inc: { available_balance: payout.amount } });
    }
    const updated = await Payout.findOne({ id: req.params.id });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const total_referrers = await Referrer.countDocuments({});
    const active_referrers = await Referrer.countDocuments({ status: 'active' });
    const total_registrations = await Registration.countDocuments({});
    const paid_registrations = await Registration.countDocuments({ status: 'paid' });
    const agg = await Registration.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paid_amount' }, commissions: { $sum: '$commission_amount' } } }
    ]);
    const revenue = agg[0]?.total || 0;
    const commissions = agg[0]?.commissions || 0;
    const pending_payouts = await Payout.countDocuments({ status: 'pending' });
    return res.json({ total_referrers, active_referrers, total_registrations, paid_registrations, revenue, commissions, pending_payouts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const s = await Settings.findOne({ settings_id: 'global' });
    // Mask the API key for security (only show if set)
    const out = { ...s };
    if (out.openai_api_key) out.openai_api_key_set = true;
    else out.openai_api_key_set = false;
    out.openai_api_key = out.openai_api_key ? '••••••••' : '';
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const update = {};
    if (req.body.base_price != null) update.base_price = parseFloat(req.body.base_price);
    if (req.body.default_commission_pct != null) update.default_commission_pct = parseFloat(req.body.default_commission_pct);
    if (req.body.default_discount_pct != null) update.default_discount_pct = parseFloat(req.body.default_discount_pct);
    if (req.body.openai_api_key != null && req.body.openai_api_key !== '••••••••') {
      update.openai_api_key = req.body.openai_api_key.trim();
    }
    update.updated_at = nowISO();
    await Settings.updateOne({ settings_id: 'global' }, { $set: update }, { upsert: true });
    const s = await Settings.findOne({ settings_id: 'global' });
    const out = { ...s };
    out.openai_api_key_set = !!out.openai_api_key;
    out.openai_api_key = out.openai_api_key ? '••••••••' : '';
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
