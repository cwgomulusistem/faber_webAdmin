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
const PRE_AUTH_TOKEN_KEY = 'pre_auth_token'; // Temporary token for 2FA flow

// Create axios instance
const api = axios.create({
  baseURL: `${env.API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow 304 (Not Modified) to be consumed as valid response
  validateStatus: (status) => status >= 200 && status < 400,
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
    Cookies.set(TOKEN_KEY, token, { expires: 1 / 96, secure: true, sameSite: 'strict' });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
  },

  clearTokens: (): void => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    // Note: We do NOT clear CLIENT_ID_KEY - it's device-bound, not session-bound
    // Also clear pre-auth token if present
    sessionStorage.removeItem(PRE_AUTH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => !!Cookies.get(TOKEN_KEY),

  // Pre-auth token management (for 2FA flow)
  // Stored in sessionStorage (not cookies) - valid only for current tab/session
  setPreAuthToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PRE_AUTH_TOKEN_KEY, token);
    }
  },

  getPreAuthToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(PRE_AUTH_TOKEN_KEY);
  },

  clearPreAuthToken: (): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(PRE_AUTH_TOKEN_KEY);
    }
  },

  hasPreAuthToken: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem(PRE_AUTH_TOKEN_KEY);
  },
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

    // Prevent overwriting existing Authorization header (e.g. set by Global Admin service)
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL: Add X-Client-ID header for device binding (REQUIRED for authenticated requests)
    // This binds the token to this specific device - prevents token replay attacks
    if (config.headers) {
      let clientId = tokenManager.getClientId();

      // Split Brain Detection:
      // If we have a token (Authenticated) but NO clientId (Device Binding lost),
      // we MUST NOT generate a new random clientId. The backend will reject the token
      // because it's bound to the *original* clientId.
      if (token && !clientId) {
        console.warn('[API] Güvenlik Uyarısı: Token mevcut ancak Cihaz Kimliği (Client ID) kayıp. Oturum sonlandırılıyor.');
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          // Force reload/redirect to ensure clean slate
          window.location.href = '/login?reason=device_binding_lost';
        }
        // Cancel the request
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort("Device binding lost");
        return config;
      }

      // Fallback: Only generate new ID if we are NOT authenticated yet (Public user)
      if (!clientId) {
        console.warn('[API] Client ID bulunamadı, yeni ziyaretçi için üretiliyor...');
        clientId = uuidv4();
        try {
          localStorage.setItem(CLIENT_ID_KEY, clientId);
        } catch (e) {
          console.error('[API] localStorage yazılamadı:', e);
        }
      }

      // Always set the header - this is mandatory for authenticated requests
      config.headers['X-Client-ID'] = clientId;
    }

    // Add home ID header if available (from localStorage, set by HomeContext)
    if (typeof window !== 'undefined' && config.headers) {
      try {
        const rawHomeId = window.localStorage.getItem('faber_active_home_id');
        if (rawHomeId) {
          let homeId: string = rawHomeId;

          // Handle both JSON-stringified values (from useLocalStorage hook) 
          // and plain strings (from direct localStorage.setItem calls)
          // JSON.stringify("uuid") -> "\"uuid\"" (starts with quote)
          if (rawHomeId.startsWith('"') && rawHomeId.endsWith('"')) {
            try {
              const parsed = JSON.parse(rawHomeId);
              if (typeof parsed === 'string') {
                homeId = parsed;
              } else {
                homeId = rawHomeId.slice(1, -1);
              }
            } catch {
              // If JSON.parse fails, strip quotes manually
              homeId = rawHomeId.slice(1, -1);
            }
          }

          if (homeId) {
            config.headers['X-Home-ID'] = homeId;
          }
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

    // Extract error message from response
    const errorMessage = (error.response?.data as any)?.error
      || (error.response?.data as any)?.message
      || error.message
      || 'Bir hata oluştu';

    // Create a more informative error
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;

    // Not a 401 or already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(enhancedError);
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

      // Backend returns wrapped ApiResponse
      const response = await axios.post<ApiResponse<TokenResponse>>(
        `${env.API_URL}/api/v1/auth/refresh`,
        {
          refreshToken: refreshToken,
          clientId: clientId,
          clientType: clientType
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data!;
      tokenManager.setTokens(accessToken, newRefreshToken);

      // Notify waiting requests
      onTokenRefreshed(accessToken);

      // Retry original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
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
