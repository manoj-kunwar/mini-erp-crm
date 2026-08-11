import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChallanByIdApi, confirmChallanApi, cancelChallanApi } from '../services/challan';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  FileSpreadsheet,
  Building,
  Printer,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const ChallanDetails = () => {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Confirmation Modal Dialog State
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getChallanByIdApi(id);
      setChallan(res.data);
    } catch (err) {
      console.error('Failed to load challan details:', err);
      setError(err.message || 'Failed to load challan details');
    } finally {
      setLoading(false);
    }
  };

  const executeConfirm = async () => {
    setIsConfirmDialogOpen(false);
    setActionLoading(true);
    setError('');
    try {
      await confirmChallanApi(id);
      fetchChallan();
    } catch (err) {
      setError(err.message || 'Failed to confirm sales challan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const msg = challan.status === 'CONFIRMED'
      ? `Are you sure you want to CANCEL confirmed Challan ${challan.challan_number}? This will RESTORE product stock back to inventory!`
      : `Are you sure you want to CANCEL draft Challan ${challan.challan_number}?`;

    if (!window.confirm(msg)) return;

    setActionLoading(true);
    setError('');
    try {
      await cancelChallanApi(id);
      fetchChallan();
    } catch (err) {
      setError(err.message || 'Failed to cancel sales challan');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading challan document...</div>;
  }

  if (!challan) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-rose)' }}>Challan Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested sales challan ID does not exist.</p>
        <Link to="/challans" className="btn btn-primary">Back to Sales Challans</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/challans" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Sales Challans
        </Link>

        <div className="panel-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="panel-title" style={{ fontSize: '1.6rem', fontFamily: 'var(--font-mono)' }}>
              {challan.challan_number}
            </h1>
            <span className={`badge badge-${challan.status.toLowerCase()}`} style={{ marginTop: '0.35rem' }}>
              Status: {challan.status}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={handlePrint} className="btn btn-secondary">
              <Printer size={18} /> Print Invoice
            </button>

            {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
              <button onClick={() => setIsConfirmDialogOpen(true)} className="btn btn-success" disabled={actionLoading}>
                <CheckCircle2 size={18} /> Confirm & Deduct Stock
              </button>
            )}

            {challan.status !== 'CANCELLED' && hasRole('ADMIN', 'SALES', 'ACCOUNTS') && (
              <button onClick={handleCancel} className="btn btn-danger" disabled={actionLoading}>
                <XCircle size={18} /> Cancel Challan
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert-box alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Printable Invoice Container */}
      <div className="glass-panel" id="printable-challan" style={{ background: 'var(--bg-surface)', padding: '2.5rem' }}>
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div className="nav-brand-logo" style={{ width: '36px', height: '36px' }}>
                <Layers size={20} color="#fff" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                Wholesale Operations Portal
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Official Sales Challan & Delivery Dispatch Document
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
              {challan.challan_number}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Date: <strong style={{ color: '#fff' }}>{formatDate(challan.created_at)}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Generated By: <strong style={{ color: '#fff' }}>{challan.created_by_name || 'Sales Officer'}</strong>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
              BILL TO & DELIVER TO
            </span>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>{customer_business(challan)}</h3>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600 }}>Contact: {challan.customer_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Phone: {challan.customer_mobile || 'N/A'} | Email: {challan.customer_email || 'N/A'}</div>
            {challan.customer_gst && (
              <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                GSTIN: {challan.customer_gst}
              </div>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
              CHALLAN DETAILS
            </span>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>Status: <span className={`badge badge-${challan.status.toLowerCase()}`}>{challan.status}</span></div>
              <div>Dispatch Address: {challan.customer_address || 'Main Delivery Address'}</div>
              <div>Timestamp: {formatDateTime(challan.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Product Snapshot Table */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={18} color="#38bdf8" /> Product Snapshot Line Items
        </h3>

        <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Description</th>
                <th>SKU Code</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {challan.items && challan.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                  <td>
                    <strong style={{ color: '#fff' }}>{item.product_name}</strong>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{item.sku}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(item.unit_price)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>{item.quantity} units</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', textAlign: 'right' }}>
                    {formatCurrency(item.unit_price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '320px', background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Total Quantity Dispatched:</span>
              <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{challan.total_quantity} units</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#fff', borderTop: '1px dashed var(--border-color)', paddingTop: '0.65rem', marginTop: '0.5rem' }}>
              <span>Grand Total:</span>
              <span style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{formatCurrency(challan.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      <Modal
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        title="Confirm Challan?"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <AlertTriangle size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Confirm Challan #{challan.challan_number}?
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Confirming this challan will check current stock availability and reduce inventory stock immediately.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => setIsConfirmDialogOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={executeConfirm} className="btn btn-success">
              Confirm & Deduct Stock
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const customer_business = (c) => {
  if (c.customer_business_name) return c.customer_business_name;
  return c.customer_name || 'Valued Client';
};
