import * as Keychain from 'react-native-keychain';
import { ENDPOINTS } from '../config/api';

// One service for the token, a second for the cached user object. Caching the
// user lets us restore a session instantly on launch (even offline) instead of
// depending on a successful /me call before the user is considered logged in.
const KEYCHAIN_SERVICE = 'muslimedu_auth_token';
const KEYCHAIN_USER_SERVICE = 'muslimedu_auth_user';

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'teacher'
  | 'accountant'
  | 'librarian'
  | 'parent'
  | 'student'
  | 'warden';

export interface OrphanProfile {
  orphan_id_number: string | null;
  guardian_name: string | null;
  guardian_relation: string | null;
  guardian_phone: string | null;
  health_status: string | null;
  special_needs: string | null;
  admission_date: string | null;
  admission_reason: string | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: UserRole;
  school_id: number | null;
  code: string | null;
  photo?: string | null;
  is_orphan?: boolean;
  orphan_profile?: OrphanProfile | null;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls POST /login with email + password.
 * Throws AuthApiError with the server's message on failure (401/403/etc).
 */
export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, device_name: 'muslimedu-mobile' }),
    });
  } catch (networkError) {
    throw new AuthApiError('Could not reach the server. Check your internet connection.', 0);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new AuthApiError('Unexpected response from server.', response.status);
  }

  if (!response.ok) {
    throw new AuthApiError(data?.message ?? 'Login failed.', response.status);
  }

  return data as LoginResponse;
}

/**
 * Calls /me using the stored token to verify it's still valid and refresh
 * the user object. Throws AuthApiError; the status distinguishes a genuine
 * auth rejection (401/403) from a transient network/server problem so the
 * caller can decide whether to actually log the user out.
 */
export async function fetchMe(token: string): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(ENDPOINTS.me, {
      method: 'POST', // matches the api.php route registered as POST
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (networkError) {
    // status 0 = couldn't reach server. NOT an auth failure.
    throw new AuthApiError('Could not reach the server.', 0);
  }

  if (!response.ok) {
    throw new AuthApiError('Session check failed.', response.status);
  }

  const data = await response.json();
  return data.user as AuthUser;
}

/** Calls POST /logout to revoke just this device's token on the server. */
export async function logoutRequest(token: string): Promise<void> {
  try {
    await fetch(ENDPOINTS.logout, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Even if this fails (offline, etc.), we still clear the local token below.
  }
}

/**
 * Saves the token AND the user object so the session survives a restart.
 * The token write is the one that matters, so if the user-cache write fails
 * for any reason we swallow it: login must never fail just because the
 * secondary cache couldn't be written. (This was the cause of a spurious
 * "something went wrong" on successful logins.)
 */
export async function saveSession(token: string, user: AuthUser): Promise<void> {
  await Keychain.setGenericPassword('muslimedu_token', token, { service: KEYCHAIN_SERVICE });
  try {
    await Keychain.setGenericPassword('muslimedu_user', JSON.stringify(user), {
      service: KEYCHAIN_USER_SERVICE,
    });
  } catch {
    // Non-fatal: we can always re-fetch the user via /me on next launch.
  }
}

/** Reads the saved token, or null if none exists. */
export async function getStoredToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (!credentials) return null;
    return credentials.password;
  } catch {
    return null;
  }
}

/** Reads the cached user object, or null if none exists / can't be parsed. */
export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_USER_SERVICE });
    if (!credentials) return null;
    return JSON.parse(credentials.password) as AuthUser;
  } catch {
    return null;
  }
}

/** Removes both the token and the cached user (local logout). */
export async function clearToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  } catch {
    // ignore
  }
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_USER_SERVICE });
  } catch {
    // ignore
  }
}
