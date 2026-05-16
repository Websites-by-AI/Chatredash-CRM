const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireReferrer } = require('../middleware/auth');
const Referrer = require('../models/Referrer');
const Registration = require('../models/Registration');
const Payout = require('../models/Payout');

const nowISO = () => new Date().toISOString();

router.use(authenticate, requireReferrer);

router.get('/me', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ user_id: req.user.id });
    if (!ref) return res.status(404).json({ error: 'حساب معرف یافت نشد' });
    return res.json(ref);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/registrations', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ user_id: req.user.id });
    if (!ref) return res.json([]);
    const regQuery = await Registration.find({ referrer_id: ref.id });
    const regs = await (regQuery.sort ? regQuery.sort({ created_at: -1 }).lean() : Promise.resolve(regQuery));
    const arr = Array.isArray(regs) ? regs : [];
    const masked = arr.map(r => {
      const out = { ...r };
      const ph = out.phone || '';
      if (ph.length >= 7) out.phone = ph.slice(0, 4) + '***' + ph.slice(-3);
      return out;
    });
    return res.json(masked);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/payout', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ user_id: req.user.id });
    if (!ref) return res.status(404).json({ error: 'حساب معرف یافت نشد' });
    const amount = parseFloat(req.body.amount);
    const iban = (req.body.iban || '').trim();
    if (!amount || amount <= 0) return res.status(400).json({ error: 'مبلغ نامعتبر' });
    if (amount > ref.available_balance) return res.status(400).json({ error: 'موجودی کافی نیست' });
    if (!iban || iban.length < 10) return res.status(400).json({ error: 'شماره شبا نامعتبر' });

    const payout = {
      id: uuidv4(),
      referrer_id: ref.id,
      referrer_name: ref.name,
      amount,
      iban,
      status: 'pending',
      created_at: nowISO(),
    };
    await Payout.create(payout);
    await Referrer.updateOne({ id: ref.id }, { $inc: { available_balance: -amount }, $set: { iban } });
    return res.status(201).json(payout);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/payouts', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ user_id: req.user.id });
    if (!ref) return res.json([]);
    const payQuery = await Payout.find({ referrer_id: ref.id });
    const pays = await (payQuery.sort ? payQuery.sort({ created_at: -1 }).lean() : Promise.resolve(payQuery));
    return res.json(Array.isArray(pays) ? pays : []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/iban', async (req, res) => {
  try {
    const ref = await Referrer.findOne({ user_id: req.user.id });
    if (!ref) return res.status(404).json({ error: 'حساب معرف یافت نشد' });
    const iban = (req.body.iban || '').trim();
    await Referrer.updateOne({ id: ref.id }, { $set: { iban } });
    return res.json({ success: true, iban });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
