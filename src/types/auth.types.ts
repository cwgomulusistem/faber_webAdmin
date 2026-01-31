// Auth Types
// Type definitions for authentication system

export enum UserRole {
  MASTER = 'master',
  SUB = 'sub',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
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
  phone: string; // Telefon artık zorunlu
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
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: 'Bearer';
  user?: User;
  homes?: HomeBasicInfo[]; // User's accessible homes from login
}

// Home info returned in login response
export interface HomeBasicInfo {
  id: string;
  name: string;
  role: string; // OWNER | MEMBER | ADMIN | GUEST
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
