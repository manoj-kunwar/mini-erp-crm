import React, { useState, useEffect } from 'react';
import { getProductsApi } from '../services/product';
import { recordStockMovementApi } from '../services/stock';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';
import { formatCurrency } from '../utils/formatters';
import { Boxes, ArrowUpRight, ArrowDownRight, AlertTriangle, PlusCircle, Search, Warehouse } from 'lucide-react';

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Record Stock Movement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState('IN');
  const [quantityChanged, setQuantityChanged] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getProductsApi({ search, limit: 100 });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load inventory stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMovementModal = (product) => {
    setSelectedProduct(product);
    setMovementType('IN');
    setQuantityChanged('');
    setReason('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleRecordMovement = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await recordStockMovementApi({
        product_id: selectedProduct.id,
        quantity_changed: Number(quantityChanged),
        movement_type: movementType,
        reason: reason.trim(),
      });
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      setFormError(err.message || 'Failed to record stock movement');
    } finally {
      setFormLoading(false);
    }
  };

  const totalStockCount = products.reduce((sum, p) => sum + (Number(p.current_stock) || 0), 0);
  const lowStockItems = products.filter((p) => p.current_stock <= p.min_stock_alert);

  return (
    <div>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">
            <Boxes size={24} color="#a78bfa" /> Real-time Warehouse Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitor Stock Levels, Reserve Balances, and Record Stock IN/OUT Movements
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Units in Stock</span>
            <Boxes size={18} color="#a78bfa" />
          </div>
          <div className="kpi-value">{totalStockCount}</div>
          <div className="kpi-subtitle">Across {products.length} Products</div>
        </div>

        <div className="kpi-card" style={{ borderColor: lowStockItems.length > 0 ? 'rgba(244, 63, 94, 0.4)' : '' }}>
          <div className="kpi-title">
            <span>Low Stock Reorders</span>
            <AlertTriangle size={18} color={lowStockItems.length > 0 ? '#f87171' : '#34d399'} />
          </div>
          <div className="kpi-value" style={{ color: lowStockItems.length > 0 ? '#f87171' : '#fff' }}>
            {lowStockItems.length}
          </div>
          <div className="kpi-subtitle">Below Threshold</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel">
        <div className="toolbar-container">
          <div className="search-input-group">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search product name, SKU code, warehouse bay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading inventory items...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Stock Indicator</th>
                  <th>Location</th>
                  <th style={{ textAlign: 'right' }}>Record Movement</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLowStock = p.current_stock <= p.min_stock_alert;
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: '#fff' }}>{p.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {p.sku}
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(p.unit_price)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: isLowStock ? '#f87171' : '#34d399' }}>
                        {p.current_stock}
                      </td>
                      <td>
                        {isLowStock ? (
                          <span className="badge badge-low-stock">
                            <AlertTriangle size={12} /> LOW STOCK ({p.current_stock}/{p.min_stock_alert})
                          </span>
                        ) : (
                          <span className="badge badge-active">
                            HEALTHY STOCK
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Warehouse size={13} /> {p.location}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {hasRole('ADMIN', 'WAREHOUSE') && (
                          <button
                            onClick={() => handleOpenMovementModal(p)}
                            className="btn btn-secondary btn-sm"
                          >
                            <PlusCircle size={14} /> Adjust Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? `Adjust Stock for '${selectedProduct.name}'` : 'Record Stock Movement'}
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}

        {selectedProduct && (
          <form onSubmit={handleRecordMovement} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Product SKU: {selectedProduct.sku}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedProduct.name}</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.35rem', color: 'var(--text-light)' }}>
                Current Available Stock: <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>{selectedProduct.current_stock} units</strong>
              </div>
            </div>

            <div className="form-group">
              <label>Movement Type *</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`btn ${movementType === 'IN' ? 'btn-success' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  <ArrowDownRight size={16} /> Stock IN (Add Stock)
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  className={`btn ${movementType === 'OUT' ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                >
                  <ArrowUpRight size={16} /> Stock OUT (Reduce Stock)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Quantity Changed *</label>
              <input
                type="number"
                min="1"
                value={quantityChanged}
                onChange={(e) => setQuantityChanged(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group">
              <label>Reason / Reference Note *</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Purchase Shipment #882, Damage Write-off, Inventory Audit"
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: 0 }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Recording...' : `Execute Stock ${movementType}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
