const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Security Headers ──────────────────────────────────────
try {
  const helmet = require('helmet');
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accept.paymob.com"],
        frameSrc: ["https://accept.paymob.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https:"],
        connectSrc: ["'self'", "https://api.bigdatacloud.net", "https://nominatim.openstreetmap.org", "https://ipapi.co"],
      }
    }
  }));
} catch (e) { console.warn('helmet not installed') }

// ── Compression ───────────────────────────────────────────
try { const compression = require('compression'); app.use(compression()); } catch {}

// ── Rate Limiting ─────────────────────────────────────────
try {
  const rateLimit = require('express-rate-limit');

  // Global
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'طلبات كثيرة، حاول بعد قليل' }
  }));

  // Auth endpoints — stricter
  app.use('/api/merchant/login',    rateLimit({ windowMs: 15*60*1000, max: 10 }));
  app.use('/api/merchant/register', rateLimit({ windowMs: 60*60*1000, max: 5 }));
  app.use('/api/customer/login',    rateLimit({ windowMs: 15*60*1000, max: 10 }));

  // AI endpoint — expensive
  app.use('/api/ai/', rateLimit({ windowMs: 60*60*1000, max: 30, message: { message: 'تجاوزت حد الذكاء الاصطناعي' } }));

  // Upload endpoint
  app.use('/api/upload/', rateLimit({ windowMs: 60*60*1000, max: 50 }));

} catch (e) { console.warn('express-rate-limit not installed') }

// ── CORS ──────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dayem.shop',
  'https://www.dayem.shop',
  'https://api.dayem.shop',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) and allowed origins
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Allow any localhost in development
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ──────────────────────────────────────────
// Paymob webhook needs raw body for HMAC verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Database ──────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// Reconnect on drop
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected — reconnecting...')
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/merchant',  require('./routes/merchant'));
app.use('/api/store',     require('./routes/store'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/upload',    require('./routes/upload'));
app.use('/api/payment',   require('./routes/payment'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/coupons',   require('./routes/coupons'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/customer',  require('./routes/customer'));

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV,
}));
app.get('/', (req, res) => res.json({ message: 'DAYEM API ✅', version: '2.0' }));

// ── 404 ───────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ message: 'المسار غير موجود' }));

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  // Don't leak CORS errors in production
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ message: 'غير مسموح' });
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages[0] });
  }
  // Duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ message: 'هذا البريد أو الرابط مسجل مسبقاً' });
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }

  console.error('❌ Server Error:', err.message);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'حدث خطأ في السيرفر' : err.message
  });
});

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 DAYEM running on port ${PORT} [${process.env.NODE_ENV}]`));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  mongoose.connection.close(() => process.exit(0));
});
