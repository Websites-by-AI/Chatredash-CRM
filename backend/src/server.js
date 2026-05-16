require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

let dbStatus = { connected: false, mode: 'none', error: null };

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: dbStatus });
});

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const referrerRoutes = require('./routes/referrer');
const studioRoutes = require('./routes/studio');

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referrer', referrerRoutes);
app.use('/api/studio', studioRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Rotbe Bartar API', status: 'ok', db: dbStatus });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'خطای سرور' });
});

// ─── Bootstrap default data ────────────────────────────────────────────────
async function bootstrap() {
  try {
    const Settings = require('./models/Settings');
    const User = require('./models/User');
    const nowISO = () => new Date().toISOString();

    const settings = await Settings.findOne({ settings_id: 'global' });
    if (!settings) {
      await Settings.create({
        settings_id: 'global',
        base_price: 1000000,
        default_commission_pct: 20,
        default_discount_pct: 10,
        openai_api_key: '',
        updated_at: nowISO(),
      });
      console.log('✓ Default settings created');
    }

    const admin = await User.findOne({ phone: '09120000000' });
    if (!admin) {
      await User.create({
        id: uuidv4(),
        phone: '09120000000',
        name: 'مدیر سیستم',
        role: 'admin',
        created_at: nowISO(),
      });
      console.log('✓ Admin user created: phone=09120000000');
    }
    console.log('✓ Bootstrap complete');
  } catch (err) {
    console.error('Bootstrap error:', err.message);
  }
}

// ─── In-memory store setup ─────────────────────────────────────────────────
function makeMemModel(store) {
  const nowISO = () => new Date().toISOString();
  return {
    findOne: async (query) => {
      const q = query || {};
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) {
          const { _memId, ...clean } = doc;
          return clean;
        }
      }
      return null;
    },
    find: async (query) => {
      const q = query || {};
      const results = [];
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) {
          const { _memId, ...clean } = doc;
          results.push(clean);
        }
      }
      const sorted = results.sort((a, b) => (b.created_at || '') > (a.created_at || '') ? 1 : -1);
      return {
        sort: () => ({ lean: () => Promise.resolve(sorted) }),
        lean: () => Promise.resolve(sorted),
        then: (resolve) => resolve(sorted),
        [Symbol.iterator]: () => sorted[Symbol.iterator](),
      };
    },
    create: async (doc) => {
      const saved = { ...doc, _memId: uuidv4() };
      store.set(saved._memId, saved);
      const { _memId, ...clean } = saved;
      return { ...clean, toObject: () => ({ ...clean }) };
    },
    updateOne: async (query, update, options = {}) => {
      let found = false;
      const q = query || {};
      // Detect if update uses operators ($set/$inc) or is a replacement doc
      const hasOperators = update.$set || update.$inc;
      const replacementData = hasOperators ? null : update;
      for (const [key, doc] of store.entries()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) {
          if (replacementData) {
            // Replace entire doc (preserve _memId)
            const memId = doc._memId;
            Object.keys(doc).forEach(k => { if (k !== '_memId') delete doc[k]; });
            Object.assign(doc, replacementData, { _memId: memId });
          } else {
            if (update.$set) Object.assign(doc, update.$set);
            if (update.$inc) {
              for (const [k, v] of Object.entries(update.$inc)) doc[k] = (doc[k] || 0) + v;
            }
          }
          store.set(key, doc);
          found = true;
          break;
        }
      }
      if (!found && options.upsert) {
        const base = replacementData || update.$set || {};
        const newDoc = { ...base, _memId: uuidv4(), created_at: nowISO() };
        store.set(newDoc._memId, newDoc);
      }
      return { matchedCount: found ? 1 : 0, modifiedCount: found ? 1 : 0 };
    },
    deleteOne: async (query) => {
      const q = query || {};
      for (const [key, doc] of store.entries()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) {
          store.delete(key);
          return { deletedCount: 1 };
        }
      }
      return { deletedCount: 0 };
    },
    countDocuments: async (query) => {
      const q = query || {};
      let count = 0;
      for (const doc of store.values()) {
        if (Object.entries(q).every(([k, v]) => doc[k] === v)) count++;
      }
      return count;
    },
    aggregate: async (pipeline) => {
      const matchStage = (pipeline.find(s => s.$match) || {}).$match || {};
      const groupStage = (pipeline.find(s => s.$group) || {}).$group;
      let docs = [];
      for (const doc of store.values()) {
        if (Object.entries(matchStage).every(([k, v]) => doc[k] === v)) docs.push(doc);
      }
      if (!groupStage || !docs.length) return [];
      const result = { _id: null };
      for (const [k, v] of Object.entries(groupStage)) {
        if (k === '_id') continue;
        if (v.$sum) {
          const field = typeof v.$sum === 'string' ? v.$sum.replace('$', '') : null;
          result[k] = field ? docs.reduce((s, d) => s + (Number(d[field]) || 0), 0) : docs.length * v.$sum;
        }
      }
      return [result];
    },
    findOneAndUpdate: async function(query, update, options) {
      await this.updateOne(query, update, options);
      return this.findOne(query);
    },
  };
}

async function setupMemoryMode() {
  const nowISO = () => new Date().toISOString();
  const stores = {};
  const modelNames = ['User', 'OTP', 'Referrer', 'Registration', 'Payout', 'Settings', 'Content'];
  for (const name of modelNames) stores[name] = new Map();

  global.__memModels = {};
  for (const name of modelNames) global.__memModels[name] = makeMemModel(stores[name]);

  dbStatus = { connected: true, mode: 'memory', error: 'No MONGO_URI configured' };

  // Bootstrap defaults
  const Settings = global.__memModels.Settings;
  const User = global.__memModels.User;

  await Settings.create({
    settings_id: 'global', base_price: 1000000,
    default_commission_pct: 20, default_discount_pct: 10,
    openai_api_key: '', updated_at: nowISO(),
  });
  await User.create({
    id: uuidv4(), phone: '09120000000',
    name: 'مدیر سیستم', role: 'admin', created_at: nowISO(),
  });
  console.log('✓ Memory mode bootstrap complete');
}

// ─── Start ─────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || '';

function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Rotbe Bartar API on port ${PORT}`);
    if (dbStatus.mode === 'memory') {
      console.log('  ⚠️  حالت حافظه موقت — داده‌ها پس از ریستارت پاک می‌شوند');
      console.log('  ℹ️  برای داده دائمی، MONGO_URI را در Secrets تنظیم کنید');
    } else {
      console.log('  ✓  MongoDB connected');
    }
    console.log('');
  });
}

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(async () => {
      dbStatus = { connected: true, mode: 'mongodb', error: null };
      await bootstrap();
      startServer();
    })
    .catch(async (err) => {
      console.error('✗ MongoDB failed:', err.message);
      console.log('→ Falling back to in-memory mode...');
      await setupMemoryMode();
      startServer();
    });
} else {
  setupMemoryMode().then(startServer);
}
