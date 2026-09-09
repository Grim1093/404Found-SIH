import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and 500s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          // Attempt refresh
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          if (response.data?.access_token) {
            // Update store
            useAuthStore.getState().setAuth(response.data, useAuthStore.getState().user!);
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, just logout
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);
