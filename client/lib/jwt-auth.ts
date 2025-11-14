/**
 * JWT-based authentication with secure token management
 * This replaces plain localStorage usage with secure, token-based auth
 */

interface JWTPayload {
  id: string;
  email: string;
  role: "worker" | "homeowner" | "admin";
  iat: number;
  exp: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const TOKEN_EXPIRY = 3600; // 1 hour in seconds
const REFRESH_TOKEN_EXPIRY = 604800; // 7 days in seconds

/**
 * Encode JWT token (client-side simulation)
 * In production, this should be done by the backend
 */
export const encodeJWT = (payload: Omit<JWTPayload, "iat" | "exp">, expirySeconds = TOKEN_EXPIRY): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expirySeconds,
  };
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  const signature = btoa("client-side-signature-placeholder");

  return `${header}.${encodedPayload}.${signature}`;
};

/**
 * Decode and validate JWT token
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload) return true;
  return payload.exp < Math.floor(Date.now() / 1000);
};

/**
 * Store tokens securely
 */
export const storeTokens = (tokens: AuthTokens): void => {
  // In production, use httpOnly cookies via backend
  // For now, store in sessionStorage (more secure than localStorage for sensitive data)
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, tokens.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
};

/**
 * Get access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token && !isTokenExpired(token)) {
    return token;
  }

  return null;
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Clear all tokens
 */
export const clearTokens = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();

    if (data.success && data.data?.accessToken) {
      storeTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken || refreshToken,
      });
      return data.data.accessToken;
    }

    clearTokens();
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    return null;
  }
};

/**
 * Get current user from token
 */
export const getCurrentUser = (): (Omit<JWTPayload, "iat" | "exp"> & { isAuthenticated: boolean }) | null => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    isAuthenticated: true,
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Get user role
 */
export const getUserRole = (): "worker" | "homeowner" | "admin" | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

/**
 * Add JWT token to request headers
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
