import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post('https://ll-3.onrender.com/api/forgot-password', { email });
      setMessage(res.data.message || 'If your email exists, a reset link was sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow rounded" style={{ width: '380px' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <h4 className="mb-3">Forgot Password</h4>
        <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"/>
          </div>
          <button className="btn btn" style={{backgroundColor: '#1A2A80', color: 'white'}}>Send reset link</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;


