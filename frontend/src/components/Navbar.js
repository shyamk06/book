import React from 'react';
import { NavLink } from 'react-router-dom';
import './App.css';

const Navbar = () => {
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-title">BookStore</div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/books" className={({ isActive }) => isActive ? 'active' : ''}>Books</NavLink>
        <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'active' : ''}>Wishlist</NavLink>
        <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>My Orders</NavLink>
        {username ? (
          <>
            <span>Welcome, {username}!</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Login</NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
