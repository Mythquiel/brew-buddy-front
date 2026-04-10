/**
 * JWT utility functions for token validation
 */

interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  roles?: string[];
  exp: number;
  iat: number;
  iss?: string;
}

/**
 * Decode a JWT token without verification
 * Note: This only decodes the payload, it doesn't verify the signature
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Get the expiration time of a JWT token
 * @param token JWT token string
 * @returns Date object representing expiration time, or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Check if token will expire soon (within the next 5 minutes)
 * Useful for proactive token refresh
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const threshold = thresholdMinutes * 60 * 1000;

  return (expirationTime - currentTime) <= threshold;
}
