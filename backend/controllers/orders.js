const Order = require('../models/order');
const Book = require('../models/book');
const User = require('../models/user');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { sendOrderConfirmation, sendSellerNotification, sendStatusUpdateEmail } = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { books, shippingAddress, paymentMethod } = req.body;

  // 1. Validate input
  if (!books || books.length === 0) {
    return next(new ErrorResponse('Please add at least one book', 400));
  }
  
  if (!shippingAddress || !paymentMethod) {
    return next(new ErrorResponse('Please provide shipping address and payment method', 400));
  }

  // 2. Calculate total and verify book availability
  let total = 0;
  const orderBooks = [];
  const sellerIds = new Set(); // Track unique sellers for notifications

  for (const item of books) {
    const book = await Book.findById(item.book).populate('seller');
    if (!book) {
      return next(new ErrorResponse(`Book not found with ID ${item.book}`, 404));
    }

    if (book.quantity < item.quantity) {
      return next(new ErrorResponse(`Insufficient quantity for ${book.title}`, 400));
    }

    total += book.price * item.quantity;
    orderBooks.push({
      book: item.book,
      quantity: item.quantity,
      priceAtPurchase: book.price
    });

    // Track sellers for notifications
    if (book.seller) sellerIds.add(book.seller._id.toString());

    // Reduce book quantity
    book.quantity -= item.quantity;
    await book.save();
  }

  // 3. Create order
  const order = await Order.create({
    user: req.user.id,
    books: orderBooks,
    total,
    shippingAddress,
    paymentMethod,
    status: paymentMethod === 'cash_on_delivery' ? 'processing' : 'pending_payment'
  });

  // 4. Send notifications
  try {
    // Send confirmation to buyer
    await sendOrderConfirmation(order, req.user);

    // Send notifications to all sellers
    const sellers = await User.find({ _id: { $in: [...sellerIds] }});
    await Promise.all(
      sellers.map(seller => sendSellerNotification(order, seller))
    );
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Don't fail the order if emails fail
  }

  res.status(201).json({ 
    success: true, 
    data: order,
    requiresPayment: paymentMethod !== 'cash_on_delivery'
  });
});

// @desc    Get all orders (Admin/Seller)
// @route   GET /api/orders
// @access  Private (Admin/Seller)
exports.getOrders = asyncHandler(async (req, res, next) => {
  let query;
  const { status, startDate, endDate } = req.query;

  // Build base query
  if (req.user.role === 'admin') {
    query = Order.find();
  } else {
    query = Order.find({ 'books.book': { $in: await getSellerBooks(req.user.id) } });
  }

  // Apply filters
  if (status) {
    query = query.where('status').equals(status);
  }
  if (startDate && endDate) {
    query = query.where('createdAt').gte(new Date(startDate)).lte(new Date(endDate));
  }

  // Execute query
  const orders = await query
    .populate('user', 'name email')
    .populate('books.book', 'title author')
    .sort('-createdAt');

  res.status(200).json({ 
    success: true, 
    count: orders.length, 
    data: orders 
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Admin/Seller)
exports.updateOrder = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Invalid status: ${status}`, 400));
  }

  let order = await Order.findById(req.params.id)
    .populate('user', 'email name');
  
  if (!order) {
    return next(new ErrorResponse(`Order not found with ID ${req.params.id}`, 404));
  }

  // Validate status transition
  if (status === 'cancelled' && ['shipped', 'delivered'].includes(order.status)) {
    return next(new ErrorResponse(`Cannot cancel order in ${order.status} status`, 400));
  }

  // Seller can only update their own book orders
  if (req.user.role === 'seller') {
    const sellerBooks = await getSellerBooks(req.user.id);
    const hasSellerBooks = order.books.some(item => 
      sellerBooks.includes(item.book.toString())
    );
    
    if (!hasSellerBooks) {
      return next(new ErrorResponse('Not authorized to update this order', 401));
    }
  }

  // Save old status for email notification
  const oldStatus = order.status;
  order.status = status;

  // If cancelling, restore book quantities
  if (status === 'cancelled') {
    await Promise.all(
      order.books.map(async item => {
        await Book.findByIdAndUpdate(item.book, {
          $inc: { quantity: item.quantity }
        });
      })
    );
  }

  await order.save();

  // Send status update email if status changed
  if (oldStatus !== status) {
    try {
      await sendStatusUpdateEmail(order, oldStatus);
    } catch (emailError) {
      console.error('Status email failed:', emailError);
    }
  }

  res.status(200).json({ 
    success: true, 
    data: order 
  });
});

// Helper: Get all book IDs listed by a seller
const getSellerBooks = async (sellerId) => {
  const books = await Book.find({ seller: sellerId });
  return books.map(book => book._id);
};