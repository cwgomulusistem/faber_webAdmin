// Auth Types
// Type definitions for authentication system

export enum UserRole {
  MASTER = 'MASTER',
  SUB = 'SUB',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole; // 'MASTER' | 'SUB' | 'admin'
  language?: string;
  timezone?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
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
  adminLogin: (payload: LoginPayload) => Promise<LoginResult | void>;
  register: (payload: RegisterPayload) => Promise<{ requireActivation?: boolean } | void>;
  activate: (payload: ActivatePayload) => Promise<void>;
  verify2FA: (payload: Verify2FAPayload) => Promise<void>;
  verify2FAWithPreAuth: (payload: { code: string; rememberMe?: boolean; hardwareFingerprint?: string }) => Promise<void>;
  verifyRecoveryCode: (payload: { code: string }) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  googleLogin: (payload: GoogleLoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  clearLockout: () => void;
  // Pre-auth state
  isPreAuth: boolean;
  preAuthToken: string | null;
  preAuthUserId: string | null;
  twoFactorType: string | null;
}

// ==================== LOGIN ERROR RESPONSE ====================

export type LoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | '2FA_REQUIRED'
  | 'ACCOUNT_INACTIVE'
  | '2FA_LOCKED';

export interface LoginErrorResponse {
  error: string;
  code: LoginErrorCode;
  remainingAttempts?: number;
  lockedUntil?: number; // Unix timestamp
  retryAfter?: number; // Seconds
}

// ==================== PRE-AUTH TOKEN ====================

export interface PreAuthTokenResponse {
  preAuthToken: string;
  expiresIn: number;
  twoFactorType: 'EMAIL' | 'TOTP';
  userId: string;
}

// ==================== LOGIN RESULT ====================

export interface LoginResult {
  require2FA?: boolean;
  preAuthToken?: string;
  twoFactorType?: 'EMAIL' | 'TOTP';
  userId?: string;
  lockout?: {
    isLocked: boolean;
    lockedUntil?: number;
    retryAfter?: number;
    remainingAttempts?: number;
  };
}

// ==================== SECURITY STATUS ====================

export interface SecurityStatus {
  twoFactorEnabled: boolean;
  twoFactorType: 'EMAIL' | 'TOTP' | 'NONE';
  recoveryCodesLeft: number;
  email: string;
  phone?: string;
}

// ==================== TOTP SETUP ====================

export interface TOTPSetupResponse {
  secret: string;
  qrCodeUrl: string;
  recoveryCodes: string[];
}
