import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import GroupsPage from './pages/GroupsPage';
import AttendancePage from './pages/AttendancePage';
import PaymentsPage from './pages/PaymentsPage';
import MarketingPage from './pages/MarketingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from './components/ui/Toast';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/marketing" element={<MarketingPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;