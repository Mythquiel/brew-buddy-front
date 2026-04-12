export function getAccessToken(): string | null {
  return localStorage.getItem('brew_buddy_access_token');
}

export function createOptionalAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  if (token) {
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

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

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
