import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>Loading Session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#fff' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>Access Denied (403)</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your account role <strong>({user.role})</strong> does not have permission to view this page.
          </p>
          <a href="/dashboard" className="btn btn-primary">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
