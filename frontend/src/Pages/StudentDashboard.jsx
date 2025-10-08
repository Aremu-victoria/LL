import React, { useState, useEffect } from 'react';
import MaterialCard from '../Components/MaterialCard';
import Modal from '../Components/Modal';

// Simple ErrorBoundary for StudentDashboard
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log errorInfo to an error reporting service here
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: 32}}><h2>Something went wrong in Student Dashboard.</h2><pre>{this.state.error && this.state.error.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import StatsCard from '../Components/StatsCard';
import './Dashboard.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notificationCount] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [downloadedMaterials, setDownloadedMaterials] = useState(() => {
    try {
      const stored = localStorage.getItem('downloadedMaterials');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [selectedClass, setSelectedClass] = useState('SS1');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });

  // Modal state
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', actions: [] });
  const openModal = (payload) => setModal({ isOpen: true, title: '', message: '', type: 'info', actions: [], ...payload });
  const closeModal = () => setModal(m => ({ ...m, isOpen: false }));

  // Get user data from localStorage (set during login)
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return {
          name: parsedUser.name || `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim(),
          id: parsedUser.uniqueId || parsedUser._id,
          dbId: parsedUser._id,
          email: parsedUser.email,
          role: parsedUser.type === 'student' ? 'Student' : parsedUser.type,
          type: parsedUser.type || 'student',
          firstName: parsedUser.firstName,
          lastName: parsedUser.lastName,
          classLevel: parsedUser.classLevel
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return { name: 'Student User', id: 'UNKNOWN', role: 'Student', type: 'student' };
  };

  const user = getUserData();

  // Initialize profile form
  useEffect(() => {
    setProfileForm(prev => ({
      ...prev,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: '',
      password: '',
      confirmPassword: ''
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(`https://ll-3.onrender.com/api/materials?classLevel=${selectedClass}`);
        const data = await res.json();
        setMaterials(data);
      } catch (err) {
        setMaterials([]);
      }
    };
    fetchMaterials();
  }, [selectedClass]);

  useEffect(() => {
    if (user && typeof user === 'object' && user.type === 'student' && user.classLevel) {
      try {
        const lvl = String(user.classLevel).toUpperCase();
        setSelectedClass(lvl);
      } catch {}
    }
  }, []);
  // Download or view material
  const handleDownloadMaterial = (material, mode = "inline") => {
    if (!downloadedMaterials.find(m => m._id === material._id)) {
      const updated = [...downloadedMaterials, { ...material, downloadDate: new Date().toLocaleDateString() }];
      setDownloadedMaterials(updated);
      try {
        localStorage.setItem('downloadedMaterials', JSON.stringify(updated));
      } catch {}
    }

    if (material.publicId) {
      const userId = encodeURIComponent(user.id || '');
      const userName = encodeURIComponent(user.name || 'Student');
      const url = `https://ll-3.onrender.com/api/materials/download/${material.publicId}?mode=${mode}&name=${encodeURIComponent(material.title)}&userId=${userId}&userName=${userName}`;
      window.open(url, "_blank");
    } else if (material.fileUrl) {
      window.open(material.fileUrl, "_blank");
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('downloadedMaterials', JSON.stringify(downloadedMaterials));
    } catch {}
  }, [downloadedMaterials]);

  const handleRemoveDownload = (materialId) => {
    setDownloadedMaterials(prev => prev.filter(m => m._id !== materialId));
  };

  const handleShareMaterial = (material) => {
    if (material.fileUrl) {
      navigator.clipboard.writeText(material.fileUrl)
        .then(() => openModal({ type: 'success', title: 'Link Copied', message: 'Material link copied to clipboard!' }))
        .catch(() => openModal({ type: 'error', title: 'Copy Failed', message: 'Failed to copy link.' }));
    } else {
      openModal({ type: 'info', title: 'No Link', message: 'No file link available for this material.' });
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user.dbId) {
      openModal({ type: 'error', title: 'Error', message: 'User id not found.' });
      return;
    }
    if ((profileForm.password || profileForm.confirmPassword) && profileForm.password !== profileForm.confirmPassword) {
      openModal({ type: 'error', title: 'Password Mismatch', message: 'Passwords do not match.' });
      return;
    }
    const payload = {
      firstName: profileForm.firstName?.trim(),
      lastName: profileForm.lastName?.trim(),
      email: profileForm.email?.trim(),
      phone: profileForm.phone?.trim() || undefined,
      ...(profileForm.password ? { password: profileForm.password } : {})
    };
    setProfileSaving(true);
    try {
      const res = await fetch(`https://ll-3.onrender.com/api/students/${user.dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      try {
        const raw = localStorage.getItem('userData');
        if (raw) {
          const data = JSON.parse(raw);
          data.firstName = updated.firstName || data.firstName;
          data.lastName = updated.lastName || data.lastName;
          data.email = updated.email || data.email;
          localStorage.setItem('userData', JSON.stringify(data));
        }
      } catch {}
      openModal({ type: 'success', title: 'Updated', message: 'Profile updated successfully.' });
      setProfileForm(p => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      openModal({ type: 'error', title: 'Update Failed', message: String(err.message || err) });
    } finally {
      setProfileSaving(false);
    }
  };

  const renderProfile = () => (
    <div className="page-content">
      <h2>My Profile</h2>
      <div className="materials-list" style={{ maxWidth: 640 }}>
        <form onSubmit={handleProfileSave} className="profile-form" style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="form-label">First Name</label>
              <input className="form-control" value={profileForm.firstName} onChange={(e)=>setProfileForm(p=>({...p, firstName: e.target.value}))} required />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input className="form-control" value={profileForm.lastName} onChange={(e)=>setProfileForm(p=>({...p, lastName: e.target.value}))} required />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={profileForm.email} onChange={(e)=>setProfileForm(p=>({...p, email: e.target.value}))} required />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-control" value={profileForm.phone} onChange={(e)=>setProfileForm(p=>({...p, phone: e.target.value}))} placeholder="Optional" />
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" value={profileForm.password} onChange={(e)=>setProfileForm(p=>({...p, password: e.target.value}))} placeholder="Leave blank to keep current" />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" value={profileForm.confirmPassword} onChange={(e)=>setProfileForm(p=>({...p, confirmPassword: e.target.value}))} placeholder="Re-enter new password" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn" disabled={profileSaving} style={{ backgroundColor: profileSaving ? '#6b7280' : '#1A2A80', color: '#fff' }}>
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`https://ll-3.onrender.com/api/discussions?classLevel=${selectedClass}`);
        const data = await res.json();
        setDiscussions(Array.isArray(data) ? [...data].reverse() : []);
      } catch (err) {
        setDiscussions([]);
      }
    };
    fetchDiscussions();
  }, [selectedClass]);

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (newDiscussion.trim()) {
      try {
        const discussionPayload = {
          classLevel: selectedClass,
          student: user.dbId,
          question: newDiscussion,
        };
        const res = await fetch('https://ll-3.onrender.com/api/discussions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discussionPayload)
        });
        if (res.ok) {
          const newItem = await res.json();
          setDiscussions(prev => [newItem, ...prev]);
          setNewDiscussion('');
        } else {
          openModal({ type: 'error', title: 'Failed', message: 'Failed to post discussion.' });
        }
      } catch (err) {
        openModal({ type: 'error', title: 'Failed', message: 'Failed to post discussion.' });
      }
    }
  };

  const getFileIcon = (type) => {
    const icons = { pdf: '📄', doc: '📝', xls: '📊', ppt: '📊', default: '📄' };
    return icons[type] || icons.default;
  };

  const getFileColor = (type) => {
    const colors = { pdf: '#ef4444', doc: '#3b82f6', xls: '#10b981', ppt: '#f59e0b', default: '#6b7280' };
    return colors[type] || colors.default;
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <StatsCard title="Downloaded Materials" value={downloadedMaterials.length} change="+3 this week" changeType="increase" icon="⬇️" iconColor="#3b82f6" />
        <StatsCard title="Comments Posted" value={discussions.length} change="Active discussions" changeType="increase" icon="💬" iconColor="#f59e0b" />
        <StatsCard title="Study Progress" value="87%" change="On track" changeType="increase" icon="📊" iconColor="#10b981" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header"><h3>Recent Materials</h3></div>
          <div className="materials-list">
            {materials.length > 0 && (
              materials.slice(0, 3).map((material) => (
                <div key={material._id} className="material-item">
                  <div className="material-icon" style={{ color: getFileColor(material.type) }}>{getFileIcon(material.type)}</div>
                  <div className="material-info">
                    <h4>{material.title}</h4>
                    <p>{material.subject} • {material.size} • Class: {material.classLevel}</p>
                  </div>
                  <div className="material-actions">
                    <button className="action-btn" title="View" onClick={() => handleDownloadMaterial(material, "inline")}>👁️</button>
                    <button className="action-btn" title="Download" onClick={() => handleDownloadMaterial(material, "attachment")}>⬇️</button>
                    <button className="action-btn" title="Share" onClick={() => handleShareMaterial(material)}>🔗</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discussions Section */}
        <div className="dashboard-section">
          <h3>Recent Discussions</h3>
          <div className="discussions-list" style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {discussions.length === 0 ? (
              <p>No discussions yet.</p>
            ) : (
              discussions.map((discussion) => {
                const displayName = discussion?.student && typeof discussion.student === 'object'
                  ? `${discussion.student.firstName || ''} ${discussion.student.lastName || ''}`.trim() || (discussion.student.email || 'User')
                  : (discussion.name || 'User');
                return (
                  <div key={discussion._id || discussion.id} className="discussion-item">
                    <img src={discussion.avatar || 'https://via.placeholder.com/32x32/6366f1/ffffff?text=U'} alt={displayName} className="discussion-avatar" />
                    <div className="discussion-content">
                      <div className="discussion-header">
                        <h5>{displayName}</h5>
                        {discussion.classLevel && (
                          <span className="discussion-topic">{discussion.classLevel}</span>
                        )}
                      </div>
                      <p className="discussion-text">{discussion.question || discussion.comment}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyMaterials = () => (
    <div className="page-content">
      <h2>My Materials</h2>
      <div className="materials-grid">
        {materials.length === 0 ? (
          <p>No materials for your class yet.</p>
        ) : (
          materials.map((material) => (
            <div key={material._id} className="material-item">
              <div className="material-icon" style={{ color: getFileColor(material.type) }}>{getFileIcon(material.type)}</div>
              <div className="material-info">
                <h4>{material.title}</h4>
                <p>{material.subject} • {material.size}</p>
              </div>
              <div className="material-actions">
                <button className="action-btn" title="View" onClick={() => handleDownloadMaterial(material, "inline")}>👁️</button>
                <button className="action-btn" title="Download" onClick={() => handleDownloadMaterial(material, "attachment")}>⬇️</button>
                <button className="action-btn" title="Share" onClick={() => handleShareMaterial(material)}>🔗</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderDownloads = () => (
    <div className="page-content">
      <h2>Downloads</h2>
      <div className="downloads-list">
        {downloadedMaterials.length === 0 ? (
          <p>No downloads yet.</p>
        ) : (
          downloadedMaterials.map((material) => (
            <div key={material._id} className="download-item">
              <div className="material-icon" style={{ color: getFileColor(material.type) }}>{getFileIcon(material.type)}</div>
              <div className="download-info">
                <h4>{material.title}</h4>
                <p>Downloaded: {material.downloadDate}</p>
              </div>
              <div className="download-actions">
                <button onClick={() => handleDownloadMaterial(material, "attachment")}>Re-download</button>
                <button onClick={() => handleRemoveDownload(material._id)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderDiscussions = () => (
    <div className="page-content">
      <h2>Discussions</h2>
      <div className="discussions-page">
        <form className="discussion-form" onSubmit={handlePostDiscussion}>
          <textarea
            placeholder={`Start a new discussion for ${selectedClass}...`}
            rows="4"
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
          />
          <button className="submit-btn" type="submit">Post Discussion</button>
        </form>
        <div className="discussions-list" style={{ marginTop: 12 }}>
          {discussions.length === 0 ? (
            <p>No discussions yet.</p>
          ) : (
            discussions.map((discussion) => {
              const displayName = discussion?.student && typeof discussion.student === 'object'
                ? `${discussion.student.firstName || ''} ${discussion.student.lastName || ''}`.trim() || (discussion.student.email || 'User')
                : (discussion.name || 'User');
              return (
                <div key={discussion._id || discussion.id} className="discussion-post">
                  <img src={discussion.avatar || 'https://via.placeholder.com/32x32/6366f1/ffffff?text=U'} alt={displayName} className="discussion-avatar" />
                  <div className="discussion-content">
                    <div className="discussion-header">
                      <h5>{displayName}</h5>
                      {discussion.classLevel && (
                        <span className="discussion-topic">{discussion.classLevel}</span>
                      )}
                    </div>
                    <p className="discussion-text">{discussion.question || discussion.comment}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="page-content"><h2>Schedule</h2></div>
  );

  const renderProgress = () => (
    <div className="page-content"><h2>Progress</h2></div>
  );

  // Router for student tabs
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'materials':
        return renderMyMaterials();
      case 'downloads':
        return renderDownloads();
      case 'discussions':
        return renderDiscussions();
      case 'profile':
        return renderProfile();
      case 'schedule':
        return renderSchedule();
      case 'progress':
        return renderProgress();
      default:
        return renderDashboard();
    }
  };

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        <Sidebar userType={user.type || 'student'} activeTab={activeTab} onTabChange={setActiveTab} user={user} />
        <div className="main-content">
          <div style={{ padding: '16px 24px', fontWeight: 600, fontSize: 20 }}>
            {user.type === 'staff' ? `Welcome ${user.id},` : `Welcome ${user.name},`}
          </div>
          <Header userType={user.type || 'student'} userName={user.name} notificationCount={notificationCount} />
          {renderContent()}
          <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={closeModal} actions={modal.actions} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StudentDashboard;
