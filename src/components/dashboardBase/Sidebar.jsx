// components/dashboard/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import '../../css/dashboardBase.css';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Bicentenario Analytics</h1>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/Dashboard-bicentenario/" 
          className={`nav-link ${isActive('/Dashboard-bicentenario/') ? 'active' : ''}`}
        >
          <Icon name="home" className="nav-icon" />
          <span>Inicio</span>
        </Link>
        
        <Link 
          to="/Dashboard-Users/" 
          className={`nav-link ${isActive('/Dashboard-Users/') ? 'active' : ''}`}
        >
          <Icon name="statistics" className="nav-icon" />
          <span>Analytics</span>
        </Link>
      
      </nav>
    </div>
  );
};

export default Sidebar;