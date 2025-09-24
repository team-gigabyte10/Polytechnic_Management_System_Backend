const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection
testConnection();

// Security middleware
app.use(helmet());

// Rate limiting configuration
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    // Skip rate limiting for trusted IPs and development
    skip: (req) => {
      const trustedIPs = ['127.0.0.1', '::1', 'localhost'];
      const clientIP = req.ip || req.connection.remoteAddress;
      
      // Skip for trusted IPs
      if (trustedIPs.includes(clientIP)) {
        return true;
      }
      
      // Skip for development environment with more lenient settings
      if (process.env.NODE_ENV === 'development') {
        return false; // Still apply rate limiting but with higher limits
      }
      
      return false;
    },
    // Custom key generator to handle different user types
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
        limit: max,
        remaining: 0,
        resetTime: new Date(Date.now() + windowMs).toISOString()
      });
    }
  });
};

// General API rate limiting (more lenient)
const generalLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 2000 : 500),
  'Too many requests from this IP, please try again later.'
);

// Stricter rate limiting for authentication endpoints
const authLimiter = createRateLimit(
  parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 100 : 20),
  'Too many authentication attempts from this IP, please try again later.',
  true // Skip successful requests
);

// Rate limiting for file uploads
const uploadLimiter = createRateLimit(
  parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
  parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 50 : 10),
  'Too many file upload attempts from this IP, please try again later.'
);

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging and rate limit monitoring
app.use((req, res, next) => {
  // Log requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()} - IP: ${req.ip}`);
  }
  
  // Add rate limit info to response headers
  res.set('X-RateLimit-Policy', 'sliding-window');
  
  next();
});

// Rate limit status endpoint
app.get('/api/rate-limit-status', (req, res) => {
  res.json({
    success: true,
    message: 'Rate limit status',
    limits: {
      general: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 2000 : 500)
      },
      auth: {
        windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 100 : 20)
      },
      upload: {
        windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
        max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 50 : 10)
      }
    },
    environment: process.env.NODE_ENV || 'development',
    trustedIPs: ['127.0.0.1', '::1', 'localhost']
  });
});

// Static file serving with upload rate limiting
app.use('/uploads', uploadLimiter, express.static('uploads'));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Polytechnic Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      teachers: '/api/teachers',
      guestTeachers: '/api/guest-teachers',
      attendance: '/api/attendance',
      salaries: '/api/salaries',
      marks: '/api/marks',
      payments: '/api/payments',
      expenses: '/api/expenses',
      announcements: '/api/announcements',
      dashboard: '/api/dashboard'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Polytechnic Management System API Server
  📡 Server running on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  📊 Health check: http://localhost:${PORT}/api/health
  📚 API Documentation: http://localhost:${PORT}/api
  `);
});

module.exports = app;