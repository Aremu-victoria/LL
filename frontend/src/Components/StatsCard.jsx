import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, change, changeType, icon, iconColor }) => {
  const changeClass = changeType === 'increase' ? 'increase' : 'decrease';
  const changeSymbol = changeType === 'increase' ? '↑' : '↓';
  
  return (
    <div className="stats-card">
      <div className="stats-card-icon" style={{ backgroundColor: iconColor }}>
        {icon}
      </div>
      <div className="stats-card-content">
        <h3 className="stats-card-value">{value}</h3>
        <p className="stats-card-title">{title}</p>
        <p className={`stats-card-change ${changeClass}`}>
          {changeSymbol} {change}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
