const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'], // Enhanced validation message
    trim: true, // Removes whitespace
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Year must be >= 1000'], // Validate reasonable year
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  genre: {
    type: String,
    enum: { // Restrict to specific genres
      values: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Mystery', 'Other'],
      message: '{VALUE} is not a supported genre'
    },
    default: 'Other'
  },
  price: { // Added missing field (common for book apps)
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  seller: { // Reference to user who added the book
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { // Auto-timestamp
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
bookSchema.index({ title: 'text', author: 'text' }); // Full-text search
bookSchema.index({ genre: 1 }); // Faster filtering by genre

module.exports = mongoose.model('Book', bookSchema);