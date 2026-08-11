import { request } from './api';

export const getStockMovementsApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/stock/movements?${query}`, { method: 'GET' });
};

export const recordStockMovementApi = (data) => {
  return request('/stock/movements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
