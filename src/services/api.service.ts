// API Service with Interceptors
// Inspired by frontend-dev connection patterns and faber_backend auth flow
// Implements Device Binding (Token Binding) for bank-level security

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import env from '../config/env';
import type { ApiResponse, TokenResponse } from '../types/api.types';

// Token storage keys
const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const CLIENT_ID_KEY = 'faber_client_id'; // Device binding - unique client identifier
const CLIENT_TYPE = 'WEB' as const; // WEB or MOBILE

// Create axios instance
const api = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate or retrieve persistent Client ID for device binding
// This ID is generated once per browser/device and persisted in localStorage
// It binds the JWT token to this specific device - stolen tokens won't work on other devices
const getOrCreateClientId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
};

// Token management utilities
export const tokenManager = {
  getToken: (): string | undefined => Cookies.get(TOKEN_KEY),
  getRefreshToken: (): string | undefined => Cookies.get(REFRESH_TOKEN_KEY),
  getClientId: (): string => getOrCreateClientId(),
  getClientType: (): typeof CLIENT_TYPE => CLIENT_TYPE,
  
  setTokens: (token: string, refreshToken: string): void => {
    // Token expires in 15 minutes, refresh in 7 days
    Cookies.set(TOKEN_KEY, token, { expires: 1/96, secure: true, sameSite: 'strict' });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
  },
  
  clearTokens: (): void => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    // Note: We do NOT clear CLIENT_ID_KEY - it's device-bound, not session-bound
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

// Request Interceptor: Add Authorization header, home info, and device binding
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add X-Client-ID header for device binding (REQUIRED for authenticated requests)
    // This binds the token to this specific device - prevents token replay attacks
    if (config.headers) {
      const clientId = tokenManager.getClientId();
      if (clientId) {
        config.headers['X-Client-ID'] = clientId;
      }
    }
    
    // Add home ID header if available (from localStorage, set by HomeContext)
    if (typeof window !== 'undefined' && config.headers) {
      try {
        const activeHomeId = window.localStorage.getItem('faber_active_home_id');
        if (activeHomeId) {
          config.headers['X-Home-ID'] = activeHomeId;
        }
      } catch (error) {
        // localStorage access failed, continue without home ID
        // Some endpoints don't require home ID
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
      // Include device binding info in refresh request
      const clientId = tokenManager.getClientId();
      const clientType = tokenManager.getClientType();
      
      const response = await axios.post<ApiResponse<TokenResponse>>(
        `${env.API_URL}/api/v1/auth/refresh`,
        { 
          refreshToken: refreshToken,
          clientId: clientId,
          clientType: clientType
        },
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
