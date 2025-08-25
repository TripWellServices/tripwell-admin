import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminHome from './pages/AdminHome.jsx';
import AdminDashboardChoices from './pages/AdminDashboardChoices.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminMessageCenter from './pages/AdminMessageCenter.jsx';
import UserJourney from './pages/UserJourney.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<AdminHome />} />
                           <Route path="/admin-dashboard" element={<AdminDashboardChoices />} />
                 <Route path="/user-admin" element={<AdminUsers />} />
                 <Route path="/message-center" element={<AdminMessageCenter />} />
                 <Route path="/user-journey" element={<UserJourney />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
