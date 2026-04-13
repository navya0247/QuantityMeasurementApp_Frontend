import axios from 'axios';

const BASE = 'https://quantitymeasurementapp-o2tb.onrender.com';

const api = axios.create({ baseURL: BASE });

// Attach JWT to every request automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Auth ──────────────────────────────────────────────────────────
export const signIn   = (email, password)  => api.post('/auth/signin', { email, password });
export const signUp   = (data)             => api.post('/auth/signup',  data);
export const googleAuth = (idToken)        => api.post('/auth/google',  { idToken });

// ── Measurements ──────────────────────────────────────────────────
export const runMeasurement = (action, body, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return axios.post(`${BASE}/measurements/${action}`, body, { headers });
};

export default api;
