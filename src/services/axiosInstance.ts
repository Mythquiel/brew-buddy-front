import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';
import { isTokenExpired } from '../utils/jwt';

const ACCESS_TOKEN_KEY = 'brew_buddy_access_token';
const REFRESH_TOKEN_KEY = 'brew_buddy_refresh_token';
const USER_KEY = 'brew_buddy_user';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem(ACCESS_TOKEN_KEY);


    if (token && isTokenExpired(token)) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const response = await authService.refresh(refreshToken);

          // Update tokens
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));

          token = response.accessToken;
        } catch (error) {
          console.error('Token refresh failed in interceptor:', error);
          // Clear tokens and redirect to login
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
          throw error;
        }
      } else {
        // Refresh token also expired
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const response = await authService.refresh(refreshToken);

          // Update tokens
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token or it's expired
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
