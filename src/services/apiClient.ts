import { authService } from './authService';
import { isTokenExpired } from '../utils/jwt';

const ACCESS_TOKEN_KEY = 'brew_buddy_access_token';
const REFRESH_TOKEN_KEY = 'brew_buddy_refresh_token';
const USER_KEY = 'brew_buddy_user';

let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function createOptionalAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  if (token && !isTokenExpired(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export function createAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  if (token && !isTokenExpired(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (refreshToken && !isTokenExpired(refreshToken)) {
    try {
      const response = await authService.refresh(refreshToken);

      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      return response.accessToken;
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  }

  return null;
}

async function getValidAccessToken(required: boolean): Promise<string | null> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token && !isTokenExpired(token)) {
    return token;
  }

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (refreshToken && !isTokenExpired(refreshToken)) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    try {
      return await refreshPromise;
    } catch (error) {
      if (required) {
        throw error;
      }
    }
  } else if (token || refreshToken) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  if (required) {
    throw new Error('Authentication required');
  }

  return null;
}

function toHeadersObject(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers as Record<string, string>;
}

async function createRequestHeaders(
  options: RequestInit,
  required: boolean
): Promise<Record<string, string>> {
  const headers = toHeadersObject(options.headers);
  const token = await getValidAccessToken(required);
  const hasContentType = Object.keys(headers).some(
    (header) => header.toLowerCase() === 'content-type'
  );

  if (options.body && !(options.body instanceof FormData) && !hasContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await createRequestHeaders(options, true);

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function optionalAuthenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await createRequestHeaders(options, false);

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function authGet<T>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.statusText}`);
  }

  return response.json();
}

export async function authPost<T>(url: string, data: unknown): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed: ${response.statusText}`);
  }

  return response.json();
}

export async function authPut<T>(url: string, data: unknown): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`PUT ${url} failed: ${response.statusText}`);
  }

  return response.json();
}

export async function authPatch<T>(url: string, data: unknown): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`PATCH ${url} failed: ${response.statusText}`);
  }

  return response.json();
}

export async function authDelete(url: string): Promise<void> {
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`DELETE ${url} failed: ${response.statusText}`);
  }
}
