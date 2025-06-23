import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const Books = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get('/api/books')  // Update with your actual API
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Books List</h2>
      <div className="card-container">
        {books.map(book => (
          <div className="book-card" key={book._id}>
            <img src={book.image} alt={book.title} />
            <h5>{book.title}</h5>
            <p>Author: {book.author}</p>
            <p>Genre: {book.genre}</p>
            <p className="price">Price: ${book.price}</p>
            <button className="button-primary">Add to Wishlist</button>
            <button className="button-primary">View</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;
