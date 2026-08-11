import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChallansApi, confirmChallanApi, cancelChallanApi } from '../services/challan';
import { useAuth } from '../hooks/useAuth';
import { Pagination } from '../components/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FileSpreadsheet, Search, PlusCircle, Eye, CheckCircle2, XCircle, Building, UserCheck } from 'lucide-react';

export const Challans = () => {
  const [challans, setChallans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter, page]);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await getChallansApi({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });
      setChallans(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id, number) => {
    if (window.confirm(`Are you sure you want to CONFIRM Challan ${number}? This will verify available stock and deduct it immediately.`)) {
      try {
        await confirmChallanApi(id);
        fetchChallans();
      } catch (err) {
        alert(err.message || 'Failed to confirm challan');
      }
    }
  };

  const handleCancel = async (id, number, status) => {
    const confirmMsg = status === 'CONFIRMED'
      ? `Are you sure you want to CANCEL confirmed Challan ${number}? This will RESTORE product stock!`
      : `Are you sure you want to CANCEL draft Challan ${number}?`;

    if (window.confirm(confirmMsg)) {
      try {
        await cancelChallanApi(id);
        fetchChallans();
      } catch (err) {
        alert(err.message || 'Failed to cancel challan');
      }
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">
            <FileSpreadsheet size={24} color="#38bdf8" /> Sales Challans & Dispatch Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Draft, Confirm, and Track Wholesale Sales Challans and Stock Allocations
          </p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Link to="/challans/create" className="btn btn-primary">
            <PlusCircle size={18} /> Create New Challan
          </Link>
        )}
      </div>

      <div className="glass-panel">
        {/* Toolbar */}
        <div className="toolbar-container">
          <div className="search-input-group">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by Challan #, Customer Name, Business Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading sales challans...
          </div>
        ) : challans.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No sales challans found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Challan Number</th>
                  <th>Customer & Business</th>
                  <th>Total Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/challans/${c.id}`} style={{ color: '#60a5fa', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {c.challan_number}
                      </Link>
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{c.customer_name || 'N/A'}</strong>
                      {c.customer_business_name && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building size={12} /> {c.customer_business_name}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.total_quantity} items</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>{formatCurrency(c.total_amount)}</td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <UserCheck size={13} color="var(--text-muted)" /> {c.created_by_name || 'Sales Exec'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/challans/${c.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Details & Print Invoice"
                        >
                          <Eye size={14} />
                        </Link>
                        {c.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
                          <button
                            onClick={() => handleConfirm(c.id, c.challan_number)}
                            className="btn btn-success btn-sm"
                            title="Confirm Challan & Deduct Stock"
                          >
                            <CheckCircle2 size={14} /> Confirm
                          </button>
                        )}
                        {c.status !== 'CANCELLED' && hasRole('ADMIN', 'SALES', 'ACCOUNTS') && (
                          <button
                            onClick={() => handleCancel(c.id, c.challan_number, c.status)}
                            className="btn btn-danger btn-sm"
                            title="Cancel Challan"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
};
