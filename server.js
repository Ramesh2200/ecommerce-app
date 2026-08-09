const express = require('express');
const cors = require('cors');
const path = require('path');
const getDb = require('./database/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AuraCraft E-Commerce API', timestamp: new Date() });
});

// Fallback to index.html for SPA/frontend navigation
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
});

// Initialize DB
getDb().then(() => {
  console.log('Database connected successfully.');
}).catch(err => {
  console.error('Database connection warning:', err);
});

// If running directly (not in Vercel Serverless environment), start listening
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 AuraCraft E-Commerce Server running on port ${PORT}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
