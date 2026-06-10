const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// ── Security: HTTP headers ────────────────────────────────────────────────────
app.use(helmet());

// ── Security: CORS ────────────────────────────────────────────────────────────
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '6mb' })); // allow base64 images up to ~5 MB

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Stricter limiter for auth routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' }
});

app.use('/api/', apiLimiter);

// ── Routes Registration ───────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'School Facility Condition Reporting & Repair Tracking API is running.',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ── Port ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Enforce strong JWT secret in production
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required in production.');
    }

    await db.connect();
    app.listen(PORT, () => {
      console.log(`[${process.env.NODE_ENV || 'development'}] Server is running on port ${PORT}`);
      console.log(`CORS allowed origin: ${allowedOrigin}`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();
