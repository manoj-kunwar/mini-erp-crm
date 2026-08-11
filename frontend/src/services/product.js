import { request } from './api';

export const getProductsApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products?${query}`, { method: 'GET' });
};

export const getProductByIdApi = (id) => {
  return request(`/products/${id}`, { method: 'GET' });
};

export const createProductApi = (data) => {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateProductApi = (id, data) => {
  return request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
