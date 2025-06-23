const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes here will require:
// 1. Valid JWT token
// 2. Admin role
// 3. Whitelisted IP
router.get('/dashboard', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, data: 'Admin dashboard' });
});

// Add other admin-only endpoints
router.get('/users', protect, authorize('admin'), /* ... */);
router.delete('/books/:id', protect, authorize('admin'), /* ... */);

module.exports = router;