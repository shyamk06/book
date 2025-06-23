const Book = require('../models/book');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate('seller', 'name email');

  if (!book) {
    return next(new ErrorResponse(`Book not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: book });
});

// @desc    Create book
// @route   POST /api/books
// @access  Private (Seller/Admin)
exports.createBook = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.seller = req.user.id;

  const book = await Book.create(req.body);

  res.status(201).json({ success: true, data: book });
});

// @desc    Upload photo for book
// @route   PUT /api/books/:id/photo
// @access  Private (Seller/Admin)
exports.bookUpload = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorResponse(`Book not found with id ${req.params.id}`, 404));
  }

  // Check ownership
  if (book.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this book`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Check file type
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Create custom filename
  file.name = `photo_${book._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Book.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});