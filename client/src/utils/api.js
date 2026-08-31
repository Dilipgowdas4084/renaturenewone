import axios from 'axios';
import { getValidAccessToken, storeTokens, clearTokens } from './auth';

const API_BASE = 'http://localhost:5001/api';

const api = axios.create({ baseURL: API_BASE });

// Request interceptor: attach token
api.interceptors.request.use(config => {
  const token = getValidAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async error => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          storeTokens({ token: res.data.token });
          orig.headers.Authorization = `Bearer ${res.data.token}`;
          return api(orig);
        } catch { 
          clearTokens(); 
          window.location.href = '/login'; 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
