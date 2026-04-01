const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
}

interface AuthTokenResponse {
  token: string;
  type: string;
}

let jwtToken = '';

function getHeaders(withAuth: boolean): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (withAuth && jwtToken) {
    headers.Authorization = `Bearer ${jwtToken}`;
  }
  return headers;
}

async function ensureToken(): Promise<void> {
  if (jwtToken) return;
  const response = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Não foi possível autenticar na API');
  }

  const result = (await response.json()) as AuthTokenResponse;
  jwtToken = result.token;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  if (auth) {
    await ensureToken();
  }

  let response = await fetch(`${API_URL}${path}`, {
    method,
    headers: getHeaders(auth),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (auth && response.status === 401) {
    jwtToken = '';
    await ensureToken();
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: getHeaders(auth),
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  if (!response.ok) {
    let message = 'Erro inesperado';
    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(', ');
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
