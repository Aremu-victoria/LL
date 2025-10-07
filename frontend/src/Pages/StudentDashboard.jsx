

  // Initialize selected class from the student's saved classLevel (from signup)
  useEffect(() => {
    if (user && typeof user === 'object' && user.type === 'student' && user.classLevel) {
      try {
        const lvl = String(user.classLevel).toUpperCase();
        setSelectedClass(lvl);
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


//               onC


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

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`https://ll-3.onrender.com/api/discussions?classLevel=${selectedClass}`);
        const data = await res.json();
        setDiscussions(data.reverse());
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
          name: user.name,
          avatar: 'https://via.placeholder.com/32x32/ec4899/ffffff?text=SJ',
          topic: 'General Discussion',
          question: newDiscussion,
          classLevel: selectedClass
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
            {materials.length === 0 ? (
              <p>No materials for your class yet.</p>
            ) : (
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
          <div className="discussions-list">
            {discussions.length === 0 ? (
              <p>No discussions yet.</p>
            ) : (
              discussions.map((discussion) => (
                <div key={discussion.id} className="discussion-item">
                  <img src={discussion.avatar} alt={discussion.name} className="discussion-avatar" />
                  <div className="discussion-content">
                    <div className="discussion-header">
                      <h5>{discussion.name}</h5>
                      <span className="discussion-topic">{discussion.topic}</span>
                    </div>
                    <p className="discussion-text">{discussion.question || discussion.comment}</p>
                  </div>
                </div>
              ))
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
        <div className="discussion-form">
          <textarea placeholder="Start a new discussion..." rows="4"></textarea>
          <button className="submit-btn">Post Discussion</button>
        </div>
        <div className="discussions-list">
          {discussions.length === 0 ? <p>No discussions yet.</p> : discussions.map((discussion) => (
            <div key={discussion.id} className="discussion-post">
              <img src={discussion.avatar} alt={discussion.name} className="discussion-avatar" />
              <div className="discussion-content">
                <div className="discussion-header">
                  <h5>{discussion.name}</h5>
                </div>
                <p className="discussion-text">{discussion.question || discussion.comment}</p>
              </div>
            </div>
          ))}
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'materials': return renderMyMaterials();
      case 'downloads': return renderDownloads();
      case 'discussions': return renderDiscussions();
      case 'schedule': return renderSchedule();
      case 'progress': return renderProgress();
      default: return renderDashboard();
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

