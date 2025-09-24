import React from 'react';
import './Header.css';

const Header = ({ userType, userName, notificationCount = 3, onTeacherModeToggle, isTeacherMode = true, onProfileClick }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <p className="header-subtitle">
            Welcome back, {userName || (userType === 'teacher' ? 'Teacher' : 'Student')}
          </p>
        </div>
        
        <div className="header-right">
          <div className="notification-bell">
            <span className="bell-icon">🔔</span>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
          
          {userType === 'teacher' && (
            <div className="teacher-mode-toggle">
              <span className="toggle-label">Profile</span>
              <button 
                className={`toggle-switch ${isTeacherMode ? 'active' : ''}`}
                onClick={onProfileClick}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          )}
          
          {userType === 'student' && (
            <div className="search-icon">
              <span>🔍</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
