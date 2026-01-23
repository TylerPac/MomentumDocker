import Constants from 'expo-constants';
import { loadAuthToken } from '@/storage/authToken';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

function getApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  return extra?.apiBaseUrl ?? 'http://10.0.2.2:8080';
}

function joinUrl(baseUrl: string, path: string): string {
  if (!path.startsWith('/')) return `${baseUrl}/${path}`;
  return `${baseUrl}${path}`;
}

async function parseError(response: Response): Promise<Error> {
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload?.errors?.length) {
        const first = payload.errors[0];
        const message = [first.field, first.message].filter(Boolean).join(': ');
        return new Error(message || payload.message || `HTTP ${response.status}`);
      }
      return new Error(payload?.message || `HTTP ${response.status}`);
    }

    const text = await response.text();
    return new Error(text || `HTTP ${response.status}`);
  } catch {
    return new Error(`HTTP ${response.status}`);
  }
}

export async function apiRequest<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = joinUrl(baseUrl, path);
  const token = await loadAuthToken();

  const response = await fetch(url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : undefined),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}
