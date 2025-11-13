// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardBase from './views/dashboardBase.jsx';
import DashboardForUsers from './views/dashboardForUsers.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta por defecto va a DashboardBase */}
          <Route path="/" element={<Navigate to="/Dashboard-bicentenario/" replace />} />
          
          {/* Dashboard principal con sidebar */}
          <Route path="/Dashboard-bicentenario/" element={<DashboardBase />} />
          
          {/* Dashboard para usuarios (vista de analytics) */}
          <Route path="/Dashboard-Users/" element={<DashboardForUsers />} />
          
          {/* Ruta de fallback */}
          <Route path="*" element={<Navigate to="/Dashboard-bicentenario/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;