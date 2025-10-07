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
