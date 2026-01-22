'use client';

// Auth Context
// Global authentication state management inspired by frontend-dev auth-mixin

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService, AuthResult } from '../services/auth.service';
import { tokenManager } from '../services/api.service';
import type {
  User,
  AdminUser,
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  AuthContextType,
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
  login: async () => {},
  adminLogin: async () => {},
  register: async () => {},
  googleLogin: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
  clearError: () => {},
  activate: async () => {},
  verify2FA: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
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

  // Admin Login
  const adminLogin = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.adminLogin(payload);
      
      if (result.require2FA) {
        return { require2FA: true };
      }

      if (result.result) {
        handleAuthResult(result.result, 'admin');
      }
    } catch (err) {
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

  // Verify 2FA
  const verify2FA = useCallback(async (payload: { email: string; code: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.verify2FA(payload);
      handleAuthResult(result, 'user');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Doğrulama başarısız';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthResult]);

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
    forgotPassword,
    resetPassword,
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
    forgotPassword,
    resetPassword,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
