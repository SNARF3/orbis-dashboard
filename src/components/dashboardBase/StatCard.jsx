// components/dashboard/StatCard.jsx
import React from 'react';
import Icon from './Icon';
import '../../css/dashboardBase.css';

const StatCard = ({ title, value, unit, icon = 'chart', loading = false }) => {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon loading-skeleton" style={{ width: '48px', height: '48px' }}></div>
          <div className="stat-content">
            <div className="stat-title loading-skeleton" style={{ width: '120px', height: '14px' }}></div>
            <div className="stat-value loading-skeleton" style={{ width: '80px', height: '32px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon">
          <Icon name={icon} />
        </div>
        <div className="stat-content">
          <div className="stat-title">{title}</div>
          <div className="stat-value">
            {value}
            {unit && <span className="stat-unit">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;