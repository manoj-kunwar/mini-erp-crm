import { request } from './api';

export const loginApi = (username, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const getMeApi = () => {
  return request('/auth/me', {
    method: 'GET',
  });
};
