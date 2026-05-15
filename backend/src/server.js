const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Security
try { const helmet = require('helmet'); app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false })); } catch {}
try { const compression = require('compression'); app.use(compression()); } catch {}

// Rate Limiting
try {
  const rateLimit = require('express-rate-limit');
  app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { message: 'طلبات كثيرة، حاول بعد قليل' } }));
  app.use('/api/merchant/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
  app.use('/api/merchant/register', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
} catch {}

// CORS
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin.includes('localhost') || origin.includes('192.168.')) return cb(null, true);
    if (origin.includes('dayem.shop')) return cb(null, true);
    cb(null, true);
  },
  credentials: true,
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// Routes
app.use('/api/merchant',  require('./routes/merchant'));
app.use('/api/store',     require('./routes/store'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/upload',    require('./routes/upload'));
app.use('/api/payment',   require('./routes/payment'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/coupons',   require('./routes/coupons'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/customer',  require('./routes/customer'));

// Health
app.get('/', (req, res) => res.json({ message: 'DAYEM API ✅', version: '2.0' }));

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌', err.message);
  if (err.code === 11000) return res.status(400).json({ message: 'هذا البريد أو الرابط مسجل مسبقاً' });
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'حدث خطأ' : err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 DAYEM running on port ${PORT}`));