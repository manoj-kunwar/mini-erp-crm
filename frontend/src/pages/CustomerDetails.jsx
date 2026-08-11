import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerByIdApi, addFollowupNoteApi } from '../services/customer';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  FileText,
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle,
  UserCheck
} from 'lucide-react';

export const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Follow-up note form state
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState('');

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const res = await getCustomerByIdApi(id);
      setCustomer(res.data);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    setNoteError('');
    setNoteLoading(true);

    try {
      await addFollowupNoteApi(id, {
        note: note.trim(),
        follow_up_date: followUpDate || null,
      });
      setNote('');
      setFollowUpDate('');
      fetchCustomerDetails();
    } catch (err) {
      setNoteError(err.message || 'Failed to add follow-up note');
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer record...</div>;
  }

  if (!customer) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-rose)' }}>Customer Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested customer ID does not exist.</p>
        <Link to="/customers" className="btn btn-primary">Back to Customers</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/customers" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Customer List
        </Link>
        <div className="panel-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="panel-title" style={{ fontSize: '1.6rem' }}>
              {customer.name}
            </h1>
            <span className={`badge badge-${customer.status.toLowerCase()}`} style={{ marginTop: '0.35rem' }}>
              {customer.status} Lead / Client
            </span>
          </div>
          <div>
            <span className="badge badge-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
              {customer.customer_type}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Customer Information Card */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <h3 className="panel-title" style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Building size={18} color="#60a5fa" /> Customer & Business Info
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.925rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Business Name</span>
              <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{customer.business_name}</strong>
            </div>

            {customer.gst_number && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>GST Number</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{customer.gst_number}</span>
              </div>
            )}

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Mobile Contact</span>
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} color="var(--text-muted)" /> {customer.mobile}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} color="var(--text-muted)" /> {customer.email}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Address</span>
              <span style={{ color: 'var(--text-light)' }}>{customer.address || 'No address specified'}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Current Follow-up Schedule</span>
              <span style={{ color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} /> {formatDate(customer.follow_up_date)}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Assigned Executive</span>
              <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={14} /> {customer.created_by_name || 'System Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* CRM Follow-up Timeline & Add Note */}
        <div className="glass-panel">
          <h3 className="panel-title" style={{ fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <FileText size={18} color="#34d399" /> CRM Follow-up History & Activity
          </h3>

          {/* Add Followup Note Form */}
          {hasRole('ADMIN', 'SALES') && (
            <form onSubmit={handleAddNote} style={{ marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PlusCircle size={16} color="#60a5fa" /> Record New Follow-up Note
              </h4>

              {noteError && <div className="alert-box alert-danger">{noteError}</div>}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Discussion / Action Note *</label>
                <textarea
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record summary of call, client requirement, or pricing quote..."
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label>Next Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={noteLoading}>
                  {noteLoading ? 'Saving...' : 'Add Note & Update Date'}
                </button>
              </div>
            </form>
          )}

          {/* Timeline List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(!customer.followups || customer.followups.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No CRM follow-up notes recorded yet.
              </p>
            ) : (
              customer.followups.map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: '3px solid var(--primary-500)',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                      {f.created_by_name || 'Sales Representative'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {formatDateTime(f.created_at)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                    {f.note}
                  </p>
                  {f.follow_up_date && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} /> Next scheduled follow-up: {formatDate(f.follow_up_date)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
