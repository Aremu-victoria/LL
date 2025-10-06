import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      const res = await axios.post(`https://ll-2.onrender.com/api/reset-password/${token}`, { password });
      setMessage(res.data.message || 'Password updated');
      setTimeout(() => navigate('/staff-login'), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 shadow rounded" style={{ width: '380px' }}>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <h4 className="mb-3">Set New Password</h4>
        <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label" htmlFor="password">New Password</label>
            <input id="password" type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password"/>
          </div>
          <div>
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input id="confirm" type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password"/>
          </div>
          <button className="btn btn" style={{backgroundColor: '#1A2A80', color: 'white'}}>Update password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


