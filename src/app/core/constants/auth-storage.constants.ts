/** Keys used for auth/session persistence in the browser. */
export const AUTH_STORAGE_KEY = 'auth_state';

export const SESSION_STORAGE_KEYS = [
  AUTH_STORAGE_KEY,
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'token',
  'user',
  'currentUser',
  'auth_user',
] as const;
