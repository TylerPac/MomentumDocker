const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken() {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token) {
  try {
    if (!token) {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch {
    // ignore
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('/api') ? path : `/api${path}`;

  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = (typeof FormData !== 'undefined') && (options.body instanceof FormData);
  if (!headers.has('Content-Type') && options.body != null && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let data = null;
    try {
      data = await res.json();
      if (data?.error) message = data.error;
      else if (data?.message) message = data.message;
      else if (data?.detail) message = data.detail;
    } catch {
      // ignore
    }
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  return null;
}
