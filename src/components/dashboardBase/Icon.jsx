// components/dashboard/Icon.jsx
import React from 'react';

const Icon = ({ name, className = '' }) => {
  const icons = {
    dashboard: '📊',
    statistics: '📈',
    calendar: '📅',
    building: '🏛️',
    factory: '🏭',
    export: '🌎',
    sustainability: '♻️',
    map: '🗺️',
    home: '🏠',
    report: '📋',
    settings: '⚙️',
    chart: '📊',
    growth: '📈',
    office: '🏢',
    globe: '🌐',
    leaf: '🍃'
  };
  
  return <span className={`icon ${className}`}>{icons[name] || '📊'}</span>;
};

export default Icon;