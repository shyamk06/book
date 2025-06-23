require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { ipWhitelist } = require('./middleware/ipWhitelist'); // Added IP whitelist middleware

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// =====================
// SECURITY MIDDLEWARE
// =====================

// 1. Rate limiting (API requests)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      fontSrc: ["'self'", 'fonts.gstatic.com']
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 4. Body parsing and cookie middleware
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// =====================
// ROUTE MIDDLEWARE
// =====================

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Stripe webhook needs RAW body (exclude from JSON parsing)
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/payment').webhook
);

// Admin routes with IP whitelisting
app.use('/api/admin', ipWhitelist, require('./routes/admin')); // Protected admin routes

// Regular API routes
app.use('/api', require('./routes'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// ERROR HANDLING
// =====================
app.use(errorHandler);

// =====================
// SERVER INITIALIZATION
// =====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.cyan.bold);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});