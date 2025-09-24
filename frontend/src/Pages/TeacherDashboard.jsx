import React, { useEffect, useState } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import StatsCard from '../Components/StatsCard';
import FileUpload from '../Components/FileUpload';
import Modal from '../Components/Modal';
import './Dashboard.css';

const TeacherDashboard = () => {
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
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClassLevel, setSelectedClassLevel] = useState('SS1');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

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
    let fileUrl = '';
    let fileType = 'pdf';
    let fileSize = undefined;
    let uploadedPublicId = undefined;
    if (uploadForm.file) {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      try {
        const res = await fetch('http://localhost:5000/api/materials/upload', {
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
    fetch('http://localhost:5000/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(created => {
      setMaterials(prev => [created, ...prev]);
      setUploadForm({ title: '', description: '', subject: 'Mathematics', file: null });
      openModal({ type: 'success', title: 'Upload Complete', message: 'Material uploaded successfully!' });
    }).catch(() => openModal({ type: 'error', title: 'Upload Failed', message: 'Failed to upload material' }));
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
      
      const [matsRes, studsRes, coursesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/materials?createdBy=${userId}`),
        fetch('http://localhost:5000/api/students'),
        fetch('http://localhost:5000/api/courses'),
      ]);
      const [mats, studs, crs] = await Promise.all([
        matsRes.json(), studsRes.json(), coursesRes.json()
      ]);
      setMaterials(mats);
      setStudents(studs.filter(s => s.type === 'student'));
      setCourses(crs);
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDeleteMaterial = async (id) => {
    const ok = await confirmAction({ title: 'Delete Material', message: 'Are you sure you want to delete this material?', confirmLabel: 'Delete', type: 'warning' });
    if (!ok) return;
    await fetch(`http://localhost:5000/api/materials/${id}`, { method: 'DELETE' });
    setMaterials(prev => prev.filter(m => m._id !== id));
    openModal({ type: 'success', title: 'Deleted', message: 'Material deleted.' });
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
      ? `http://localhost:5000/api/materials/download/${encodeURIComponent(publicId)}?mode=inline&name=${encodeURIComponent(friendlyName)}`
      : '';
    // Prefer direct Cloudinary fileUrl; fall back to proxy only if missing
    const inlineUrl = material.fileUrl || proxyUrl;
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
          change="+12% from last month"
          changeType="increase"
          icon="📚"
          iconColor="#6366f1"
        />
        <StatsCard
          title="Active Students"
          value={students && students.length ? students.length : 0}
          change=""
          changeType="increase"
          icon="👥"
          iconColor="#3b82f6"
        />
        <StatsCard
          title="Downloads"
          value={materials.reduce((sum, material) => sum + material.downloads || 0, 0)}
          change="-2% from yesterday"
          changeType="decrease"
          icon="⬇️"
          iconColor="#10b981"
        />
        <StatsCard
          title="Comments"
          value={materials && materials.length ? materials.reduce((sum, m) => sum + (m.reviews ? m.reviews.length : 0), 0) : 0}
          change=""
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
              <div key={material.id} className="material-item">
                <div className="material-icon" style={{ color: getFileColor(material.type) }}>
                  {getFileIcon(material.type)}
                </div>
                <div className="material-info">
                  <h4>{material.title}</h4>
                  <p>Uploaded {material.uploadTime} • {material.size}</p>
                  <span className="download-count">{material.downloads} downloads</span>
                </div>
                <button className="material-actions">⋮</button>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Student Activity</h3>
          <div className="activity-list">
            <p style={{ color: '#888', fontStyle: 'italic' }}>No student activity yet.</p>
          </div>
        </div>
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
                const ok = await confirmAction({ title: 'Delete Course', message: `Delete course ${c.title}?`, confirmLabel: 'Delete', type: 'warning' });
                if (!ok) return;
                await fetch(`http://localhost:5000/api/courses/${c._id}`, { method: 'DELETE' });
                setCourses(prev => prev.filter(x => x._id !== c._id));
                openModal({ type: 'success', title: 'Deleted', message: 'Course deleted.' });
              }}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      {userRole === 'superadmin' && (
        <div className="dashboard-section" style={{ marginTop: '24px' }}>
          <div className="section-header">
            <h3>Create Staff Account</h3>
          </div>
          <div className="materials-list">
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const firstName = form.querySelector('#sa-firstName').value;
              const lastName = form.querySelector('#sa-lastName').value;
              const email = form.querySelector('#sa-email').value;
              if (!email) { openModal({ type: 'error', title: 'Error', message: 'Email is required' }); return; }
              try {
                const res = await fetch('http://localhost:5000/api/superadmin/invite-staff', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, firstName, lastName, type: 'teacher' })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to invite');
                openModal({ type: 'success', title: 'Invitation Sent', message: data.message || 'Invitation sent' });
                form.reset();
              } catch (err) {
                openModal({ type: 'error', title: 'Failed', message: err.message || 'Failed to invite' });
              }
            }} className="d-flex flex-column gap-2" style={{ maxWidth: 520 }}>
              <div className="row">
                <div className="col">
                  <label className="form-label" htmlFor="sa-firstName">First Name</label>
                  <input id="sa-firstName" className="form-control" placeholder="Optional" />
                </div>
                <div className="col">
                  <label className="form-label" htmlFor="sa-lastName">Last Name</label>
                  <input id="sa-lastName" className="form-control" placeholder="Optional" />
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
              <button className="btn" style={{backgroundColor: '#1A2A80', color: 'white'}}>Invite Staff</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderUploadMaterials = () => (
    <div className="page-content">
      <h2>Upload Materials</h2>
      <div className="upload-form">
        <form onSubmit={handleUploadSubmit}>


        
          <div className="form-group">
            <label>Material Title *</label>
            <input 
              type="text" 
              placeholder="Enter material title" 
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
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
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select 
              value={uploadForm.subject}
              onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
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
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: '1px solid',
                    borderColor: selectedClassLevel === lvl ? '#1A2A80' : '#e5e7eb',
                    background: selectedClassLevel === lvl ? '#1A2A80' : '#ffffff',
                    color: selectedClassLevel === lvl ? '#ffffff' : '#1A2A80',
                    fontWeight: selectedClassLevel === lvl ? 700 : 500,
                    fontSize: 14,
                    cursor: 'pointer',
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
            <FileUpload 
              onFileSelect={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
          </div>
          <button type="submit" className="submit-btn">Upload Material</button>
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
              <button onClick={() => {
                setSelectedMaterial(material);
                setActiveTab('comments');
              }}>View Comments</button>
              <button onClick={() => handleViewMaterial(material)}>View</button>
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
                const res = await fetch(`http://localhost:5000/api/students/${s._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, email, phone }) });
                if (res.ok) fetchAll();
              }}>Edit</button>
              <button onClick={async () => {
                const ok = await confirmAction({ title: s.isActive ? 'Archive Student' : 'Restore Student', message: `Are you sure you want to ${s.isActive ? 'archive' : 'restore'} this student?`, confirmLabel: s.isActive ? 'Archive' : 'Restore', type: 'warning' });
                if (!ok) return;
                await fetch(`http://localhost:5000/api/students/${s._id}/archive`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.isActive }) });
                fetchAll();
              }}>{s.isActive ? 'Archive' : 'Restore'}</button>
              <button className="delete-btn" onClick={async () => {
                const ok = await confirmAction({ title: 'Delete Student', message: 'Delete this student?', confirmLabel: 'Delete', type: 'warning' });
                if (!ok) return;
                await fetch(`http://localhost:5000/api/students/${s._id}`, { method: 'DELETE' });
                fetchAll();
                openModal({ type: 'success', title: 'Deleted', message: 'Student deleted.' });
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
      case 'comments':
        return renderComments();
      case 'students':
        return renderStudents();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        userType="teacher" 
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
