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
  async login(payload: LoginPayload): Promise<AuthResult> {
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/login', payload);
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
   * Admin login
   * POST /api/v1/auth/admin/login
   */
  async adminLogin(payload: LoginPayload): Promise<AuthResult> {
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/admin/login', payload);
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
   * User registration
   * POST /api/v1/auth/register
   */
  async register(payload: RegisterPayload): Promise<{ id: string; email: string }> {
    const response = await api.post<ApiResponse<{ id: string; email: string; message: string }>>(
      '/auth/register',
      payload
    );
    return response.data.data!;
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
    const response = await api.get<ApiResponse<User | AdminUser>>('/auth/me');
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
