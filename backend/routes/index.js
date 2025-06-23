const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const bookRoutes = require('./books');
const orderRoutes = require('./orders');
const userRoutes = require('./users');

// Mount routers
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

module.exports = router;