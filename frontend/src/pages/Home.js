import React from 'react';
import './App.css';

const Home = () => {
  const bestSellers = [
    {
      id: 1,
      title: 'Rich Dad Poor Dad',
      image: 'https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg'
    },
    {
      id: 2,
      title: 'Think and Grow Rich',
      image: 'https://m.media-amazon.com/images/I/71UypkUjStL.jpg'
    },
    {
      id: 3,
      title: 'Don\'t Let Her Stay',
      image: 'https://m.media-amazon.com/images/I/81z1C1rjOEL.jpg'
    },
    {
      id: 4,
      title: 'Killing the Witches',
      image: 'https://m.media-amazon.com/images/I/81MZc7ZHVLL.jpg'
    }
  ];

  return (
    <div>
      <h2>Best Seller</h2>
      <div className="card-container">
        {bestSellers.map(book => (
          <div className="book-card" key={book.id}>
            <img src={book.image} alt={book.title} />
            <h5>{book.title}</h5>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
