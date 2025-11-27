import type { AuthResponse, TreeResponse } from './types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000/api';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | null;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type');
  const data = contentType && contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || 'Request failed';
    throw new Error(errorMessage);
  }

  return data as T;
}

export const authApi = {
  register: (username: string, password: string) => request<AuthResponse>('auth/register', {
    method: 'POST',
    body: { username, password },
  }),
  login: (username: string, password: string) => request<AuthResponse>('auth/login', {
    method: 'POST',
    body: { username, password },
  }),
  upgrade: (token: string) => request<AuthResponse>('auth/upgrade', {
    method: 'POST',
    token,
  }),
  me: (token: string) => request<{ user: AuthResponse['user'] }>('auth/me', {
    method: 'GET',
    token,
  }),
};

export const calcApi = {
  fetchTree: () => request<TreeResponse>('calc'),
  startChain: (value: number, token: string) => request('calc/start', {
    method: 'POST',
    body: { value },
    token,
  }),
  reply: (parentId: string, operation: string, inputNumber: number, token: string) => request('calc/reply', {
    method: 'POST',
    body: { parentId, operation, inputNumber },
    token,
  }),
};
