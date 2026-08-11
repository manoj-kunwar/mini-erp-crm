import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCustomersApi } from '../services/customer';
import { getProductsApi } from '../services/product';
import { createChallanApi } from '../services/challan';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Plus, Trash2, AlertTriangle, FileSpreadsheet, CheckCircle2, Save } from 'lucide-react';

export const CreateChallan = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState([
    { product_id: '', quantity: 1, available_stock: 0, unit_price: 0, product_name: '', sku: '' },
  ]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        getCustomersApi({ limit: 100 }),
        getProductsApi({ limit: 100 }),
      ]);
      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Failed to load customers or products:', err);
      setError('Failed to load products and customers dropdown list.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index, productId) => {
    const selectedProd = products.find((p) => String(p.id) === String(productId));
    const newItems = [...items];

    if (selectedProd) {
      newItems[index] = {
        ...newItems[index],
        product_id: selectedProd.id,
        product_name: selectedProd.name,
        sku: selectedProd.sku,
        unit_price: Number(selectedProd.unit_price) || 0,
        available_stock: Number(selectedProd.current_stock) || 0,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        product_id: '',
        product_name: '',
        sku: '',
        unit_price: 0,
        available_stock: 0,
      };
    }

    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const newItems = [...items];
    const val = Math.max(1, parseInt(qty, 10) || 1);
    newItems[index].quantity = val;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: '', quantity: 1, available_stock: 0, unit_price: 0, product_name: '', sku: '' },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);
  };

  // Calculations
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

  const handleSubmit = async (e, statusChoice) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].product_id) {
        setError(`Please select a product for item line ${i + 1}`);
        return;
      }
    }

    setSubmitLoading(true);

    try {
      const payload = {
        customer_id: Number(selectedCustomerId),
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
        })),
        status: statusChoice,
      };

      const res = await createChallanApi(payload);
      if (res.success && res.data) {
        navigate(`/challans/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate Sales Challan');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading form data...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/challans" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Sales Challans
        </Link>
        <div className="panel-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="panel-title" style={{ fontSize: '1.6rem' }}>
              <FileSpreadsheet size={24} color="#38bdf8" /> Create New Sales Challan
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select Customer, Add Line Products, calculate totals, and Save as Draft or Confirm Immediately
            </p>
          </div>
        </div>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}

      <form onSubmit={(e) => handleSubmit(e, 'DRAFT')}>
        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <h3 className="panel-title" style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            1. Select Customer Account
          </h3>

          <div className="form-group" style={{ maxWidth: '500px' }}>
            <label>Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              <option value="">-- Select Customer / Business --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.business_name}) — {c.customer_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Items Table Builder */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ fontSize: '1.1rem' }}>
              2. Add Product Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={16} /> Add Product Line
            </button>
          </div>

          <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Product Selection</th>
                  <th>Unit Price</th>
                  <th>Available Stock</th>
                  <th>Quantity</th>
                  <th>Line Total</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isStockInsufficient = item.product_id && item.quantity > item.available_stock;
                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          required
                          style={{ width: '100%' }}
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} [{p.sku}] (Stock: {p.current_stock})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td>
                        {item.product_id ? (
                          <span className={`badge ${item.available_stock <= 0 ? 'badge-cancelled' : 'badge-active'}`}>
                            {item.available_stock} units
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          style={{ width: '90px', padding: '0.4rem 0.6rem' }}
                          required
                        />
                        {isStockInsufficient && (
                          <div style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
                            <AlertTriangle size={12} /> Stock Insufficient!
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      <td>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="btn btn-danger btn-sm"
                            title="Remove Line"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown Card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div style={{ width: '320px', background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span>Total Items Quantity:</span>
                <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{totalQuantity} units</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#fff', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              className="btn btn-secondary"
              disabled={submitLoading}
            >
              <Save size={18} /> Save as Draft (No Stock Reduction)
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'CONFIRMED')}
              className="btn btn-success"
              disabled={submitLoading}
            >
              <CheckCircle2 size={18} /> Confirm Challan (Deduct Stock)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
