import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthContext';
import SignInScreen from './auth/SignInScreen';
import OAuthCallback from './auth/OAuthCallback';

import DashboardCallback from './auth/DashboardCallback';
import AuthErrorCallback from './auth/AuthErrorCallback';
import AuthSuccessCallback from './auth/AuthSuccessCallback';
import Dashboard from './Dashboard';

const AuthApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Authentication routes */}
      <Route path="/signin" element={!isAuthenticated ? <SignInScreen /> : <Navigate to="/" />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      
      <Route path="/dashboard-callback" element={<DashboardCallback />} />
      <Route path="/auth-error" element={<AuthErrorCallback />} />
      <Route path="/auth-success" element={<AuthSuccessCallback />} />
      
      {/* Main app route */}
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/signin"} />} />
    </Routes>
  );
};

export default AuthApp;