const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    immutable: true // Prevent accidental changes
  },
  books: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Minimum quantity is 1'],
      default: 1
    },
    priceAtPurchase: { // Snapshot of price when ordered
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required']
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash_on_delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true }, // Include virtuals when converted to JSON
  toObject: { virtuals: true }
});

// Virtual for order duration (in days)
orderSchema.virtual('orderDuration').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes for performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // Sort by newest first

// Pre-save hook to validate book references
orderSchema.pre('save', async function(next) {
  if (this.books.length === 0) {
    throw new Error('Order must contain at least one book');
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);