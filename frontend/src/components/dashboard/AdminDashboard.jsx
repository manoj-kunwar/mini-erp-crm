import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Package,
  Boxes,
  AlertTriangle,
  FileSpreadsheet,
  FileClock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  History,
  Activity
} from 'lucide-react';

export const AdminDashboard = ({ data }) => {
  const metrics = data?.metrics || {};
  const lowStockProducts = data?.lowStockProducts || [];
  const recentChallans = data?.recentChallans || [];
  const recentMovements = data?.recentMovements || [];
  const overallActivity = data?.overallActivity || {};

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="panel-title" style={{ fontSize: '1.75rem' }}>
            System Administrator Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Complete System Overview & Operations Intelligence
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/challans/create" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Create New Challan</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Customers</span>
            <Users size={18} color="#60a5fa" />
          </div>
          <div className="kpi-value">{metrics.totalCustomers || 0}</div>
          <div className="kpi-subtitle">Active CRM Database</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Products</span>
            <Package size={18} color="#34d399" />
          </div>
          <div className="kpi-value">{metrics.totalProducts || 0}</div>
          <div className="kpi-subtitle">Catalog Items</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Stock Units</span>
            <Boxes size={18} color="#a78bfa" />
          </div>
          <div className="kpi-value">{metrics.totalStockUnits || 0}</div>
          <div className="kpi-subtitle">Across Warehouses</div>
        </div>

        <div
          className="kpi-card"
          style={{
            borderColor: (metrics.lowStockItems || 0) > 0 ? 'rgba(244, 63, 94, 0.4)' : '',
          }}
        >
          <div className="kpi-title">
            <span>Low Stock Items</span>
            <AlertTriangle
              size={18}
              color={(metrics.lowStockItems || 0) > 0 ? '#f87171' : '#34d399'}
            />
          </div>
          <div
            className="kpi-value"
            style={{ color: (metrics.lowStockItems || 0) > 0 ? '#f87171' : '#fff' }}
          >
            {metrics.lowStockItems || 0}
          </div>
          <div className="kpi-subtitle">Requires Reorder</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Challans</span>
            <FileSpreadsheet size={18} color="#38bdf8" />
          </div>
          <div className="kpi-value">{metrics.totalChallans || 0}</div>
          <div className="kpi-subtitle">Sales Orders</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Draft Challans</span>
            <FileClock size={18} color="#fbbf24" />
          </div>
          <div className="kpi-value" style={{ color: '#fbbf24' }}>
            {metrics.draftChallans || 0}
          </div>
          <div className="kpi-subtitle">Pending Confirmation</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Confirmed Challans</span>
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            {metrics.confirmedChallans || 0}
          </div>
          <div className="kpi-subtitle">Dispatched Orders</div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Low Stock Warning Alert Table */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              <AlertTriangle size={18} color="#f87171" /> Low Stock Alerts
            </h3>
            <Link
              to="/inventory"
              style={{
                color: '#60a5fa',
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View Inventory <ArrowRight size={14} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              All products maintain sufficient stock levels.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Min Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: '#fff' }}>{p.name}</strong>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {p.sku}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-low-stock">{p.current_stock} units</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{p.min_stock_alert} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Sales Challans */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              <FileSpreadsheet size={18} color="#38bdf8" /> Recent Sales Challans
            </h3>
            <Link
              to="/challans"
              style={{
                color: '#60a5fa',
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentChallans.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No sales challans recorded.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChallans.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link
                          to={`/challans/${c.id}`}
                          style={{
                            color: '#60a5fa',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                          }}
                        >
                          {c.challan_number}
                        </Link>
                      </td>
                      <td>{c.customer_name || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {formatCurrency(c.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Second Row Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Stock Movements */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              <History size={18} color="#a78bfa" /> Recent Stock Movements
            </h3>
            <Link
              to="/stock-movements"
              style={{
                color: '#60a5fa',
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View Movements <ArrowRight size={14} />
            </Link>
          </div>

          {recentMovements.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No stock movements recorded yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong style={{ color: '#fff' }}>{m.product_name}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${m.movement_type === 'IN' ? 'active' : 'draft'}`}>
                          {m.movement_type}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{m.quantity_changed}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.reason}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatDate(m.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Activity & Metrics Summary */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              <Activity size={18} color="#06b6d4" /> Overall System Activity
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Users</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                {overallActivity.totalUsers || 0}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CRM Accounts</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa' }}>
                {overallActivity.totalCustomers || 0}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Catalog Items</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>
                {overallActivity.totalProducts || 0}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock Movements</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' }}>
                {overallActivity.totalStockMovements || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
