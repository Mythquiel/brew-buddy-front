// API Client utility for making authenticated requests to brew-buddy-back

/**
 * Get the stored access token from localStorage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('brew_buddy_access_token');
}

/**
 * Create fetch options with Authorization header if token exists
 */
export function createAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Make an authenticated fetch request
 * Automatically adds Authorization header with JWT token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = createAuthHeaders(options.headers as Record<string, string>);

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper for making authenticated GET requests
 */
export async function authGet<T>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper for making authenticated POST requests
 */
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

/**
 * Helper for making authenticated PUT requests
 */
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

/**
 * Helper for making authenticated PATCH requests
 */
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

/**
 * Helper for making authenticated DELETE requests
 */
export async function authDelete(url: string): Promise<void> {
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`DELETE ${url} failed: ${response.statusText}`);
  }
}
