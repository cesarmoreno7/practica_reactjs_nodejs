/**
 * Axios instance that centralizes API URL, headers, and JWT interceptors used across the React app.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor injects the JWT into every API request when available.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor clears auth state when the server rejects the token.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipo Usuario API
export const tipoUsuarioAPI = {
  getAll: (params = {}) => api.get('/tipo-usuario', { params }),
  getById: (id) => api.get(`/tipo-usuario/${id}`),
  search: (term) => api.get(`/tipo-usuario/search/${term}`),
  create: (data) => api.post('/tipo-usuario', data),
  update: (id, data) => api.put(`/tipo-usuario/${id}`, data),
  delete: (id) => api.delete(`/tipo-usuario/${id}`),
};

// Usuario API
export const usuarioAPI = {
  getAll: (params = {}) => api.get('/usuario', { params }),
  getById: (id) => api.get(`/usuario/${id}`),
  getByTipo: (tipoId) => api.get(`/usuario/tipo/${tipoId}`),
  getByEstado: (estado) => api.get(`/usuario/estado/${estado}`),
  search: (term) => api.get(`/usuario/search/${term}`),
  create: (data) => api.post('/usuario', data),
  update: (id, data) => api.put(`/usuario/${id}`, data),
  delete: (id) => api.delete(`/usuario/${id}`),
  authenticate: (data) => api.post('/usuario/authenticate', data),
};

export default api;
