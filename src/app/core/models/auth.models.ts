export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  userName: string;
  email: string;
  fullName: string | null;
  profilePhotoUrl: string | null;
  roles: string[];
  permissions: string[];
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
