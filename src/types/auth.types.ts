// Auth Types
// Type definitions for authentication system

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  provider: AuthProvider;
  language: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  SUPPORT = 'SUPPORT',
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  tenantSlug?: string;
  phone?: string;
}

export interface ActivatePayload {
  email: string;
  code: string;
}

export interface Verify2FAPayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface GoogleLoginPayload {
  idToken: string;
}

export interface TokenResponse {
  token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
  user?: User;
}

export interface AuthState {
  user: User | AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userType: 'user' | 'admin' | null;
}

export interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<{ require2FA?: boolean } | void>;
  adminLogin: (payload: LoginPayload) => Promise<{ require2FA?: boolean } | void>;
  register: (payload: RegisterPayload) => Promise<{ requireActivation?: boolean } | void>;
  activate: (payload: ActivatePayload) => Promise<void>;
  verify2FA: (payload: Verify2FAPayload) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  googleLogin: (payload: GoogleLoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}
