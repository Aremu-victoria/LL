import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import './Dashboard.css';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('invite_staff');
  const [notificationCount] = useState(0);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (!token || role !== 'superadmin') {
      navigate('/Signin');
    }
  }, [navigate]);

  const onInvite = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/superadmin/invite-staff', { 
        email, firstName, lastName, type: 'teacher'
      });
      setMessage(res.data.message || 'Invitation sent');
      setEmail('');
      setFirstName('');
      setLastName('');
  
      fetchStaff();
    } catch (err) {
      console.error('Frontend error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to invite user';
      setError(errorMessage);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/students');
      const data = await res.json();
      setStaff(Array.isArray(data) ? data.filter(u => u.type === 'teacher') : []);
    } catch (e) {
      setStaff([]);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const u = JSON.parse(raw);
        return {
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          role: 'Super Admin',
          type: 'superadmin'
        };
      }
    } catch {}
    return { name: 'Super Admin', role: 'Super Admin', type: 'superadmin' };
  })();

  const renderInvite = () => (
    <div className="page-content">
      <h2>Add Staff</h2>
      <div className="materials-list">
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={onInvite} className="d-flex flex-column gap-3" style={{maxWidth: 520}}>
          <div className="row">
            <div className="col">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input id="firstName" className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Optional" />
            </div>
            <div className="col">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input id="lastName" className="form-control" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" required />
          </div>
          <div>
            <label className="form-label">User Type</label>
            <input type="text" className="form-control" value="Teacher" disabled style={{backgroundColor: '#f8f9fa', color: '#6c757d'}} />
            <small className="text-muted">Only teachers can be created through this system</small>
          </div>
          <button className="btn" style={{backgroundColor: '#1A2A80', color: 'white'}}>Create Teacher Account</button>
        </form>
      </div>
    </div>
  );

  const renderStaffList = () => (
    <div className="page-content">
      <h2>All Staff</h2>
      <div className="students-list">
        {staff.length === 0 && <p>No staff yet.</p>}
        {staff.map(s => (
          <div key={s._id} className="student-card">
            <div className="student-info">
              <h4>{s.firstName || 'Teacher'} {s.lastName || ''}</h4>
              <p>{s.email}</p>
              <span className="last-activity">{s.isActive ? 'Active' : 'Archived'}</span>
            </div>
            <div className="student-actions">
              <button className="delete-btn" onClick={async () => {
                if (!window.confirm('Delete this staff account?')) return;
                await fetch(`http://localhost:5000/api/staff/${s._id}`, { method: 'DELETE' });
                fetchStaff();
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'invite_staff':
        return renderInvite();
      case 'staff_list':
        return renderStaffList();
      default:
        return renderInvite();
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar userType="superadmin" activeTab={activeTab} onTabChange={setActiveTab} user={currentUser} />
      <div className="main-content">
        <Header userType="teacher" userName={currentUser.name} notificationCount={notificationCount} />
        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;


