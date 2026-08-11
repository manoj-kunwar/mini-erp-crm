import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getDashboardApi } from '../services/dashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { SalesDashboard } from '../components/dashboard/SalesDashboard';
import { WarehouseDashboard } from '../components/dashboard/WarehouseDashboard';
import { AccountsDashboard } from '../components/dashboard/AccountsDashboard';

export const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoleDashboard();
  }, [user?.role]);

  const fetchRoleDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardApi();
      if (res.success && res.data) {
        setDashboardData(res.data);
      } else {
        setError(res.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="badge badge-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
          Loading {user?.role || 'ERP'} Dashboard Intelligence...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ margin: '2rem auto', maxWidth: '600px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--accent-rose)', marginBottom: '0.75rem' }}>Dashboard Error</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={fetchRoleDashboard} className="btn btn-primary">
          Retry Loading
        </button>
      </div>
    );
  }

  // Render role-specific dashboard layout
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard data={dashboardData} />;
    case 'SALES':
      return <SalesDashboard data={dashboardData} />;
    case 'WAREHOUSE':
      return <WarehouseDashboard data={dashboardData} />;
    case 'ACCOUNTS':
      return <AccountsDashboard data={dashboardData} />;
    default:
      return <AdminDashboard data={dashboardData} />;
  }
};
