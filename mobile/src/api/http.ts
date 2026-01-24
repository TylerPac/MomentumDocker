import Constants from 'expo-constants';
import { loadAuthToken } from '@/storage/authToken';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiErrorPayload = {
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

function getDebuggerHost(): string | undefined {
  // Expo Go typically exposes a debugger host like "192.168.1.5:8081".
  // We use it as a best-effort fallback to infer a LAN IP for local development.
  const expoGoConfig = (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig;
  return expoGoConfig?.debuggerHost;
}

function inferDevApiBaseUrl(defaultPort: number): string | undefined {
  const debuggerHost = getDebuggerHost();
  if (!debuggerHost) return undefined;

  const host = debuggerHost.split(':')[0];
  if (!host) return undefined;

  return `http://${host}:${defaultPort}`;
}

function getApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

  // Prefer explicit config.
  if (extra?.apiBaseUrl) return extra.apiBaseUrl;

  // Best-effort dev fallback (Expo Go on device).
  const inferred = inferDevApiBaseUrl(8085);
  if (inferred) return inferred;

  // Android emulator fallback.
  return 'http://10.0.2.2:8085';
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
        if (first) {
          const message = [first.field, first.message].filter(Boolean).join(': ');
          return new Error(message || payload.message || `HTTP ${response.status}`);
        }
      }
      return new Error(payload?.message || `HTTP ${response.status}`);
    }

    const text = await response.text();
    return new Error(text || `HTTP ${response.status}`);
  } catch {
    return new Error(`HTTP ${response.status}`);
  }
}

async function parseErrorWithUrl(response: Response, url: string): Promise<Error> {
  const baseError = await parseError(response);
  // Include the full URL so 404s are immediately actionable (wrong host/port/path).
  return new Error(`${baseError.message} (${url})`);
}

export async function apiRequest<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = joinUrl(baseUrl, path);
  const token = await loadAuthToken();

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : undefined),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const hint =
      `Network request failed. Check that your backend is reachable from your phone.\n` +
      `Current base URL: ${baseUrl}\n` +
      `Tip: update app.json → expo.extra.apiBaseUrl to your LAN IP (not localhost).`;

    const message = err instanceof Error ? `${hint}\n\n${err.message}` : `${hint}\n\n${String(err)}`;
    throw new Error(message);
  }

  if (!response.ok) {
    throw await parseErrorWithUrl(response, url);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}
