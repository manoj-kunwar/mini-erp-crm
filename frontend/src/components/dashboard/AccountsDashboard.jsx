import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileSpreadsheet,
  CheckCircle2,
  FileClock,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
  PieChart
} from 'lucide-react';

export const AccountsDashboard = ({ data }) => {
  const metrics = data?.metrics || {};
  const recentChallans = data?.recentChallans || [];
  const financialSummary = data?.financialSummary || {};

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="panel-title" style={{ fontSize: '1.75rem' }}>
            Accounts & Finance Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sales Challan Auditing & Revenue Tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/challans" className="btn btn-primary">
            <FileSpreadsheet size={18} />
            <span>Manage Sales Challans</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Challans</span>
            <FileSpreadsheet size={18} color="#38bdf8" />
          </div>
          <div className="kpi-value">{metrics.totalChallans || 0}</div>
          <div className="kpi-subtitle">Total Sales Invoices</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Confirmed Challans</span>
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            {metrics.confirmedChallans || 0}
          </div>
          <div className="kpi-subtitle">Finalized Invoices</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Pending Drafts</span>
            <FileClock size={18} color="#fbbf24" />
          </div>
          <div className="kpi-value" style={{ color: '#fbbf24' }}>
            {metrics.pendingChallans || 0}
          </div>
          <div className="kpi-subtitle">Awaiting Confirmation</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Sales Value</span>
            <DollarSign size={18} color="#60a5fa" />
          </div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: '#60a5fa' }}>
            {formatCurrency(metrics.totalSalesAmount || 0)}
          </div>
          <div className="kpi-subtitle">Cumulative Order Value</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Confirmed Revenue</span>
            <TrendingUp size={18} color="#34d399" />
          </div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: '#34d399' }}>
            {formatCurrency(metrics.confirmedAmount || 0)}
          </div>
          <div className="kpi-subtitle">Confirmed Orders</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Pending Value</span>
            <Clock size={18} color="#fbbf24" />
          </div>
          <div className="kpi-value" style={{ fontSize: '1.5rem', color: '#fbbf24' }}>
            {formatCurrency(metrics.pendingAmount || 0)}
          </div>
          <div className="kpi-subtitle">Draft Orders Value</div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Recent Sales Challans Table */}
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
              View All Challans <ArrowRight size={14} />
            </Link>
          </div>

          {recentChallans.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No sales challans found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
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
                      <td>
                        <strong style={{ color: '#fff' }}>{c.customer_name || 'N/A'}</strong>
                        {c.business_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {c.business_name}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatDate(c.created_at)}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>
                        {formatCurrency(c.total_amount)}
                      </td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Financial Summary Card */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              <PieChart size={18} color="#06b6d4" /> Financial Summary
            </h3>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Total Sales Revenue
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                {formatCurrency(financialSummary.totalSales || 0)}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(52, 211, 153, 0.05)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(52, 211, 153, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#34d399', marginBottom: '0.25rem' }}>
                Confirmed Amount
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>
                {formatCurrency(financialSummary.confirmedAmount || 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Finalized sales order values
              </div>
            </div>

            <div
              style={{
                background: 'rgba(251, 191, 36, 0.05)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#fbbf24', marginBottom: '0.25rem' }}>
                Pending / Draft Amount
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
                {formatCurrency(financialSummary.pendingAmount || 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Awaiting final confirmation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
