import axios from 'axios';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';

const api = axios.create({
  baseURL: 'https://reqres.in/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        store.dispatch(logout());
      }
      
      // Extract error message from response
      const message = error.response.data?.error || 'An error occurred';
      error.message = message;
    } else if (error.request) {
      // Network error
      error.message = 'Network error. Please check your connection.';
    } else {
      error.message = 'An unexpected error occurred.';
    }
    return Promise.reject(error);
  }
);

export default api;