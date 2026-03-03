const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./config/db.config');

const app = express();
const PORT = process.env.PORT || 3000;

function requireAdminPage(req, res, next) {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  return res.redirect('/pages/login.html');
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'wastesense-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Server-side protection for admin pages (prevents direct navigation by non-admins)
app.get([
  '/pages/dashboard-admin.html',
  /^\/pages\/admin-.*\.html$/
], requireAdminPage, (req, res) => {
  const reqPath = typeof req.route.path === 'string' ? req.route.path : req.path;
  const safePath = reqPath.startsWith('/pages/') ? reqPath : '/pages/login.html';
  const relativeToFrontend = safePath.replace(/^\/+/, '');
  res.sendFile(path.join(__dirname, '../frontend', relativeToFrontend));
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const locationRoutes = require('./routes/locationRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Root route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/pages/login.html');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WasteSense API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as test');
    res.json({ 
      status: 'ok', 
      message: 'Database connection successful',
      data: rows
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WasteSense server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
