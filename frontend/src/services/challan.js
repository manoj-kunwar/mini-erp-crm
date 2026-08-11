import { request } from './api';

export const getChallansApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/challans?${query}`, { method: 'GET' });
};

export const getChallanByIdApi = (id) => {
  return request(`/challans/${id}`, { method: 'GET' });
};

export const createChallanApi = (data) => {
  return request('/challans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateChallanApi = (id, data) => {
  return request(`/challans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const confirmChallanApi = (id) => {
  return request(`/challans/${id}/confirm`, {
    method: 'POST',
  });
};

export const cancelChallanApi = (id) => {
  return request(`/challans/${id}/cancel`, {
    method: 'POST',
  });
};
