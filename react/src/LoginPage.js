import React, { useState } from 'react';
import './LoginPageStyle.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/users.json');
      const users = await response.json();
      const user = users.find(
        (user) => user.email === email && user.password === password
      );
      if (user) {
        setLoggedIn(true);
        setEmail('');
        setPassword('');
        toast.success('Login successful!');
      } else {
        toast.error('Email or password is incorrect');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      toast.error('An error occurred while trying to log in');
    }
  };

  if (loggedIn) {
    return <h2>Welcome to the Home Page!</h2>;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className='loginLbl'>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">Login</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
