import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomersApi, createCustomerApi, updateCustomerApi, deleteCustomerApi } from '../services/customer';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { formatDate } from '../utils/formatters';
import { Users, Search, Plus, Eye, Edit2, Trash2, Calendar, Phone, Mail, Building } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    business_name: '',
    gst_number: '',
    customer_type: 'Wholesale',
    address: '',
    status: 'Lead',
    follow_up_date: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomersApi({
        search,
        status: statusFilter,
        customer_type: typeFilter,
        page,
        limit: 10,
      });
      setCustomers(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    setFormError('');
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        business_name: customer.business_name || '',
        gst_number: customer.gst_number || '',
        customer_type: customer.customer_type || 'Wholesale',
        address: customer.address || '',
        status: customer.status || 'Lead',
        follow_up_date: customer.follow_up_date ? customer.follow_up_date.split('T')[0] : '',
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        business_name: '',
        gst_number: '',
        customer_type: 'Wholesale',
        address: '',
        status: 'Lead',
        follow_up_date: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingCustomer) {
        await updateCustomerApi(editingCustomer.id, formData);
      } else {
        await createCustomerApi(formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setFormError(err.message || 'Failed to save customer record');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer '${name}'?`)) {
      try {
        await deleteCustomerApi(id);
        fetchCustomers();
      } catch (err) {
        alert(err.message || 'Failed to delete customer');
      }
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">
            <Users size={24} color="#60a5fa" /> Customer CRM Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage Leads, Wholesale Clients, and CRM Follow-up Schedules
          </p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus size={18} /> Add New Customer
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
              placeholder="Search by Name, Business, Phone, Email, GST..."
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
            <option value="">All Customer Types</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading customer records...
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No customer records found matching filter criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer / Business</th>
                  <th>Contact Info</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                        {c.name}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building size={12} /> {c.business_name}
                      </div>
                      {c.gst_number && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          GST: {c.gst_number}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={13} color="var(--text-muted)" /> {c.mobile}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} /> {c.email}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{c.customer_type}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.follow_up_date ? (
                        <span style={{ fontSize: '0.85rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} /> {formatDate(c.follow_up_date)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/customers/${c.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Customer Details & Timeline"
                        >
                          <Eye size={14} />
                        </Link>
                        {hasRole('ADMIN', 'SALES') && (
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Customer"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {hasRole('ADMIN') && (
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="btn btn-danger btn-sm"
                            title="Delete Customer"
                          >
                            <Trash2 size={14} />
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Record' : 'Add New Customer'}
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                placeholder="27XXXXX12341Z5"
              />
            </div>

            <div className="form-group">
              <label>Customer Type</label>
              <select
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Initial Follow-up Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Record details about sales lead discussion..."
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
