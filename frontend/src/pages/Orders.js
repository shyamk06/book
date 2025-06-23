import React from 'react';
import './App.css';

const Orders = () => {
  // Replace with real data
  const orders = [
    {
      id: '1',
      productName: 'Think and Grow Rich',
      orderId: '6580449015',
      address: '123 Street, City',
      seller: 'syed',
      bookingDate: '25/03/2024',
      deliveryBy: '01/04/2024',
      price: 199,
      status: 'delivered'
    }
  ];

  return (
    <div>
      <h2>My Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Order ID</th>
            <th>Address</th>
            <th>Seller</th>
            <th>Booking Date</th>
            <th>Delivery By</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.productName}</td>
              <td>{order.orderId}</td>
              <td>{order.address}</td>
              <td>{order.seller}</td>
              <td>{order.bookingDate}</td>
              <td>{order.deliveryBy}</td>
              <td>${order.price}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
