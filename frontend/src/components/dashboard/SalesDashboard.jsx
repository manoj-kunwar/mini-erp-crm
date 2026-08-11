import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  UserCheck,
  FileSpreadsheet,
  FileClock,
  CheckCircle2,
  Calendar,
  PlusCircle,
  ArrowRight,
  PhoneCall
} from 'lucide-react';

export const SalesDashboard = ({ data }) => {
  const metrics = data?.metrics || {};
  const recentCustomers = data?.recentCustomers || [];
  const recentChallans = data?.recentChallans || [];
  const customerFollowups = data?.customerFollowups || [];

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="panel-title" style={{ fontSize: '1.75rem' }}>
            Sales & CRM Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Customer Relationship Management & Sales Order Pipeline
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/customers" className="btn btn-secondary">
            <Users size={18} />
            <span>Manage Customers</span>
          </Link>
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
          <div className="kpi-subtitle">Registered Accounts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Active Customers</span>
            <UserCheck size={18} color="#34d399" />
          </div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            {metrics.activeCustomers || 0}
          </div>
          <div className="kpi-subtitle">Active Trading Partners</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Challans</span>
            <FileSpreadsheet size={18} color="#38bdf8" />
          </div>
          <div className="kpi-value">{metrics.totalChallans || 0}</div>
          <div className="kpi-subtitle">Sales Orders Created</div>
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
          <div className="kpi-subtitle">Fulfilled & Finalized</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Pending Follow-ups</span>
            <Calendar size={18} color="#a78bfa" />
          </div>
          <div className="kpi-value" style={{ color: '#a78bfa' }}>
            {metrics.pendingFollowups || 0}
          </div>
          <div className="kpi-subtitle">Scheduled Interactions</div>
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
        {/* Recent Customers Table */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              <Users size={18} color="#60a5fa" /> Recent Customers
            </h3>
            <Link
              to="/customers"
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

          {recentCustomers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No customers found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Business</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link
                          to={`/customers/${c.id}`}
                          style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {c.name}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.mobile}
                        </div>
                      </td>
                      <td style={{ color: '#fff' }}>{c.business_name}</td>
                      <td>
                        <span className="badge badge-secondary">{c.customer_type}</span>
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
              No sales challans created yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total Amount</th>
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

      {/* Customer Followups Section */}
      <div className="glass-panel">
        <div className="panel-header">
          <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
            <PhoneCall size={18} color="#a78bfa" /> Customer Follow-ups & Touchpoints
          </h3>
        </div>

        {customerFollowups.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No upcoming customer follow-up notes logged.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Interaction Note</th>
                  <th>Scheduled Follow-up Date</th>
                  <th>Log Date</th>
                </tr>
              </thead>
              <tbody>
                {customerFollowups.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <Link
                        to={`/customers/${f.customer_id}`}
                        style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {f.customer_name || `Customer #${f.customer_id}`}
                      </Link>
                      {f.business_name && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {f.business_name}
                        </div>
                      )}
                    </td>
                    <td style={{ color: '#fff', fontSize: '0.9rem' }}>{f.note}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {f.follow_up_date ? (
                        <span className="badge badge-draft">{formatDate(f.follow_up_date)}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not Scheduled</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(f.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
