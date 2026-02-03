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
  LoginErrorResponse,
  PreAuthTokenResponse,
  LoginResult,
  SecurityStatus,
  TOTPSetupResponse,
} from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

export interface AuthResult {
  user: User | AdminUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
  homes?: { id: string; name: string; role: string }[]; // From backend
}

// Custom error class for login errors with metadata
export class LoginError extends Error {
  code: string;
  remainingAttempts?: number;
  lockedUntil?: number;
  retryAfter?: number;

  constructor(data: LoginErrorResponse) {
    super(data.error);
    this.name = 'LoginError';
    this.code = data.code;
    this.remainingAttempts = data.remainingAttempts;
    this.lockedUntil = data.lockedUntil;
    this.retryAfter = data.retryAfter;
  }
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
   * Admin login (Alias for User Login)
   * POST /api/v1/auth/login (Uses standard user authentication)
   * Includes device binding (clientId, clientType) for token security
   * 
   * New response handling:
   * - 200: Success with tokens
   * - 202: 2FA required with pre-auth token
   * - 401/423: Error with lockout info
   */
  async adminLogin(payload: LoginPayload): Promise<{ result?: AuthResult; preAuth?: PreAuthTokenResponse }> {
    // Add device binding info to login request
    const loginPayload = {
      ...payload,
      clientId: tokenManager.getClientId(),
      clientType: tokenManager.getClientType(),
    };

    try {
      const response = await api.post<ApiResponse<TokenResponse | PreAuthTokenResponse>>('/auth/login', loginPayload);

      // 202: 2FA required - return pre-auth token
      if (response.status === 202) {
        const preAuthData = response.data.data as PreAuthTokenResponse;
        // Store pre-auth token temporarily
        tokenManager.setPreAuthToken(preAuthData.preAuthToken);
        return { preAuth: preAuthData };
      }

      // 200: Success - full tokens
      const data = response.data.data as TokenResponse;
      tokenManager.setTokens(data.accessToken, data.refreshToken);

      return {
        result: {
          user: data.user!,
          token: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          homes: data.homes,
        }
      };
    } catch (error: any) {
      // Check if it's a login error response (401 or 423)
      if (error.response?.data) {
        const errorData = error.response.data as LoginErrorResponse;
        throw new LoginError(errorData);
      }
      throw error;
    }
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
    // Backend returns wrapped ApiResponse
    const response = await api.get<ApiResponse<User | AdminUser>>('/auth/profile');
    if (!response.data.data) {
      throw new Error('User data not found');
    }
    return response.data.data;
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

  // ==================== NEW 2FA METHODS ====================

  /**
   * Verify 2FA with pre-auth token
   * POST /api/v1/auth/2fa/complete
   * Uses pre-auth token from login response
   */
  async verify2FAWithPreAuth(code: string): Promise<AuthResult> {
    const preAuthToken = tokenManager.getPreAuthToken();
    if (!preAuthToken) {
      throw new Error('No pre-auth token found');
    }

    const response = await api.post<ApiResponse<TokenResponse>>(
      '/auth/2fa/complete',
      {
        code,
        clientId: tokenManager.getClientId(),
        clientType: tokenManager.getClientType(),
      },
      {
        headers: {
          Authorization: `Bearer ${preAuthToken}`,
        },
      }
    );

    const data = response.data.data!;
    
    // Clear pre-auth token and set full tokens
    tokenManager.clearPreAuthToken();
    tokenManager.setTokens(data.accessToken, data.refreshToken);

    return {
      user: data.user!,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  },

  /**
   * Verify recovery code
   * POST /api/v1/auth/2fa/recovery
   */
  async verifyRecoveryCode(code: string): Promise<AuthResult> {
    const preAuthToken = tokenManager.getPreAuthToken();
    if (!preAuthToken) {
      throw new Error('No pre-auth token found');
    }

    const response = await api.post<ApiResponse<TokenResponse>>(
      '/auth/2fa/recovery',
      {
        code,
        clientId: tokenManager.getClientId(),
        clientType: tokenManager.getClientType(),
      },
      {
        headers: {
          Authorization: `Bearer ${preAuthToken}`,
        },
      }
    );

    const data = response.data.data!;
    
    // Clear pre-auth token and set full tokens
    tokenManager.clearPreAuthToken();
    tokenManager.setTokens(data.accessToken, data.refreshToken);

    return {
      user: data.user!,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  },

  // ==================== SECURITY SETTINGS METHODS ====================

  /**
   * Get security status
   * GET /api/v1/auth/security
   */
  async getSecurityStatus(): Promise<SecurityStatus> {
    const response = await api.get<ApiResponse<SecurityStatus>>('/auth/security');
    return response.data.data!;
  },

  /**
   * Setup TOTP
   * POST /api/v1/auth/2fa/setup
   */
  async setupTOTP(): Promise<TOTPSetupResponse> {
    const response = await api.post<ApiResponse<TOTPSetupResponse>>('/auth/2fa/setup');
    return response.data.data!;
  },

  /**
   * Verify and enable TOTP
   * POST /api/v1/auth/2fa/verify
   */
  async verifyAndEnableTOTP(code: string): Promise<void> {
    await api.post('/auth/2fa/verify', { code });
  },

  /**
   * Disable TOTP
   * DELETE /api/v1/auth/2fa
   */
  async disableTOTP(password: string): Promise<void> {
    await api.delete('/auth/2fa', { data: { password } });
  },

  /**
   * Regenerate recovery codes
   * POST /api/v1/auth/2fa/regenerate
   */
  async regenerateRecoveryCodes(password: string): Promise<string[]> {
    const response = await api.post<ApiResponse<{ recoveryCodes: string[] }>>('/auth/2fa/regenerate', { password });
    return response.data.data!.recoveryCodes;
  },

  /**
   * Update profile
   * PATCH /api/v1/auth/profile
   */
  async updateProfile(data: { fullName?: string; phone?: string; language?: string; timezone?: string }): Promise<void> {
    await api.patch('/auth/profile', data);
  },

  // ==================== TRUSTED DEVICE METHODS ====================

  /**
   * Verify 2FA with pre-auth token and optional rememberMe
   * POST /api/v1/auth/2fa/complete
   * If rememberMe is true, creates a trusted device and returns trust token
   */
  async verify2FAWithRememberMe(
    code: string,
    rememberMe: boolean,
    hardwareFingerprint?: string
  ): Promise<AuthResult & { trustToken?: string; trustTokenExpires?: string }> {
    const preAuthToken = tokenManager.getPreAuthToken();
    if (!preAuthToken) {
      throw new Error('No pre-auth token found');
    }

    const response = await api.post<ApiResponse<TokenResponse & { trustToken?: string; trustTokenExpires?: string }>>(
      '/auth/2fa/complete',
      {
        code,
        clientId: tokenManager.getClientId(),
        clientType: tokenManager.getClientType(),
        rememberMe,
        hardwareFingerprint,
      },
      {
        headers: {
          Authorization: `Bearer ${preAuthToken}`,
        },
      }
    );

    const data = response.data.data!;
    
    // Clear pre-auth token and set full tokens
    tokenManager.clearPreAuthToken();
    tokenManager.setTokens(data.accessToken, data.refreshToken);

    // Trust token is set via HttpOnly cookie by backend for web clients
    // We just return it for reference (frontend can't read HttpOnly cookies)

    return {
      user: data.user!,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      trustToken: data.trustToken,
      trustTokenExpires: data.trustTokenExpires,
    };
  },

  /**
   * Get list of trusted devices
   * GET /api/v1/auth/trusted-devices
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    const response = await api.get<ApiResponse<TrustedDevice[]>>('/auth/trusted-devices', {
      headers: {
        'X-Client-ID': tokenManager.getClientId(),
      },
    });
    return response.data.data || [];
  },

  /**
   * Revoke a specific trusted device
   * DELETE /api/v1/auth/trusted-devices/:id
   */
  async revokeTrustedDevice(deviceId: string): Promise<void> {
    await api.delete(`/auth/trusted-devices/${deviceId}`);
  },

  /**
   * Revoke all trusted devices
   * DELETE /api/v1/auth/trusted-devices
   */
  async revokeAllTrustedDevices(): Promise<void> {
    await api.delete('/auth/trusted-devices');
  },
};

// Trusted Device type
export interface TrustedDevice {
  id: string;
  deviceName: string;
  platform: string;
  lastIp?: string;
  lastCountry?: string;
  lastCity?: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default authService;
