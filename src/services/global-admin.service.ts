import api from './api.service';
import Cookies from 'js-cookie';
import { tokenManager } from './api.service';

const GLOBAL_ADMIN_TOKEN_KEY = 'global_admin_token';
const GLOBAL_ADMIN_REFRESH_TOKEN_KEY = 'global_admin_refresh_token';

export interface GlobalAdminLoginInput {
  email: string;
  password: string;
  totpCode: string;
  clientId: string;
  clientType: string;
}

export interface GlobalAdmin {
  id: string;
  email: string;
  fullName: string;
  lastLoginAt?: string;
}

export interface GlobalAdminTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  admin: GlobalAdmin;
}

export interface SystemLogResponse {
  logs: string;
}

export const globalAdminService = {
  // Login
  login: async (input: GlobalAdminLoginInput): Promise<GlobalAdminTokenResponse> => {
    // Ensure clientId is present (similar to api.service.ts logic, but explicit here)
    if (!input.clientId) {
      input.clientId = tokenManager.getClientId();
    }
    input.clientType = 'WEB';

    const response = await api.post('/auth/global-admin/login', input);
    const data = response.data.data;

    // Save tokens specifically for global admin session
    // We use different keys to avoid conflict with standard admin
    Cookies.set(GLOBAL_ADMIN_TOKEN_KEY, data.accessToken, { expires: 1/96, secure: true, sameSite: 'strict' });
    Cookies.set(GLOBAL_ADMIN_REFRESH_TOKEN_KEY, data.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });

    return data;
  },

  // Logout
  logout: () => {
    Cookies.remove(GLOBAL_ADMIN_TOKEN_KEY);
    Cookies.remove(GLOBAL_ADMIN_REFRESH_TOKEN_KEY);
    if (typeof window !== 'undefined') {
        window.location.href = '/64ad16/login';
    }
  },

  // Check auth
  isAuthenticated: () => {
    return !!Cookies.get(GLOBAL_ADMIN_TOKEN_KEY);
  },

  getToken: () => {
    return Cookies.get(GLOBAL_ADMIN_TOKEN_KEY);
  },

  // Get Profile
  getProfile: async (): Promise<GlobalAdmin> => {
    // We need to manually attach the specific token because the interceptor 
    // in api.service.ts uses the standard 'admin_token'
    // For 64ad16/* routes, we might need a custom axios instance or interceptor override
    // For simplicity, let's use the main api instance but override header
    const token = Cookies.get(GLOBAL_ADMIN_TOKEN_KEY);
    const response = await api.get('/global-admin/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  },

  // Get System Logs (PM2)
  getSystemLogs: async (lines: number = 100): Promise<string> => {
    const token = Cookies.get(GLOBAL_ADMIN_TOKEN_KEY);
    const response = await api.get(`/global-admin/system-logs?lines=${lines}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data.logs;
  }
};
