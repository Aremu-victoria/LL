import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userType, activeTab, onTabChange, user, courses = [], selectedCourseId, onCourseSelect }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const teacherMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'upload', label: 'Upload Materials', icon: '📤' },
    { id: 'materials', label: 'My Materials', icon: '📚' },
    { id: 'saved', label: 'Saved Items', icon: '💾' },
    { id: 'comments', label: 'Comments', icon: '💬' },
    { id: 'students', label: 'Students', icon: '👥' }
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'materials', label: 'My Materials', icon: '📁' },
    { id: 'downloads', label: 'Downloads', icon: '⬇️' },
    { id: 'discussions', label: 'Discussions', icon: '💬' }
  ];

  const superadminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'students', label: 'View Students', icon: '👨‍🎓' },
    { id: 'invite_staff', label: 'Add Staff', icon: '➕' },
    { id: 'staff_list', label: 'All Staff', icon: '👥' },
    { id: 'add_student', label: 'Add Student', icon: '➕' },
  ];

  const menuItems = userType === 'teacher' ? teacherMenuItems : (userType === 'superadmin' ? superadminMenuItems : studentMenuItems);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🎓</span>
          {!isCollapsed && (
            <span className="logo-text">
              LearnLink {userType === 'teacher' ? 'School System' : 'Student Portal'}
            </span>
          )}
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {userType === 'teacher' && courses.length > 0 && !isCollapsed && (
        <div className="sidebar-courses">
          <h5 style={{padding: '8px 12px', margin: 0, fontSize: 12, color: '#6b7280'}}>Courses</h5>
          {courses.map(c => (
            <button
              key={c._id}
              className={`sidebar-course-item ${selectedCourseId === c._id ? 'active' : ''}`}
              onClick={() => onCourseSelect && onCourseSelect(c)}
            >
              <span className="course-label">{c.title}</span>
              <span className="course-code">{c.code}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <img src="https://via.placeholder.com/40x40/6366f1/ffffff?text=JT" alt="User" />
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;