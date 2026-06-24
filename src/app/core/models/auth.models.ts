export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  sessionExpiresAt?: string;
  userId: string;
  userName: string;
  email: string;
  fullName: string | null;
  profilePhotoUrl: string | null;
  roles: string[];
  permissions: string[];
  forcePasswordReset?: boolean;
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  exp: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}
