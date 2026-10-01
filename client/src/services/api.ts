import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present in localStorage (fallback for cookie)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for unified error formatting and auth state handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: { field: string; message: string }[] }>) => {
    // If 401 Unauthorized occurs on protected routes (not login/register)
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register')
    ) {
      // Clear token and optionally redirect
      localStorage.removeItem('auth_token');
    }

    return Promise.reject(error);
  }
);

export default api;
