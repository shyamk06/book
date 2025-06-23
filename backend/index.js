require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// 🌟 Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🌟 Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const orderRoutes = require('./routes/orders');

// 🌟 Import middleware
const { protect } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// 🌟 API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', protect, orderRoutes);

// 🌟 Public test route
app.get('/', (req, res) => {
  res.send('📚 BookNest API is working!');
});

// 🌟 Example protected route
app.get('/api/protected', protect, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, you have accessed a protected route!` });
});

// 🌟 404 fallback route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 🌟 Error handling middleware
app.use(errorHandler);

// 🌟 Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit if DB fails
});
