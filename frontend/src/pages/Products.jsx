import React, { useState, useEffect } from 'react';
import { getProductsApi, createProductApi, updateProductApi } from '../services/product';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { formatCurrency } from '../utils/formatters';
import { Package, Search, Plus, Edit2, AlertTriangle, Boxes, Tag, Warehouse } from 'lucide-react';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    current_stock: '',
    min_stock_alert: '5',
    location: 'Main Warehouse',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockFilter, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProductsApi({
        search,
        category: categoryFilter,
        low_stock: lowStockFilter,
        page,
        limit: 10,
      });
      setProducts(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    setFormError('');
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        unit_price: product.unit_price !== undefined ? product.unit_price : '',
        current_stock: product.current_stock !== undefined ? product.current_stock : '',
        min_stock_alert: product.min_stock_alert !== undefined ? product.min_stock_alert : '5',
        location: product.location || 'Main Warehouse',
        status: product.status || 'ACTIVE',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        category: '',
        unit_price: '',
        current_stock: '0',
        min_stock_alert: '5',
        location: 'Main Warehouse',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingProduct) {
        await updateProductApi(editingProduct.id, formData);
      } else {
        await createProductApi(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to save product record');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">
            <Package size={24} color="#34d399" /> Product & Catalog Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Maintain product catalog, pricing parameters, and stock thresholds
          </p>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      <div className="glass-panel">
        {/* Toolbar */}
        <div className="toolbar-container">
          <div className="search-input-group">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search product name, SKU code, category, warehouse location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button
            onClick={() => {
              setLowStockFilter(!lowStockFilter);
              setPage(1);
            }}
            className={`btn ${lowStockFilter ? 'btn-danger' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <AlertTriangle size={15} />
            <span>Low Stock Alerts Only</span>
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No products found matching criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock Level</th>
                  <th>Min Alert</th>
                  <th>Warehouse Location</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLowStock = p.current_stock <= p.min_stock_alert;
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{p.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {p.sku}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Tag size={12} /> {p.category}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                        {formatCurrency(p.unit_price)}
                      </td>
                      <td>
                        {isLowStock ? (
                          <span className="badge badge-low-stock">
                            <AlertTriangle size={12} /> {p.current_stock} units (LOW)
                          </span>
                        ) : (
                          <span className="badge badge-active">
                            <Boxes size={12} /> {p.current_stock} units
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{p.min_stock_alert} units</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Warehouse size={13} color="var(--text-muted)" /> {p.location}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {hasRole('ADMIN', 'WAREHOUSE') && (
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Product"
                          >
                            <Edit2 size={14} /> Edit
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

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Product Item'}
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>SKU / Product Code *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="PROD-XXX-001"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Electronics, Peripherals, Accessories"
                required
              />
            </div>

            <div className="form-group">
              <label>Unit Price (INR ₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Current Stock Quantity *</label>
              <input
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Minimum Stock Alert Quantity *</label>
              <input
                type="number"
                min="0"
                value={formData.min_stock_alert}
                onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Warehouse Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Main Warehouse - Bay A1"
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
