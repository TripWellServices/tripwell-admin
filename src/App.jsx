import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import AdminDashboardChoices from './pages/AdminDashboardChoices';
import AdminUsers from './pages/AdminUsers';
import UserJourney from './pages/UserJourney';
import FunnelTracker from './pages/FunnelTracker';
import AdminMessageCenter from './pages/AdminMessageCenter';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardChoices /></ProtectedRoute>} />
          <Route path="/user-admin" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/user-journey" element={<ProtectedRoute><UserJourney /></ProtectedRoute>} />
          <Route path="/funnel-tracker" element={<ProtectedRoute><FunnelTracker /></ProtectedRoute>} />
          <Route path="/message-center" element={<ProtectedRoute><AdminMessageCenter /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
