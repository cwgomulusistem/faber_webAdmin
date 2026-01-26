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
   * Includes device binding (clientId, clientType) for token security
   */
  async login(payload: LoginPayload): Promise<{ result?: AuthResult; require2FA?: boolean }> {
    // Add device binding info to login request
    const loginPayload = {
      ...payload,
      clientId: tokenManager.getClientId(),
      clientType: tokenManager.getClientType(),
    };
    
    const response = await api.post<TokenResponse | { message: string }>('/auth/login', loginPayload);
    
    if (response.status === 202) {
      return { require2FA: true };
    }

    // Backend now returns wrapped ApiResponse
    const responseData = response.data as ApiResponse<TokenResponse>;
    const data = responseData.data!;
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    
    return {
      result: {
        user: data.user!,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }
    };
  },
  
  /**
   * Admin login
   * POST /api/v1/auth/admin/login
   * Includes device binding (clientId, clientType) for token security
   */
  async adminLogin(payload: LoginPayload): Promise<{ result?: AuthResult; require2FA?: boolean }> {
    // Add device binding info to login request
    const loginPayload = {
      ...payload,
      clientId: tokenManager.getClientId(),
      clientType: tokenManager.getClientType(),
    };
    
    const response = await api.post<TokenResponse | { message: string }>('/auth/login', loginPayload);
    
    if (response.status === 202) {
      return { require2FA: true };
    }

    // Backend now returns wrapped ApiResponse
    const responseData = response.data as ApiResponse<TokenResponse>;
    const data = responseData.data!;
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    
    return {
      result: {
        user: data.user!,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }
    };
  },
  
  /**
   * User registration
   * POST /api/v1/auth/register
   * Includes device binding (clientId, clientType) for token security
   * 
   * Backend returns:
   * - 201 + TokenResponse: Registration successful, auto-login
   * - 202 + { message: "activation required" }: Email/SMS verification needed
   * - 400 + { error: "..." }: Registration failed
   */
  async register(payload: RegisterPayload): Promise<{ result?: AuthResult; requireActivation?: boolean }> {
    // Add device binding info to register request
    const registerPayload = {
      ...payload,
      clientId: tokenManager.getClientId(),
      clientType: tokenManager.getClientType(),
    };
    
    const response = await api.post<TokenResponse | { message: string }>(
      '/auth/register',
      registerPayload
    );

    // Activation required - need email/SMS verification
    if (response.status === 202) {
      return { requireActivation: true };
    }

    // Registration successful - auto-login with tokens
    const responseData = response.data as ApiResponse<TokenResponse>;
    const data = responseData.data!;
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    
    return {
      result: {
        user: data.user!,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }
    };
  },

  /**
   * Activate account
   * POST /api/v1/auth/activate
   * Includes device binding (clientId, clientType) for token security
   */
  async activate(payload: { email: string; code: string }): Promise<void> {
    // Add device binding info to activate request
    const activatePayload = {
      ...payload,
      clientId: tokenManager.getClientId(),
      clientType: tokenManager.getClientType(),
    };
    await api.post('/auth/activate', activatePayload);
  },

  /**
   * Verify 2FA
   * POST /api/v1/auth/verify-2fa
   * Includes device binding (clientId, clientType) for token security
   */
  async verify2FA(payload: { email: string; code: string }): Promise<AuthResult> {
    // Add device binding info to 2FA verification request
    const verify2FAPayload = {
      ...payload,
      clientId: tokenManager.getClientId(),
      clientType: tokenManager.getClientType(),
    };
    
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/verify-2fa', verify2FAPayload);
    // Backend returns wrapped ApiResponse
    const data = response.data.data!;
    
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    
    return {
      user: data.user!,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
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
    // Add device binding info to Google login
    const googlePayload = {
      ...payload,
      clientId: tokenManager.getClientId(),
      clientType: tokenManager.getClientType(),
    };
    
    const response = await api.post<ApiResponse<TokenResponse>>('/auth/google', googlePayload);
    // Backend returns wrapped ApiResponse
    const data = response.data.data!;
    
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    
    return {
      user: data.user!,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
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
   * GET /api/v1/auth/profile
   */
  async getCurrentUser(): Promise<User | AdminUser> {
    // Backend returns user directly (not wrapped in ApiResponse)
    const response = await api.get<User | AdminUser>('/auth/profile');
    return response.data;
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
