import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminHome from './pages/AdminHome.jsx';
import AdminDashboardChoices from './pages/AdminDashboardChoices.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import UserDashboard from './pages/UserDashboard.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/admin-dashboard" element={<AdminDashboardChoices />} />
          <Route path="/user-admin" element={<AdminUsers />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
