import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 8000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    if (status === 401 && !requestUrl.includes('/auth/login')) {
      localStorage.removeItem('rf_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login?session=expired');
      }
    }
    return Promise.reject(error);
  },
);
