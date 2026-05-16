require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const referrerRoutes = require('./routes/referrer');
const studioRoutes = require('./routes/studio');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referrer', referrerRoutes);
app.use('/api/studio', studioRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Rotbe Bartar API - Node.js', status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'خطای سرور' });
});

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/rotbebartar';

async function bootstrap(db) {
  try {
    const Settings = require('./models/Settings');
    const User = require('./models/User');

    let settings = await Settings.findOne({ settingsId: 'global' });
    if (!settings) {
      await Settings.create({
        settingsId: 'global',
        base_price: 1000000,
        default_commission_pct: 20,
        default_discount_pct: 10,
        updatedAt: new Date(),
      });
      console.log('Default settings created');
    }

    const adminPhone = '09120000000';
    let admin = await User.findOne({ phone: adminPhone });
    if (!admin) {
      await User.create({
        userId: uuidv4(),
        phone: adminPhone,
        name: 'مدیر سیستم',
        role: 'admin',
      });
      console.log('Admin user created');
    }
    console.log('Bootstrap complete');
  } catch (err) {
    console.error('Bootstrap error:', err.message);
  }
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await bootstrap();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Rotbe Bartar backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
