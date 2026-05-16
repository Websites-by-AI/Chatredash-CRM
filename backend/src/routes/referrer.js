const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireReferrer } = require('../middleware/auth');
const Referrer = require('../models/Referrer');
const Registration = require('../models/Registration');
const Payout = require('../models/Payout');

router.use(authenticate, requireReferrer);

router.get('/me', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ userId: req.user.userId }).lean();
    if (!ref) return res.status(404).json({ error: 'حساب معرف یافت نشد' });
    const { _id, __v, ...out } = ref;
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/registrations', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ userId: req.user.userId }).lean();
    if (!ref) return res.json([]);

    const regs = await Registration.find({ referrerId: ref.referrerId }).sort({ createdAt: -1 }).lean();
    const masked = regs.map(({ _id, __v, ...r }) => {
      const ph = r.phone || '';
      if (ph.length >= 7) r.phone = ph.slice(0, 4) + '***' + ph.slice(-3);
      return r;
    });
    return res.json(masked);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/payout', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ userId: req.user.userId }).lean();
    if (!ref) return res.status(404).json({ error: 'حساب معرف یافت نشد' });

    const amount = parseFloat(req.body.amount);
    const iban = (req.body.iban || '').trim();

    if (!amount || amount <= 0) return res.status(400).json({ error: 'مبلغ نامعتبر' });
    if (amount > ref.availableBalance) return res.status(400).json({ error: 'موجودی کافی نیست' });
    if (!iban || iban.length < 10) return res.status(400).json({ error: 'شماره شبا نامعتبر' });

    const payout = await Payout.create({
      payoutId: uuidv4(),
      referrerId: ref.referrerId,
      referrerName: ref.name,
      amount,
      iban,
      status: 'pending',
    });

    await Referrer.updateOne(
      { referrerId: ref.referrerId },
      { $inc: { availableBalance: -amount }, $set: { iban } }
    );

    const { _id, __v, ...out } = payout.toObject();
    return res.status(201).json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/payouts', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ userId: req.user.userId }).lean();
    if (!ref) return res.json([]);
    const pays = await Payout.find({ referrerId: ref.referrerId }).sort({ createdAt: -1 }).lean();
    return res.json(pays.map(({ _id, __v, ...p }) => p));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/iban', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ userId: req.user.userId }).lean();
    if (!ref) return res.status(404).json({ error: 'حساب معرف یافت نشد' });
    const iban = (req.body.iban || '').trim();
    await Referrer.updateOne({ referrerId: ref.referrerId }, { $set: { iban } });
    return res.json({ success: true, iban });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
