const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  bookUpload
} = require('../controllers/books');

// Public routes
router.route('/')
  .get(getBooks)
  
router.route('/:id')
  .get(getBook)

// Protected routes (Seller+Admin)  
router.use(protect, authorize('seller', 'admin'));

router.route('/')
  .post(createBook)
  
router.route('/:id')
  .put(updateBook)
  .delete(deleteBook)

// Image upload  
router.route('/:id/photo')
  .put(bookUpload);

module.exports = router;