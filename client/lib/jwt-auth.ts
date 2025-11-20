/**
 * Secure JWT-based authentication with token management
 * This module provides secure token handling and validation
 */

export interface UserInfo {
  id: string;
  email: string;
  role: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

// Store tokens and user info securely
export const storeTokens = (tokens: TokenData, userInfo: UserInfo) => {
  try {
    sessionStorage.setItem("access_token", tokens.accessToken);
    sessionStorage.setItem("refresh_token", tokens.refreshToken);
    sessionStorage.setItem("user_info", JSON.stringify(userInfo));
  } catch (error) {
    console.error("Failed to store authentication tokens:", error);
    throw new Error("Failed to store authentication data");
  }
};

// Get access token securely
export const getAccessToken = (): string | null => {
  try {
    return sessionStorage.getItem("access_token");
  } catch (error) {
    console.error("Failed to retrieve access token:", error);
    return null;
  }
};

// Get refresh token securely
export const getRefreshToken = (): string | null => {
  try {
    return sessionStorage.getItem("refresh_token");
  } catch (error) {
    console.error("Failed to retrieve refresh token:", error);
    return null;
  }
};

// Get user info from session storage securely
export const getUserInfo = (): UserInfo | null => {
  try {
    const userInfo = sessionStorage.getItem("user_info");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("Failed to retrieve user info:", error);
    return null;
  }
};

// Clear all auth data securely
export const clearAuthData = () => {
  try {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user_info");
  } catch (error) {
    console.error("Failed to clear authentication data:", error);
  }
};

// Check if user is authenticated by validating token presence
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  // Basic token validation (check if it's a JWT format)
  const tokenParts = token.split('.');
  return tokenParts.length === 3; // JWT should have 3 parts
};

// Refresh token function
export const refreshToken = async (): Promise<TokenData | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data?.access_token) {
        const newTokens: TokenData = {
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token || refreshToken
        };
        
        // Update stored tokens
        const userInfo = getUserInfo();
        if (userInfo) {
          storeTokens(newTokens, userInfo);
        }
        
        return newTokens;
      }
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

// Token validation function
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return response.ok;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
};