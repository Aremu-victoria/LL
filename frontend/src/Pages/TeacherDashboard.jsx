import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import StatsCard from '../Components/StatsCard';
import FileUpload from '../Components/FileUpload';
import Modal from '../Components/Modal';
import './Dashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  // Hard guard: if rendered without valid auth, force logout and redirect
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('userData');
      const role = userRaw ? (JSON.parse(userRaw)?.type) : null;
      const allowed = ['teacher', 'superadmin'];
      if (!token || !role || !allowed.includes(role)) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/staff-login', { replace: true });
        return;
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/staff-login', { replace: true });
    }
  }, [navigate]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTeacherMode, setIsTeacherMode] = useState(true);
  const [notificationCount] = useState(3);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    file: null
  });
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClassLevel, setSelectedClassLevel] = useState('SS1');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedStaffForActivity, setSelectedStaffForActivity] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  // Discussions state
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  

  // Modal state
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', actions: [] });
  const openModal = (payload) => setModal({ isOpen: true, title: '', message: '', type: 'info', actions: [], ...payload });
  const closeModal = () => setModal(m => ({ ...m, isOpen: false }));
  const confirmAction = ({ title = 'Are you sure?', message = 'Please confirm this action.', confirmLabel = 'Confirm', type = 'warning' } = {}) =>
    new Promise((resolve) => {
      openModal({
        title, message, type,
        actions: [
          { label: 'Cancel', onClick: () => { closeModal(); resolve(false); } },
          { label: confirmLabel, variant: 'primary', onClick: () => { closeModal(); resolve(true); } }
        ]
      });
    });

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
          role: parsedUser.type === 'teacher' ? 'Teacher' : parsedUser.type === 'superadmin' ? 'Super Admin' : parsedUser.type,
          type: parsedUser.type || 'teacher',
          firstName: parsedUser.firstName,
          lastName: parsedUser.lastName
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    // Fallback to default values if no user data found
    return {
      name: 'Teacher User',
      id: 'UNKNOWN',
      role: 'Teacher',
      type: 'teacher'
    };
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
      // Reflect in localStorage for immediate UI consistency
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

  const renderDiscussions = () => (
    <div className="page-content">
      <h2>Discussions</h2>
      <div className="discussions-page">
        <form className="discussion-form" onSubmit={handlePostDiscussion}>
          <div style={{ marginBottom: 8 }}>
            <label className="form-label">Class</label>
            <select className="form-control" value={selectedClassLevel} onChange={(e)=>setSelectedClassLevel(e.target.value)}>
              {['JS1','JS2','JS3','SS1','SS2','SS3'].map(lvl => (
                <option value={lvl} key={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder={`Post to ${selectedClassLevel}...`}
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
            discussions.map(d => {
              const displayName = d?.student && typeof d.student === 'object'
                ? `${d.student.firstName || ''} ${d.student.lastName || ''}`.trim() || d.student.email || 'User'
                : (d.name || 'User');
              return (
                <div key={d._id || d.id} className="discussion-post">
                  <img src={d.avatar || 'https://via.placeholder.com/32x32/6366f1/ffffff?text=U'} alt={displayName} className="discussion-avatar" />
                  <div className="discussion-content">
                    <div className="discussion-header">
                      <h5>{displayName}</h5>
                      {d.classLevel && <span className="discussion-topic">{d.classLevel}</span>}
                    </div>
                    <p className="discussion-text">{d.question || d.comment}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );


  const handleTeacherModeToggle = () => {
    setIsTeacherMode(!isTeacherMode);

  };

  const handleFileSelect = (file) => {
    setUploadForm(prev => ({ ...prev, file }));
  };


  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    // optionally switch to materials tab
    setActiveTab('materials');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.description) {
      openModal({ type: 'warning', title: 'Missing Fields', message: 'Please fill in all required fields.' });
      return;
    }
    setUploadLoading(true);
    let fileUrl = '';
    let fileType = 'pdf';
    let fileSize = undefined;
    let uploadedPublicId = undefined;
    if (uploadForm.file) {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      try {
        const res = await fetch('https://ll-3.onrender.com/api/materials/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'File upload failed');
        fileUrl = data.fileUrl;
        fileType = uploadForm.file.name.split('.').pop();
        fileSize = `${(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB`;
        // Save public_id for reliable inline viewing via backend proxy
        if (data.public_id) {
          uploadedPublicId = data.public_id;
        }
      } catch (err) {
        openModal({ type: 'error', title: 'File Upload Failed', message: String(err.message || err) });
        setUploadLoading(false);
        return;
      }
    }
    const payload = {
      title: uploadForm.title,
      description: uploadForm.description,
      subject: uploadForm.subject,
      courseId: selectedCourse ? selectedCourse._id : undefined,
      classLevel: selectedClassLevel,
      type: fileType,
      size: fileSize,
      fileUrl,
      publicId: uploadedPublicId,
    };
    // Use the actual user ID from userData
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        payload.createdBy = parsedUser._id;
      } catch (error) {
        console.error('Error parsing user data for createdBy:', error);
      }
    }
    try {
      const res = await fetch('https://ll-3.onrender.com/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created?.error || 'Failed to upload material');
      setMaterials(prev => [created, ...prev]);
      setUploadForm({ title: '', description: '', subject: 'Mathematics', file: null });
      openModal({ type: 'success', title: 'Upload Complete', message: 'Material uploaded successfully!' });
    } catch (err) {
      openModal({ type: 'error', title: 'Upload Failed', message: String(err.message || err) });
    } finally {
      setUploadLoading(false);
    }
  };

  const fetchAll = async () => {
    try {
      // Get user ID from userData
      let userId = '';
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          userId = parsedUser._id || '';
        } catch (error) {
          console.error('Error parsing user data for fetchAll:', error);
        }
      }
      // If superadmin, fetch ALL materials; otherwise, only those created by the logged-in teacher
      const isSuperAdmin = (user?.type === 'superadmin');
      const materialsUrl = isSuperAdmin
        ? 'https://ll-3.onrender.com/api/materials'
        : `https://ll-3.onrender.com/api/materials?createdBy=${userId}`;

      const [matsRes, studsRes, coursesRes] = await Promise.all([
        fetch(materialsUrl),
        fetch('https://ll-3.onrender.com/api/students'),
        fetch('https://ll-3.onrender.com/api/courses'),
      ]);
      const [mats, studs, crs] = await Promise.all([
        matsRes.json(), studsRes.json(), coursesRes.json()
      ]);
      setMaterials(mats);
      setStudents(studs.filter(s => s.type === 'student'));
      setStaff(studs.filter(s => s.type === 'teacher'));
      setCourses(crs);
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Fetch discussions for the selected class level
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`https://ll-3.onrender.com/api/discussions?classLevel=${encodeURIComponent(selectedClassLevel)}`);
        const data = await res.json();
        setDiscussions(Array.isArray(data) ? [...data].reverse() : []);
      } catch (e) {
        setDiscussions([]);
      }
    };
    fetchDiscussions();
  }, [selectedClassLevel]);

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussion.trim()) return;
    try {
      const payload = {
        classLevel: selectedClassLevel,
        student: user.dbId,
        question: newDiscussion.trim(),
      };
      const res = await fetch('https://ll-3.onrender.com/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to post');
      const created = await res.json();
      setDiscussions(prev => [created, ...prev]);
      setNewDiscussion('');
    } catch (err) {
      openModal({ type: 'error', title: 'Failed', message: 'Failed to post discussion.' });
    }
  };

  const handleDeleteMaterial = async (id) => {
    const ok = await confirmAction({ title: 'Delete Material', message: 'Are you sure you want to delete this material?', confirmLabel: 'Delete', type: 'error' });
    if (!ok) return;
    await fetch(`https://ll-3.onrender.com/api/materials/${id}`, { method: 'DELETE' });
    setMaterials(prev => prev.filter(m => m._id !== id));
    openModal({ type: 'success', title: 'Deleted', message: 'Material deleted successfully.' });
  };

  const handleEditMaterial = (id) => {
    const material = materials.find(m => m.id === id);
    if (material) {
      const newTitle = prompt('Edit title:', material.title);
      if (newTitle && newTitle.trim()) {
        setMaterials(prev => prev.map(m => 
          m.id === id ? { ...m, title: newTitle.trim() } : m
        ));
      }
    }
  };

  const handleViewMaterial = (material) => {
    // Determine extension, fallback to fileUrl
    let ext = (material.type || '').toLowerCase();
    if (!ext && material.fileUrl) {
      try {
        const urlObj = new URL(material.fileUrl);
        const name = urlObj.pathname.split('/').pop() || '';
        const dot = name.lastIndexOf('.');
        if (dot !== -1) ext = name.slice(dot + 1).toLowerCase();
      } catch {}
    }
    const isImage = ['png','jpg','jpeg','gif','webp'].includes(ext);
    const isVideo = ['mp4','webm','mov'].includes(ext);
    const isPdf = ext === 'pdf';
    const isOffice = ['doc','docx','xls','xlsx','ppt','pptx'].includes(ext);
    // Construct a friendly filename to pass to backend when using publicId
    const safeTitle = (material.title || 'material').replace(/[^a-z0-9\-_. ]/gi, '').trim() || 'material';
    const friendlyName = ext ? `${safeTitle}.${ext}` : safeTitle;
    // If publicId missing but fileUrl is Cloudinary, derive publicId from URL
    let publicId = material.publicId;
    if (!publicId && material.fileUrl) {
      try {
        const u = new URL(material.fileUrl);
        if (u.hostname.includes('res.cloudinary.com') && u.pathname.includes('/upload/')) {
          const afterUpload = u.pathname.split('/upload/')[1] || '';
          const noExt = afterUpload.substring(0, afterUpload.lastIndexOf('.'));
          publicId = decodeURIComponent(noExt.startsWith('/') ? noExt.slice(1) : noExt);
        }
      } catch {}
    }
    const proxyUrl = publicId
      ? `https://ll-3.onrender.com/api/materials/download/${encodeURIComponent(publicId)}?mode=inline&name=${encodeURIComponent(friendlyName)}`
      : '';
    // Prefer proxyUrl to ensure download logging; fall back to direct fileUrl
    const inlineUrl = proxyUrl || material.fileUrl;
    // Do NOT use Google Docs Viewer; only preview supported types inline

    openModal({
      title: 'Material Details',
      type: 'info',
      message: (
        <div style={{ display: 'grid', gap: 12, maxHeight: '70vh', overflowY: 'auto' }}>
          <div><strong>Title:</strong> {material.title}</div>
          {material.description && <div><strong>Description:</strong> {material.description}</div>}
          {material.subject && <div><strong>Subject:</strong> {material.subject}</div>}
          {material.classLevel && <div><strong>Class:</strong> {material.classLevel}</div>}
          {material.size && <div><strong>Size:</strong> {material.size}</div>}
          {material.type && <div><strong>Type:</strong> {material.type}</div>}
          {material.createdAt && <div><strong>Uploaded:</strong> {new Date(material.createdAt).toLocaleString()}</div>}
          {material.courseId && typeof material.courseId === 'object' && (
            <div><strong>Course:</strong> {material.courseId.title} ({material.courseId.code})</div>
          )}

          {(inlineUrl) && (
            <div style={{ marginTop: 6 }}>
              {isImage && (
                <img src={inlineUrl} alt={material.title} style={{ maxHeight: '60vh', width: '100%', objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }} />
              )}
              {isVideo && (
                <video controls style={{ width: '100%', maxHeight: '60vh', borderRadius: 8, border: '1px solid #eee' }}>
                  <source src={inlineUrl} type={ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : 'video/quicktime'} />
                  Your browser does not support the video tag.
                </video>
              )}
              {isPdf && (
                <object data={inlineUrl} type="application/pdf" style={{ width: '100%', height: '60vh', border: '1px solid #eee', borderRadius: 8 }}>
                  <iframe title="preview-pdf" src={inlineUrl} style={{ width: '100%', height: '60vh', border: 'none' }} />
                </object>
              )}
              {isOffice && (
                <div style={{ padding: 12, background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', borderRadius: 8 }}>
                  Office documents cannot be previewed inline in the browser. Use "Open in New Tab" below to view or download.
                </div>
              )}
              {!isImage && !isVideo && !isPdf && !isOffice && (
                <div style={{ padding: 12, background: '#f9fafb', border: '1px solid #eee', borderRadius: 8 }}>
                  Preview not available for this file type. Use the button below to open it.
                </div>
              )}
            </div>
          )}

          {(inlineUrl) && (
            <div>
              <button onClick={() => {
                window.open(inlineUrl, '_blank');
              }}
              style={{ background: '#1A2A80', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                Open in New Tab
              </button>
            </div>
          )}
        </div>
      )
    });
  };


  const studentActivity = [
    {
      id: 1,
      name: 'Emma Wilson',
      action: 'Downloaded Math Chapter 5',
      time: '2m ago',
      avatar: 'https://via.placeholder.com/32x32/ec4899/ffffff?text=EW'
    },
    {
      id: 2,
      name: 'Michael Chen',
      action: 'Added comment on Lab Report',
      time: '5m ago',
      avatar: 'https://via.placeholder.com/32x32/10b981/ffffff?text=MC'
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      action: 'Saved Grade Tracker',
      time: '12m ago',
      avatar: 'https://via.placeholder.com/32x32/6366f1/ffffff?text=SJ'
    },
    {
      id: 4,
      name: 'David Rodriguez',
      action: 'Downloaded Science Template',
      time: '18m ago',
      avatar: 'https://via.placeholder.com/32x32/f59e0b/ffffff?text=DR'
    }
  ];

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      xls: '📊',
      ppt: '📊',
      default: '📄'
    };
    return icons[type] || icons.default;
  };

  const getFileColor = (type) => {
    const colors = {
      pdf: '#ef4444',
      doc: '#3b82f6',
      xls: '#10b981',
      ppt: '#f59e0b',
      default: '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const userRole = localStorage.getItem('userRole') || 'teacher';

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <StatsCard
          title="Total Materials"
          value={materials.length}
          changeType="increase"
          icon="📚"
          iconColor="#6366f1"
        />
        <StatsCard
          title="Active Students"
          value={students && students.length ? students.length : 0}
          changeType="increase"
          icon="👥"
          iconColor="#3b82f6"
        />
        <StatsCard
          title="Downloads"
          value={materials.reduce((sum, material) => sum + material.downloads || 0, 0)}
          changeType="decrease"
          icon="⬇️"
          iconColor="#10b981"
        />
        <StatsCard
          title="Comments"
          value={materials && materials.length ? materials.reduce((sum, m) => sum + (m.reviews ? m.reviews.length : 0), 0) : 0}
          changeType="increase"
          icon="💬"
          iconColor="#8b5cf6"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Materials</h3>
            <button className="upload-btn">+ Upload New</button>
          </div>
          <div className="materials-list">
            {materials.slice(0, 3).map((material) => (
              <div key={material._id} className="material-item">
                <div className="material-icon" style={{ color: getFileColor(material.type) }}>
                  {getFileIcon(material.type)}
                </div>
                <div className="material-info">
                  <h4>{material.title}</h4>
                  <p>Uploaded {material.createdAt ? new Date(material.createdAt).toLocaleString() : ''} • {material.size || ''}</p>
                  <span className="download-count">{material.downloads || 0} downloads</span>
                </div>
                <button className="material-actions" title="Delete" onClick={async () => {
                  const ok = await confirmAction({ title: 'Delete Material', message: 'Are you sure you want to delete this material?', confirmLabel: 'Delete', type: 'error' });
                  if (!ok) return;
                  await handleDeleteMaterial(material._id);
                }}>⋮</button>
              </div>
            ))}
          </div>
        </div>


        {user.type !== 'superadmin' && (
        <div className="dashboard-section">
          <h3>Student Activity</h3>
          <div className="activity-list">
            {(() => {
              const items = (materials || [])
                .flatMap(m => (m.downloadsLog || []).map(log => ({
                  id: `${m._id}-${log.at}-${log.user || log.userName || 'anon'}`,
                  title: m.title,
                  user: log.userName || 'A user',
                  at: log.at,
                })))
                .sort((a,b) => new Date(b.at || 0) - new Date(a.at || 0))
                .slice(0, 6);
              if (!items.length) return (<p style={{ color: '#888', fontStyle: 'italic' }}>No student activity yet.</p>);
              return items.map(it => (
                <div key={it.id} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 8, background: '#10b981' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{it.user} downloaded {it.title}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>{it.at ? new Date(it.at).toLocaleString() : ''}</div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
        )}
        {user.type !== 'superadmin' && (
        <div className="dashboard-section">
          <h3>Recent Discussions</h3>
          <div className="discussions-list" style={{ maxHeight: '260px', overflowY: 'auto', borderTop: '1px solid #f3f4f6' }}>
            {discussions.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No discussions yet.</p>
            ) : (
              discussions.map(d => {
                const displayName = d?.student && typeof d.student === 'object'
                  ? `${d.student.firstName || ''} ${d.student.lastName || ''}`.trim() || d.student.email || 'User'
                  : (d.name || 'User');
                return (
                  <div key={d._id || d.id} className="discussion-item" style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <img src={d.avatar || 'https://via.placeholder.com/32x32/6366f1/ffffff?text=U'} alt={displayName} className="discussion-avatar" />
                    <div className="discussion-content" style={{ flex: 1 }}>
                      <div className="discussion-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h5 style={{ margin: 0 }}>{displayName}</h5>
                        {d.classLevel && <span className="discussion-topic">{d.classLevel}</span>}
                      </div>
                      <p className="discussion-text" style={{ margin: '4px 0 0' }}>{d.question || d.comment}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon">☁️</div>
            <h4>Upload Material</h4>
            <p>Add new learning resources</p>
          </div>
          <div className="action-card">
            <div className="action-icon">👤</div>
            <h4>Add Student</h4>
            <p>Invite new students</p>
          </div>
          <div className="action-card">
            <div className="action-icon">📊</div>
            <h4>View Reports</h4>
            <p>Analytics and insights</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: '24px' }}>
        <div className="section-header">
          {/* <h3>Courses</h3> */}
        </div>
        <div className="materials-list">
          {courses.map(c => (
            <div key={c._id} className="material-item">
              <div className="material-info">
                <h4>{c.title} ({c.code})</h4>
                <p>{c.description}</p>
              </div>
              <button className="material-actions" onClick={async () => {
                const ok = await confirmAction({ title: 'Delete Course', message: `Delete course ${c.title}?`, confirmLabel: 'Delete', type: 'error' });
                if (!ok) return;
                await fetch(`https://ll-3.onrender.com/api/courses/${c._id}`, { method: 'DELETE' });
                setCourses(prev => prev.filter(x => x._id !== c._id));
                openModal({ type: 'success', title: 'Deleted', message: 'Course deleted successfully.' });
              }}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      {false && userRole === 'superadmin' && null}
    </div>
  );

  // Superadmin-only: view all staff
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
              <button onClick={async () => {
                const firstName = prompt('First name', s.firstName || '') || s.firstName;
                const lastName = prompt('Last name', s.lastName || '') || s.lastName;
                const email = prompt('Email', s.email || '') || s.email;
                const phone = prompt('Phone', s.phone || '') || s.phone;
                try {
                  const res = await fetch(`https://ll-3.onrender.com/api/students/${s._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, phone })
                  });
                  if (res.ok) fetchAll();
                } catch {}
              }}>Edit</button>
              <button className="delete-btn" onClick={async () => {
                const ok = await confirmAction({ title: 'Delete Staff', message: 'Delete this staff account?', confirmLabel: 'Delete', type: 'error' });
                if (!ok) return;
                await fetch(`https://ll-3.onrender.com/api/staff/${s._id}`, { method: 'DELETE' });
                fetchAll();
                openModal({ type: 'success', title: 'Deleted', message: 'Staff deleted successfully.' });
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Superadmin-only: invite staff
  const renderInviteStaff = () => (
    <div className="page-content">
      <h2>Add Staff</h2>
      <div className="materials-list">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const firstName = form.querySelector('#sa-firstName').value;
          const lastName = form.querySelector('#sa-lastName').value;
          const email = (form.querySelector('#sa-email').value || '').trim();
          if (!email) { openModal({ type: 'error', title: 'Error', message: 'Email is required' }); return; }
          try {
            setInviteLoading(true);
            const endpoint = 'https://ll-3.onrender.com/api/superadmin/invite-staff';
            const payload = { email, firstName, lastName, type: 'teacher' };
            const env = process.env.NODE_ENV || (window?.location?.hostname?.includes('localhost') ? 'development' : 'production');
            console.groupCollapsed(`[inviteStaff][${env}] Submit`);
            console.info('[inviteStaff] Request', { url: endpoint, method: 'POST', body: payload });
            const start = Date.now();
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const data = await res.json();
            const durationMs = Date.now() - start;
            if (!res.ok) {
              console.error('[inviteStaff] Error Response', { status: res.status, statusText: res.statusText, durationMs, data });
              throw new Error(data?.error || data?.message || `Failed to invite (status ${res.status})`);
            }
            console.info('[inviteStaff] Success Response', { status: res.status, durationMs, data });
            openModal({ type: 'success', title: 'Invitation Sent', message: data.message || 'Invitation sent' });
            form.reset();
            fetchAll();
          } catch (err) {
            console.error('[inviteStaff] Caught Exception', { message: err?.message, stack: err?.stack });
            openModal({ type: 'error', title: 'Failed', message: err?.message || 'Failed to invite' });
          } finally {
            setInviteLoading(false);
            console.groupEnd?.();
          }
        }} className="d-flex flex-column gap-2" style={{ maxWidth: 520 }}>
          <div className="row">
            <div className="col">
              <label className="form-label" htmlFor="sa-firstName">First Name</label>
              <input id="sa-firstName" className="form-control" placeholder="First Name" />
            </div>
            <div className="col">
              <label className="form-label" htmlFor="sa-lastName">Last Name</label>
              <input id="sa-lastName" className="form-control" placeholder="Last Name" />
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="sa-email">Email Address</label>
            <input id="sa-email" type="email" className="form-control" placeholder="user@example.com" required />
          </div>
          <div>
            <label className="form-label">User Type</label>
            <input type="text" className="form-control" value="Teacher" disabled style={{backgroundColor: '#f8f9fa', color: '#6c757d'}} />
          </div>
          <button className="btn" disabled={inviteLoading} style={{backgroundColor: inviteLoading ? '#6b7280' : '#1A2A80', color: 'white', opacity: inviteLoading ? 0.85 : 1, cursor: inviteLoading ? 'not-allowed' : 'pointer'}}>
            {inviteLoading ? 'Creating…' : 'Create Teacher Account'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderUploadMaterials = () => (
    <div className="page-content">
      <h2>Upload Materials</h2>
      {uploadLoading && (
        <div style={{
          margin: '8px 0 16px',
          padding: '8px 12px',
          background: '#EFF6FF',
          color: '#1D4ED8',
          border: '1px solid #BFDBFE',
          borderRadius: 8,
          fontSize: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span role="img" aria-label="hourglass">⏳</span>
          Uploading... please wait
        </div>
      )}
      <div className="upload-form">
        <form onSubmit={handleUploadSubmit}>


        
          <div className="form-group">
            <label>Material Title *</label>
            <input 
              type="text" 
              placeholder="Enter material title" 
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              disabled={uploadLoading}
              required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea 
              placeholder="Enter material description" 
              rows="4"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              disabled={uploadLoading}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select 
              value={uploadForm.subject}
              onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
              disabled={uploadLoading}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
          <div style={{flex: 1}}>
            <label style={{ display: 'block', marginBottom: 6 }}>Class Level</label>
            <div
              role="group"
              aria-label="Select class level"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 6
              }}
            >
              {['JSS1','JSS2','JSS3','SS1','SS2','SS3'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedClassLevel(lvl)}
                  aria-pressed={selectedClassLevel === lvl}
                  disabled={uploadLoading}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: '1px solid',
                    borderColor: selectedClassLevel === lvl ? '#1A2A80' : '#e5e7eb',
                    background: selectedClassLevel === lvl ? '#1A2A80' : '#ffffff',
                    color: selectedClassLevel === lvl ? '#ffffff' : '#1A2A80',
                    fontWeight: selectedClassLevel === lvl ? 700 : 500,
                    fontSize: 14,
                    cursor: uploadLoading ? 'not-allowed' : 'pointer',
                    transition: 'all .15s ease-in-out'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>File Upload</label>
            <div style={{ opacity: uploadLoading ? 0.6 : 1, pointerEvents: uploadLoading ? 'none' : 'auto' }}>
              <FileUpload 
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
            </div>
          </div>
          {/* AI Summary chat removed from teacher upload page as requested */}
          <button type="submit" className="submit-btn" style={{backgroundColor: uploadLoading ? '#6b7280' : '#1A2A80', color: 'white', opacity: uploadLoading ? 0.85 : 1, cursor: uploadLoading ? 'not-allowed' : 'pointer'}} disabled={uploadLoading}>
            {uploadLoading ? 'Uploading…' : 'Upload Material'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderMyMaterials = () => (
    <div className="page-content">
      <h2>My Materials ({materials.length})</h2>
      {/* Course filter section below heading */}
      {courses.length > 0 && (
        <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontWeight: 600, color: '#1A2A80', fontSize: 15 }}>Filter by Course:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              style={{
                background: !selectedCourse ? '#1A2A80' : '#fff',
                color: !selectedCourse ? '#fff' : '#1A2A80',
                border: '1px solid #1A2A80',
                borderRadius: 6,
                padding: '6px 16px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: 4
              }}
              onClick={() => setSelectedCourse(null)}
            >
              All Courses
            </button>
            {courses.map(c => (
              <button
                key={c._id}
                onClick={() => handleCourseSelect(c)}
                style={{
                  background: selectedCourse && selectedCourse._id === c._id ? '#1A2A80' : '#fff',
                  color: selectedCourse && selectedCourse._id === c._id ? '#fff' : '#1A2A80',
                  border: '1px solid #1A2A80',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: 4
                }}
              >
                {c.title} <span style={{ fontSize: 12, opacity: 0.7 }}>({c.code})</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="materials-grid">
        {materials.filter(m => !selectedCourse || m.courseId === selectedCourse._id).map((material) => (
          <div key={material._id} className="material-card">
            <div className="material-icon" style={{ color: getFileColor(material.type) }}>
              {getFileIcon(material.type)}
            </div>
            <h4>{material.title}</h4>
            <p>{material.size || ''}</p>
            {material.subject && <p className="subject-tag">{material.subject}</p>}
            <div className="material-actions">
              <button onClick={() => handleDeleteMaterial(material._id)} className="delete-btn">Delete</button>
              <button onClick={() => {
                if (material.fileUrl) {
                  navigator.clipboard.writeText(material.fileUrl)
                    .then(() => openModal({ type: 'success', title: 'Link Copied', message: 'Material link copied to clipboard!' }))
                    .catch(() => openModal({ type: 'error', title: 'Copy Failed', message: 'Failed to copy link.' }));
                } else {
                  openModal({ type: 'info', title: 'No Link', message: 'No file link available for this material.' });
                }
              }}>Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSavedItems = () => (
    <div className="page-content">
      <h2>Saved Items</h2>
      <div className="saved-items">
        <p>No saved items yet.</p>
      </div>
    </div>
  );

  // Superadmin-only: Staff Activity view
  const renderStaffActivity = () => {
    if (user.type !== 'superadmin') return renderDashboard();

    // Helper: get owner id from material (supports string id or populated object)
    const getOwnerId = (m) => {
      const cb = m.createdBy;
      if (!cb) return '';
      if (typeof cb === 'string') return cb;
      if (typeof cb === 'object') return cb._id || cb.id || '';
      return '';
    };
    const getOwnerName = (m) => {
      const id = getOwnerId(m);
      const found = staff.find(s => s._id === id);
      if (found) return `${found.firstName || ''} ${found.lastName || ''}`.trim() || found.email;
      // fallback if backend populated createdBy object
      if (m.createdBy && typeof m.createdBy === 'object') {
        return m.createdBy.name || `${m.createdBy.firstName || ''} ${m.createdBy.lastName || ''}`.trim() || m.createdBy.email || 'Unknown';
      }
      return 'Unknown';
    };

    const staffWithCounts = staff
      .map(s => ({
        ...s,
        count: materials.filter(m => getOwnerId(m) === s._id).length
      }))
      // put staff with uploads first
      .sort((a, b) => b.count - a.count || (a.firstName || '').localeCompare(b.firstName || ''));

    // Initialize selection to first in list if not set
    const effectiveSelectedId = selectedStaffForActivity || (staffWithCounts[0]?. _id || null);
    const selectedMaterials = materials
      .filter(m => getOwnerId(m) === effectiveSelectedId)
      .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const selectedStaff = staff.find(s => s._id === effectiveSelectedId) || null;

    return (
      <div className="page-content" style={{ display: 'flex', gap: 16 }}>
        {/* Mini sidebar */}
        <aside style={{ width: 260, borderRight: '1px solid #eee' }}>
          <div style={{ padding: '12px 10px', fontWeight: 700, color: '#1A2A80' }}>Staff Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {staffWithCounts.map(s => (
              <button
                key={s._id}
                onClick={() => setSelectedStaffForActivity(s._id)}
                className="sidebar-course-item"
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  background: (effectiveSelectedId === s._id) ? '#EEF2FF' : '#fff',
                  color: '#1f2937',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{(s.firstName || 'Teacher') + ' ' + (s.lastName || '')}</span>
                <span style={{
                  background: '#1A2A80', color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 12
                }}>{s.count}</span>
              </button>
            ))}
            {staffWithCounts.length === 0 && (
              <div style={{ padding: 12, color: '#6b7280' }}>No staff found.</div>
            )}
          </div>
        </aside>

        {/* Main panel */}
        <section style={{ flex: 1, padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Uploads {selectedStaff ? `by ${selectedStaff.firstName || 'Teacher'} ${selectedStaff.lastName || ''}` : ''}</h2>
            <div style={{ color: '#6b7280' }}>{selectedMaterials.length} item(s)</div>
          </div>
          <div className="materials-list" style={{ marginTop: 12 }}>
            {selectedMaterials.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No uploads for this staff yet.</p>
            ) : (
              selectedMaterials.map(m => (
                <div key={m._id} className="material-item" style={{ alignItems: 'flex-start' }}>
                  <div className="material-icon" style={{ color: getFileColor(m.type) }}>
                    {getFileIcon(m.type)}
                  </div>
                  <div className="material-info" style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: 4 }}>{m.title}</h4>
                    <p style={{ margin: 0, color: '#6b7280' }}>
                      {m.subject ? (<><strong>Subject:</strong> {m.subject} • </>) : null}
                      {m.classLevel ? (<><strong>Class:</strong> {m.classLevel} • </>) : null}
                      <strong>By:</strong> {getOwnerName(m)} • {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <div className="material-actions" style={{ gap: 8 }}>
                    <button onClick={() => handleViewMaterial(m)}>View</button>
                    {m.fileUrl && (
                      <button onClick={() => navigator.clipboard.writeText(m.fileUrl).then(() => openModal({ type: 'success', title: 'Link Copied', message: 'Material link copied to clipboard!' })).catch(() => openModal({ type: 'error', title: 'Copy Failed', message: 'Failed to copy link.' }))}>Share</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderComments = () => {
    // Only show comments for the selected material
    return (
      <div className="page-content">
        <h2>Comments</h2>
        <div className="comments-section">
          <div style={{marginBottom: 12}}>
            <strong>Selected Material:</strong> {selectedMaterial ? selectedMaterial.title : 'None'}
          </div>
          {selectedMaterial ? (
            <div className="comments-list">
              {selectedMaterial.reviews && selectedMaterial.reviews.length > 0 ? (
                selectedMaterial.reviews.map(r => (
                  <div key={r._id || r.createdAt} style={{borderBottom: '1px solid #eee', padding: 8}}>
                    <div style={{fontWeight: 600}}>{r.userName || r.user || 'Student'}</div>
                    <div>{r.comment}</div>
                    <div style={{fontSize: 12, color: '#6b7280'}}>{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <p>No comments for this material yet.</p>
              )}
            </div>
          ) : (
            <div className="comments-list">
              <p>Select a material and click "View Comments" to see student reviews.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStudents = () => (
    <div className="page-content">
      <h2>Students</h2>
      <div className="students-list">
        {students.map((s) => (
          <div key={s._id} className="student-card">
            <div className="student-info">
              <h4>{s.firstName} {s.lastName}</h4>
              <p>{s.email}</p>
              <span className="last-activity">{s.isActive ? 'Active' : 'Archived'}</span>
            </div>
            <div className="student-actions">
              <button onClick={async () => {
                const firstName = prompt('First name', s.firstName) || s.firstName;
                const lastName = prompt('Last name', s.lastName) || s.lastName;
                const email = prompt('Email', s.email) || s.email;
                const phone = prompt('Phone', s.phone || '') || s.phone;
                const res = await fetch(`https://ll-3.onrender.com/api/students/${s._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, email, phone }) });
                if (res.ok) fetchAll();
              }}>Edit</button>
              <button onClick={async () => {
                const ok = await confirmAction({ title: s.isActive ? 'Archive Student' : 'Restore Student', message: `Are you sure you want to ${s.isActive ? 'archive' : 'restore'} this student?`, confirmLabel: s.isActive ? 'Archive' : 'Restore', type: 'warning' });
                if (!ok) return;
                await fetch(`https://ll-3.onrender.com/api/students/${s._id}/archive`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.isActive }) });
                fetchAll();
              }}>{s.isActive ? 'Archive' : 'Restore'}</button>
              <button className="delete-btn" onClick={async () => {
                const ok = await confirmAction({ title: 'Delete Student', message: 'Delete this student?', confirmLabel: 'Delete', type: 'error' });
                if (!ok) return;
                await fetch(`https://ll-3.onrender.com/api/students/${s._id}`, { method: 'DELETE' });
                fetchAll();
                openModal({ type: 'success', title: 'Deleted', message: 'Student deleted successfully.' });
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'upload':
        return renderUploadMaterials();
      case 'materials':
        return renderMyMaterials();
      case 'saved':
        return renderSavedItems();
      case 'discussions':
        return renderDiscussions();
      case 'comments':
        return renderComments();
      case 'students':
        return renderStudents();
      case 'staff_list':
        return renderStaffList();
      case 'invite_staff':
        return renderInviteStaff();
      case 'staff_activity':
        return renderStaffActivity();
      case 'profile':
        return renderProfile();
      case 'add_student':
        return renderAddStudent();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        userType={user.type === 'superadmin' ? 'superadmin' : 'teacher'} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        user={user}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="main-content" style={{ flex: 1 }}>
          <Header 
            userType="teacher" 
            userName={user.name}
            notificationCount={notificationCount}
            onTeacherModeToggle={handleTeacherModeToggle}
            isTeacherMode={isTeacherMode}
            onProfileClick={() => {
              openModal({ type: 'info', title: 'Profile', message: 'Profile coming soon!' });
            }}
          />
          {renderContent()}
          <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={closeModal} actions={modal.actions} />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
