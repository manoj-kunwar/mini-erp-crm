import { request } from './api';

export const getDashboardApi = () => {
  return request('/dashboard', { method: 'GET' });
};

export const getRoleDashboardApi = (role) => {
  return request(`/dashboard/${role.toLowerCase()}`, { method: 'GET' });
};
