import { request } from './api';

export const getCustomersApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/customers?${query}`, { method: 'GET' });
};

export const getCustomerByIdApi = (id) => {
  return request(`/customers/${id}`, { method: 'GET' });
};

export const createCustomerApi = (data) => {
  return request('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCustomerApi = (id, data) => {
  return request(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCustomerApi = (id) => {
  return request(`/customers/${id}`, { method: 'DELETE' });
};

export const addFollowupNoteApi = (id, noteData) => {
  return request(`/customers/${id}/followups`, {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
};
