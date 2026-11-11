import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 && localStorage.getItem('token')) { localStorage.removeItem('token'); window.dispatchEvent(new Event('auth-expired')); }
  return Promise.reject(err);
});
export const errMsg = e => e.response?.data?.message || e.message || 'Something went wrong';
export const assetUrl = p => (!p ? '' : p.startsWith('http') ? p : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : '') + p);
export default api;
