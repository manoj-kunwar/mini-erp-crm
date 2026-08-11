import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  PlusCircle,
  History
} from 'lucide-react';

export const Sidebar = () => {
  const { hasRole } = useAuth();

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      title: 'Customers CRM',
      path: '/customers',
      icon: <Users size={18} />,
      roles: ['ADMIN', 'SALES'],
    },
    {
      title: 'Products',
      path: '/products',
      icon: <Package size={18} />,
      roles: ['ADMIN', 'WAREHOUSE'],
    },
    {
      title: 'Inventory',
      path: '/inventory',
      icon: <Boxes size={18} />,
      roles: ['ADMIN', 'WAREHOUSE'],
    },
    {
      title: 'Stock Movements',
      path: '/stock-movements',
      icon: <History size={18} />,
      roles: ['ADMIN', 'WAREHOUSE'],
    },
    {
      title: 'Sales Challans',
      path: '/challans',
      icon: <FileSpreadsheet size={18} />,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
    },
    {
      title: 'Create Challan',
      path: '/challans/create',
      icon: <PlusCircle size={18} />,
      roles: ['ADMIN', 'SALES'],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span
          style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          MAIN MENU
        </span>
      </div>
      <ul className="sidebar-menu">
        {navItems
          .filter((item) => hasRole(...item.roles))
          .map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
      </ul>
    </aside>
  );
};
