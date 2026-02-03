'use client';

// Auth Context
// Global authentication state management inspired by frontend-dev auth-mixin
// Now includes pre-auth token support for 2FA flow

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService, AuthResult, LoginError } from '../services/auth.service';
import { tokenManager } from '../services/api.service';
import type {
  User,
  AdminUser,
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  AuthContextType,
  LoginResult,
} from '../types/auth.types';

// Initial state
const initialState: AuthContextType = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  userType: null,
  login: async () => { },
  adminLogin: async () => { },
  register: async () => { },
  googleLogin: async () => { },
  logout: async () => { },
  refreshAuth: async () => { },
  clearError: () => { },
  activate: async () => { },
  verify2FA: async () => { },
  verify2FAWithPreAuth: async () => { },
  verifyRecoveryCode: async () => { },
  forgotPassword: async () => { },
  resetPassword: async () => { },
  clearLockout: () => { },
  // Pre-auth state
  isPreAuth: false,
  preAuthToken: null,
  preAuthUserId: null,
  twoFactorType: null,
};

// Create context
const AuthContext = createContext<AuthContextType>(initialState);

// Hook for consuming auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  
  // Pre-auth state for 2FA flow
  const [isPreAuth, setIsPreAuth] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
  const [preAuthUserId, setPreAuthUserId] = useState<string | null>(null);
  const [twoFactorType, setTwoFactorType] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (tokenManager.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setToken(tokenManager.getToken() || null);
          setRefreshToken(tokenManager.getRefreshToken() || null);
          setUserType('type' in currentUser && currentUser.type === 'admin' ? 'admin' : 'user');
        }
      } catch {
        // Token invalid, clear auth state
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle auth result
  const handleAuthResult = useCallback((result: AuthResult, type: 'user' | 'admin') => {
    setUser(result.user);
    setToken(result.token);
    setRefreshToken(result.refreshToken);
    setUserType(type);
    setError(null);
  }, []);

  // Login
  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(payload);

      if (result.require2FA) {
        return { require2FA: true };
      }

      if (result.result) {
        handleAuthResult(result.result, 'user');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

  // Admin Login - now supports pre-auth tokens for 2FA
  const adminLogin = useCallback(async (payload: LoginPayload): Promise<LoginResult | void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.adminLogin(payload);

      // 2FA required - set pre-auth state
      if (result.preAuth) {
        setIsPreAuth(true);
        setPreAuthToken(result.preAuth.preAuthToken);
        setPreAuthUserId(result.preAuth.userId);
        setTwoFactorType(result.preAuth.twoFactorType);
        return {
          require2FA: true,
          preAuthToken: result.preAuth.preAuthToken,
          twoFactorType: result.preAuth.twoFactorType,
          userId: result.preAuth.userId,
        };
      }

      if (result.result) {
        handleAuthResult(result.result, 'admin');

        // Auto-select home if user has exactly one
        if (result.result.homes && result.result.homes.length === 1) {
          localStorage.setItem('activeHomeId', result.result.homes[0].id);
        } else if (result.result.homes && result.result.homes.length > 1) {
          // Multiple homes - clear stale selection, let user pick
          localStorage.removeItem('activeHomeId');
        }
      }
    } catch (err) {
      // Handle LoginError with lockout info
      if (err instanceof LoginError) {
        setError(err.message);
        throw err;
      }
      const message = err instanceof Error ? err.message : 'Admin girişi başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

  // Register
  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(payload);

      // If activation required, return early
      if (result.requireActivation) {
        return { requireActivation: true };
      }

      // Backend returned tokens directly - no need to login again
      if (result.result) {
        handleAuthResult(result.result, 'user');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kayıt başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

  // Google Login
  const googleLogin = useCallback(async (payload: GoogleLoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.googleLogin(payload);
      handleAuthResult(result, 'user');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google girişi başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

  // Activate
  const activate = useCallback(async (payload: { email: string; code: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.activate(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Aktivasyon başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify 2FA (legacy - uses email)
  const verify2FA = useCallback(async (payload: { email: string; code: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.verify2FA(payload);
      handleAuthResult(result, 'user');
      // Clear pre-auth state
      setIsPreAuth(false);
      setPreAuthToken(null);
      setPreAuthUserId(null);
      setTwoFactorType(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Doğrulama başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

  // Verify 2FA with pre-auth token (new flow with rememberMe support)
  const verify2FAWithPreAuth = useCallback(async (payload: { 
    code: string; 
    rememberMe?: boolean;
    hardwareFingerprint?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.verify2FAWithRememberMe(
        payload.code,
        payload.rememberMe || false,
        payload.hardwareFingerprint
      );
      handleAuthResult(result, 'admin');
      // Clear pre-auth state
      setIsPreAuth(false);
      setPreAuthToken(null);
      setPreAuthUserId(null);
      setTwoFactorType(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Doğrulama başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

  // Verify recovery code
  const verifyRecoveryCode = useCallback(async (payload: { code: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.verifyRecoveryCode(payload.code);
      handleAuthResult(result, 'admin');
      // Clear pre-auth state
      setIsPreAuth(false);
      setPreAuthToken(null);
      setPreAuthUserId(null);
      setTwoFactorType(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kurtarma kodu doğrulaması başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

  // Clear lockout state (for UI reset after countdown)
  const clearLockout = useCallback(() => {
    setError(null);
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (payload: { email: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(payload.email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İşlem başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (payload: { email: string; code: string; newPassword: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Şifre sıfırlama başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setUserType(null);
      setError(null);
    }
  }, []);

  // Refresh auth
  const refreshAuth = useCallback(async () => {
    if (!tokenManager.isAuthenticated()) return;

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      await logout();
    }
  }, [logout]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoized value
  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    refreshToken,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    userType,
    login,
    adminLogin,
    register,
    googleLogin,
    logout,
    refreshAuth,
    clearError,
    activate,
    verify2FA,
    verify2FAWithPreAuth,
    verifyRecoveryCode,
    forgotPassword,
    resetPassword,
    clearLockout,
    // Pre-auth state
    isPreAuth,
    preAuthToken,
    preAuthUserId,
    twoFactorType,
  }), [
    user,
    token,
    refreshToken,
    isLoading,
    error,
    userType,
    login,
    adminLogin,
    register,
    googleLogin,
    logout,
    refreshAuth,
    clearError,
    activate,
    verify2FA,
    verify2FAWithPreAuth,
    verifyRecoveryCode,
    forgotPassword,
    resetPassword,
    clearLockout,
    isPreAuth,
    preAuthToken,
    preAuthUserId,
    twoFactorType,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
