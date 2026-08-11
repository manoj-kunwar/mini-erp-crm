import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User as UserIcon, Shield, Layers } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-role';
      case 'SALES': return 'badge-active';
      case 'WAREHOUSE': return 'badge-lead';
      case 'ACCOUNTS': return 'badge-draft';
      default: return 'badge-secondary';
    }
  };

  return (
    <header className="top-navbar">
      <div className="nav-brand">
        <div className="nav-brand-logo">
          <Layers size={20} color="#fff" />
        </div>
        <div>
          <span>Mini ERP + CRM</span>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontWeight: 400 }}>
            Operations Portal
          </span>
        </div>
      </div>

      <div className="user-profile-menu">
        {user && (
          <>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <div className="user-avatar" title={`${user.name} (${user.role})`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              title="Logout"
              style={{ marginLeft: '0.5rem' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
