import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  AuthUser,
  loginRequest,
  fetchMe,
  logoutRequest,
  saveSession,
  getStoredToken,
  getStoredUser,
  clearToken,
  AuthApiError,
} from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean; // true while checking for a saved session on launch
  isSubmitting: boolean; // true while a login request is in flight
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On launch: restore the saved session immediately from the cached token +
  // user, so the app opens straight into the dashboard. Then validate the
  // token with /me in the background. Crucially, we ONLY log the user out if
  // the server explicitly rejects the token (401/403). A network error or
  // server hiccup leaves the session intact, which fixes the bug where
  // closing and reopening the app logged you out every time.
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getStoredToken();
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        const cachedUser = await getStoredUser();
        if (cachedUser) {
          // Restore session up front: user is logged in from this point.
          setToken(storedToken);
          setUser(cachedUser);
          setIsLoading(false);
        }

        // Background validation / refresh.
        try {
          const freshUser = await fetchMe(storedToken);
          setToken(storedToken);
          setUser(freshUser);
          await saveSession(storedToken, freshUser); // keep the cache fresh
        } catch (err) {
          const status = err instanceof AuthApiError ? err.status : -1;
          if (status === 401 || status === 403) {
            // Genuinely invalid/expired token: log out.
            await clearToken();
            setToken(null);
            setUser(null);
          }
          // Any other error (network, 500, timeout): keep the restored session.
        } finally {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await loginRequest(email, password);
      await saveSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
      return true;
    } catch (err) {
      const message = err instanceof AuthApiError ? err.message : 'Something went wrong.';
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await logoutRequest(token);
    }
    await clearToken();
    setToken(null);
    setUser(null);
  }, [token]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isSubmitting, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
