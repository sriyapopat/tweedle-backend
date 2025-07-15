const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Tweedle API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Tweedle API!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (register, login)',
      tweets: '/api/tweets (CRUD operations)',
      users: '/api/users (profiles, follow/unfollow)',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tweedle API server is running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation:`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   Tweets: http://localhost:${PORT}/api/tweets`);
  console.log(`   Users: http://localhost:${PORT}/api/users`);
});

module.exports = app;