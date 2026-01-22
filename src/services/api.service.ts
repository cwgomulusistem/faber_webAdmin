// API Service with Interceptors
// Inspired by frontend-dev connection patterns and faber_backend auth flow

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import env from '../config/env';
import type { ApiResponse, TokenResponse } from '../types/api.types';

// Token storage keys
const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

// Create axios instance
const api = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
export const tokenManager = {
  getToken: (): string | undefined => Cookies.get(TOKEN_KEY),
  getRefreshToken: (): string | undefined => Cookies.get(REFRESH_TOKEN_KEY),
  
  setTokens: (token: string, refreshToken: string): void => {
    // Token expires in 15 minutes, refresh in 7 days
    Cookies.set(TOKEN_KEY, token, { expires: 1/96, secure: true, sameSite: 'strict' });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
  },
  
  clearTokens: (): void => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },
  
  isAuthenticated: (): boolean => !!Cookies.get(TOKEN_KEY),
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Request Interceptor: Add Authorization header and tenant info
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant header if available
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        config.headers['X-Tenant-ID'] = parts[0];
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Not a 401 or already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // No refresh token available
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }
    
    // Start refresh process
    originalRequest._retry = true;
    isRefreshing = true;
    
    try {
      const response = await axios.post<ApiResponse<TokenResponse>>(
        `${env.API_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const { token, refresh_token } = response.data.data as TokenResponse;
      tokenManager.setTokens(token, refresh_token);
      
      // Notify waiting requests
      onTokenRefreshed(token);
      
      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
      }
      return api(originalRequest);
      
    } catch (refreshError) {
      // Refresh failed, logout user
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
      
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
