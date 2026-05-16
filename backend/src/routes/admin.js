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

router.use(authenticate, requireAdmin);

router.post('/referrers', async (req, res) => {
  try {
    const { phone, name, commission_pct } = req.body;
    const cleanPhone = (phone || '').trim();
    const s = await Settings.findOne({ settingsId: 'global' }).lean();
    const commissionPct = commission_pct != null ? parseFloat(commission_pct) : parseFloat(s.default_commission_pct);

    let user = await User.findOne({ phone: cleanPhone }).lean();
    if (!user) {
      user = await User.create({
        userId: uuidv4(),
        phone: cleanPhone,
        name: name || '',
        role: 'referrer',
      });
      user = user.toObject();
    } else {
      await User.updateOne({ userId: user.userId }, { $set: { role: 'referrer', name: name || user.name } });
      user.role = 'referrer';
    }

    const existing = await Referrer.findOne({ userId: user.userId }).lean();
    if (existing) return res.status(400).json({ error: 'این کاربر قبلاً به‌عنوان معرف ثبت شده است' });

    let code;
    for (let i = 0; i < 20; i++) {
      code = genCode(5);
      const dup = await Referrer.findOne({ referralCode: code });
      if (!dup) break;
    }

    const ref = await Referrer.create({
      referrerId: uuidv4(),
      userId: user.userId,
      phone: cleanPhone,
      name: name || '',
      referralCode: code,
      securityPin: genPin(5),
      commissionPct,
      status: 'active',
      totalEarnings: 0,
      availableBalance: 0,
      totalSignups: 0,
      iban: '',
    });

    const { _id, __v, ...refOut } = ref.toObject();
    return res.status(201).json(refOut);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/referrers', async (req, res) => {
  try {
    const refs = await Referrer.find({}).sort({ createdAt: -1 }).lean();
    return res.json(refs.map(({ _id, __v, ...r }) => r));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/referrers/:id', async (req, res) => {
  try {
    const update = {};
    if (req.body.status != null) update.status = req.body.status;
    if (req.body.commission_pct != null) update.commissionPct = parseFloat(req.body.commission_pct);
    if (req.body.name != null) update.name = req.body.name;

    if (!Object.keys(update).length) return res.status(400).json({ error: 'هیچ تغییری ارسال نشد' });

    await Referrer.updateOne({ referrerId: req.params.id }, { $set: update });
    const ref = await Referrer.findOne({ referrerId: req.params.id }).lean();
    if (!ref) return res.status(404).json({ error: 'معرف پیدا نشد' });
    const { _id, __v, ...refOut } = ref;
    return res.json(refOut);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/registrations', async (req, res) => {
  try {
    const regs = await Registration.find({}).sort({ createdAt: -1 }).lean();
    return res.json(regs.map(({ _id, __v, ...r }) => r));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/payouts', async (req, res) => {
  try {
    const pays = await Payout.find({}).sort({ createdAt: -1 }).lean();
    return res.json(pays.map(({ _id, __v, ...p }) => p));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/payouts/:id', async (req, res) => {
  try {
    const payout = await Payout.findOne({ payoutId: req.params.id }).lean();
    if (!payout) return res.status(404).json({ error: 'درخواست تسویه پیدا نشد' });

    const newStatus = req.body.status;
    if (!['approved', 'rejected', 'paid'].includes(newStatus)) {
      return res.status(400).json({ error: 'وضعیت نامعتبر' });
    }

    await Payout.updateOne({ payoutId: req.params.id }, { $set: { status: newStatus, processedAt: new Date() } });

    if (newStatus === 'rejected' && payout.status !== 'rejected') {
      await Referrer.updateOne(
        { referrerId: payout.referrerId },
        { $inc: { availableBalance: payout.amount } }
      );
    }

    const updated = await Payout.findOne({ payoutId: req.params.id }).lean();
    const { _id, __v, ...out } = updated;
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalReferrers = await Referrer.countDocuments({});
    const activeReferrers = await Referrer.countDocuments({ status: 'active' });
    const totalRegs = await Registration.countDocuments({});
    const paidRegs = await Registration.countDocuments({ status: 'paid' });

    const agg = await Registration.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, commissions: { $sum: '$commissionAmount' } } }
    ]);
    const revenue = agg[0]?.total || 0;
    const commissions = agg[0]?.commissions || 0;
    const pendingPayouts = await Payout.countDocuments({ status: 'pending' });

    return res.json({
      total_referrers: totalReferrers,
      active_referrers: activeReferrers,
      total_registrations: totalRegs,
      paid_registrations: paidRegs,
      revenue,
      commissions,
      pending_payouts: pendingPayouts,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const s = await Settings.findOne({ settingsId: 'global' }).lean();
    const { _id, __v, ...out } = s;
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

    await Settings.updateOne({ settingsId: 'global' }, { $set: update }, { upsert: true });
    const s = await Settings.findOne({ settingsId: 'global' }).lean();
    const { _id, __v, ...out } = s;
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
