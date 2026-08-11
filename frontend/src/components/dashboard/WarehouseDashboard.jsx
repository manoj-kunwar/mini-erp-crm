import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  ArrowRight
} from 'lucide-react';

export const WarehouseDashboard = ({ data }) => {
  const metrics = data?.metrics || {};
  const lowStockProducts = data?.lowStockProducts || [];
  const recentMovements = data?.recentMovements || [];

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="panel-title" style={{ fontSize: '1.75rem' }}>
            Warehouse & Inventory Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-Time Stock Movement & Catalog Inventory Management
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/inventory" className="btn btn-secondary">
            <Boxes size={18} />
            <span>Manage Inventory</span>
          </Link>
          <Link to="/stock-movements" className="btn btn-primary">
            <History size={18} />
            <span>Record Stock Movement</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
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
          <div className="kpi-subtitle">Units in Storage</div>
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
          <div className="kpi-subtitle">Below Minimum Threshold</div>
        </div>

        <div
          className="kpi-card"
          style={{
            borderColor: (metrics.outOfStockItems || 0) > 0 ? 'rgba(244, 63, 94, 0.6)' : '',
          }}
        >
          <div className="kpi-title">
            <span>Out of Stock Items</span>
            <XCircle
              size={18}
              color={(metrics.outOfStockItems || 0) > 0 ? '#f43f5e' : '#34d399'}
            />
          </div>
          <div
            className="kpi-value"
            style={{ color: (metrics.outOfStockItems || 0) > 0 ? '#f43f5e' : '#fff' }}
          >
            {metrics.outOfStockItems || 0}
          </div>
          <div className="kpi-subtitle">Zero Inventory Units</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Stock Received (IN)</span>
            <ArrowDownRight size={18} color="#34d399" />
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            +{metrics.recentStockIn || 0}
          </div>
          <div className="kpi-subtitle">Total Units Imported</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Stock Dispatched (OUT)</span>
            <ArrowUpRight size={18} color="#f87171" />
          </div>
          <div className="kpi-value" style={{ color: '#f87171' }}>
            -{metrics.recentStockOut || 0}
          </div>
          <div className="kpi-subtitle">Total Units Dispatched</div>
        </div>
      </div>

      {/* Tables Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Low Stock / Out of Stock Table */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              <AlertTriangle size={18} color="#f87171" /> Low & Out of Stock Products
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
              All product inventories are well-stocked.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Current Stock</th>
                    <th>Min Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: '#fff' }}>{p.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.location}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {p.sku}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {p.current_stock}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {p.min_stock_alert}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            p.current_stock === 0 ? 'badge-cancelled' : 'badge-low-stock'
                          }`}
                        >
                          {p.current_stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {m.sku}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-${m.movement_type === 'IN' ? 'active' : 'draft'}`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {m.quantity_changed}
                      </td>
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
      </div>
    </div>
  );
};
