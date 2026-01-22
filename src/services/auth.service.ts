// Auth Service
// Authentication operations matching faber_backend auth endpoints

import api, { tokenManager } from './api.service';
import type {
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  TokenResponse,
  User,
  AdminUser,
} from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

export interface AuthResult {
  user: User | AdminUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export const authService = {
  /**
   * User login
   * POST /api/v1/auth/login
   */
  async login(payload: LoginPayload): Promise<{ result?: AuthResult; require2FA?: boolean }> {
    const response = await api.post<ApiResponse<TokenResponse | { message: string }>>('/auth/login', payload);
    
    if (response.status === 202) {
      return { require2FA: true };
    }

    const data = response.data.data as TokenResponse;
    tokenManager.setTokens(data.token, data.refresh_token);
    
    return {
      result: {
        user: data.user!,
        token: data.token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      }
    };
  },
  
  /**
   * Admin login
   * POST /api/v1/auth/admin/login
   */
  async adminLogin(payload: LoginPayload): Promise<{ result?: AuthResult; require2FA?: boolean }> {
    const response = await api.post<ApiResponse<TokenResponse | { message: string }>>('/auth/login', payload);
    
    if (response.status === 202) {
      return { require2FA: true };
    }

    const data = response.data.data as TokenResponse;
    tokenManager.setTokens(data.token, data.refresh_token);
    
    return {
      result: {
        user: data.user!,
        token: data.token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      }
    };
  },
  
  /**
   * User registration
   * POST /api/v1/auth/register
   */
  async register(payload: RegisterPayload): Promise<{ id: string; requireActivation?: boolean }> {
    const response = await api.post<ApiResponse<{ id?: string; userId?: string; message: string }>>(
      '/auth/register',
      payload
    );

    if (response.status === 202) {
      return { id: response.data.data?.userId || '', requireActivation: true };
    }

    return { id: response.data.data?.id || '' };
  },

  /**
   * Activate account
   * POST /api/v1/auth/activate
   */
  async activate(payload: { email: string; code: string }): Promise<void> {
    await api.post('/auth/activate', payload);
  },

  /**
   * Verify 2FA
   * POST /api/v1/auth/verify-2fa
   */
  async verify2FA(payload: { email: string; code: string }): Promise<AuthResult> {
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/verify-2fa', payload);
    const data = response.data.data!;
    
    tokenManager.setTokens(data.token, data.refresh_token);
    
    return {
      user: data.user!,
      token: data.token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  },

  /**
   * Forgot Password
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset Password
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(payload: { email: string; code: string; newPassword: string }): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },
  
  /**
   * Google OAuth login
   * POST /api/v1/auth/google
   */
  async googleLogin(payload: GoogleLoginPayload): Promise<AuthResult> {
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/google', payload);
    const data = response.data.data!;
    
    tokenManager.setTokens(data.token, data.refresh_token);
    
    return {
      user: data.user!,
      token: data.token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  },
  
  /**
   * Logout
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenManager.clearTokens();
    }
  },
  
  /**
   * Get current user info
   * GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<User | AdminUser> {
    const response = await api.get<ApiResponse<User | AdminUser>>('/auth/profile');
    return response.data.data!;
  },
  
  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
  
  /**
   * Check if user is authenticated (client-side)
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },
};

export default authService;
