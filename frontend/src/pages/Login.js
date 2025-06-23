import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setMessage('Login successful!');
      window.location.href = '/'; // redirect to home or dashboard
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || 'Login failed'}`);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" name="username" placeholder="Username"
          value={formData.username} onChange={handleChange} required
        /><br/>
        <input 
          type="password" name="password" placeholder="Password"
          value={formData.password} onChange={handleChange} required
        /><br/>
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;
