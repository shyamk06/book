import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setMessage('Registration successful!');
      window.location.href = '/';
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || 'Registration failed'}`);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" name="username" placeholder="Username"
          value={formData.username} onChange={handleChange} required
        /><br/>
        <input 
          type="password" name="password" placeholder="Password"
          value={formData.password} onChange={handleChange} required
        /><br/>
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Register;
