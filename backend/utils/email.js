const nodemailer = require('nodemailer');
const Order = require('../models/order');
const Book = require('../models/book');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate HTML template for order confirmation
const generateOrderConfirmationHTML = (order, user) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2d3748;">Thank you for your order, ${user.name}!</h1>
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4a5568;">Order #${order._id}</h2>
        <p><strong>Status:</strong> ${order.status.replace('_', ' ')}</p>
        <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      </div>
      
      <h3 style="margin-top: 24px;">Your Books:</h3>
      <ul style="list-style: none; padding: 0;">
        ${order.books.map(item => `
          <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong>${item.book.title}</strong> (Qty: ${item.quantity}) - $${item.priceAtPurchase.toFixed(2)}
          </li>
        `).join('')}
      </ul>
      
      <div style="margin-top: 24px;">
        <h3>Shipping Address:</h3>
        <p>${order.shippingAddress}</p>
      </div>
      
      <p style="margin-top: 24px;">
        You can check your order status anytime in your <a href="${process.env.FRONTEND_URL}/account/orders">account dashboard</a>.
      </p>
    </div>
  `;
};

// Generate HTML template for seller notification
const generateSellerNotificationHTML = (order, books) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2d3748;">New Order Received!</h1>
      <p>Order #${order._id} contains your books:</p>
      
      <ul style="list-style: none; padding: 0;">
        ${books.map(book => `
          <li style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong>${book.title}</strong> (Qty: ${book.quantity}) - $${book.priceAtPurchase.toFixed(2)}
          </li>
        `).join('')}
      </ul>
      
      <div style="margin-top: 24px;">
        <h3>Shipping Address:</h3>
        <p>${order.shippingAddress}</p>
      </div>
      
      <p style="margin-top: 24px;">
        Please prepare the items for shipping within 24 hours.
        <a href="${process.env.FRONTEND_URL}/seller/orders">View order details</a>.
      </p>
    </div>
  `;
};

// Generate HTML template for status updates
const generateStatusUpdateHTML = (order, oldStatus, newStatus) => {
  const statusMap = {
    processing: "is being prepared",
    shipped: "has been shipped",
    delivered: "has been delivered",
    cancelled: "was cancelled"
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2d3748;">Order Update</h1>
      <p>Your order #${order._id} ${statusMap[newStatus]}.</p>
      
      ${newStatus === 'shipped' ? `
      <div style="background: #ebf8ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3>Tracking Information</h3>
        <p>Carrier: Standard Shipping</p>
        <p>Expected Delivery: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
      ` : ''}
      
      <a href="${process.env.FRONTEND_URL}/account/orders/${order._id}" 
         style="display: inline-block; background: #4299e1; color: white; 
                padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
        View Order Details
      </a>
    </div>
  `;
};

exports.sendOrderConfirmation = async (order, user) => {
  try {
    // Populate book details if not already populated
    if (typeof order.books[0].book === 'string') {
      order = await Order.findById(order._id).populate('books.book');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation #${order._id}`,
      html: generateOrderConfirmationHTML(order, user)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    throw new Error('Failed to send confirmation email');
  }
};

exports.sendSellerNotification = async (order, seller) => {
  try {
    // Get only books belonging to this seller
    const sellerBooks = order.books.filter(item => 
      item.book.seller && item.book.seller.toString() === seller._id.toString()
    );

    if (sellerBooks.length === 0) return;

    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: `New Order #${order._id} - Action Required`,
      html: generateSellerNotificationHTML(order, sellerBooks)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send seller notification:', error);
    throw new Error('Failed to send seller notification');
  }
};

exports.sendStatusUpdateEmail = async (order, oldStatus) => {
  try {
    if (!order.user) {
      order = await Order.findById(order._id).populate('user');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to: order.user.email,
      subject: `Order #${order._id} Status Update`,
      html: generateStatusUpdateHTML(order, oldStatus, order.status)
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send status update:', error);
    throw new Error('Failed to send status update email');
  }
};