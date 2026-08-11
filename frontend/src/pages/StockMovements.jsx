import React, { useState, useEffect } from 'react';
import { getStockMovementsApi } from '../services/stock';
import { Pagination } from '../components/Pagination';
import { formatDateTime } from '../utils/formatters';
import { History, Search, ArrowDownRight, ArrowUpRight, UserCheck } from 'lucide-react';

export const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMovements();
  }, [search, typeFilter, page]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await getStockMovementsApi({
        search,
        movement_type: typeFilter,
        page,
        limit: 15,
      });
      setMovements(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">
            <History size={24} color="#8b5cf6" /> Stock Movement Log & Audit Trail
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Complete historical record of all Stock IN and Stock OUT transactions
          </p>
        </div>
      </div>

      <div className="glass-panel">
        {/* Toolbar */}
        <div className="toolbar-container">
          <div className="search-input-group">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search product, SKU, reason note, or user name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Movement Types</option>
            <option value="IN">Stock IN</option>
            <option value="OUT">Stock OUT</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading stock movement log...
          </div>
        ) : movements.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No stock movements found matching filter criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product & SKU</th>
                  <th>Movement Type</th>
                  <th>Quantity Changed</th>
                  <th>Reason / Reference</th>
                  <th>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatDateTime(m.timestamp)}
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{m.product_name || `Product #${m.product_id}`}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {m.sku || 'N/A'}
                      </div>
                    </td>
                    <td>
                      {m.movement_type === 'IN' ? (
                        <span className="badge badge-in">
                          <ArrowDownRight size={12} /> Stock IN
                        </span>
                      ) : (
                        <span className="badge badge-out">
                          <ArrowUpRight size={12} /> Stock OUT
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: m.movement_type === 'IN' ? '#34d399' : '#f87171' }}>
                      {m.movement_type === 'IN' ? `+${m.quantity_changed}` : `-${m.quantity_changed}`} units
                    </td>
                    <td style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{m.reason}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <UserCheck size={13} color="var(--text-muted)" /> {m.created_by_name || 'System'}
                      </span>
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
