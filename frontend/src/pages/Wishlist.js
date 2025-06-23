import React from 'react';
import './App.css';

const Wishlist = () => {
  // Replace with real data
  const wishlist = [
    {
      id: 1,
      title: 'The Mosquito',
      author: 'Timothy C. Winegard',
      genre: 'Nonfiction',
      price: 130,
      image: 'https://via.placeholder.com/150'
    }
  ];

  return (
    <div>
      <h2>Wishlist</h2>
      <div className="card-container">
        {wishlist.map(item => (
          <div className="book-card" key={item.id}>
            <img src={item.image} alt={item.title} />
            <h5>{item.title}</h5>
            <p>Author: {item.author}</p>
            <p>Genre: {item.genre}</p>
            <p className="price">Price: ${item.price}</p>
            <button className="button-danger">Remove from Wishlist</button>
            <button className="button-primary">View</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
