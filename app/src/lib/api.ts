const BASE = "";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) =>
    request<T>("GET", path, undefined, token),
  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>("POST", path, body, token),
  put: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>("PUT", path, body, token),
  patch: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>("PATCH", path, body, token),
  delete: <T>(path: string, token?: string | null) =>
    request<T>("DELETE", path, undefined, token),
};

export function getToken(): string | null {
  return localStorage.getItem("rb_token");
}
export function setToken(t: string) {
  localStorage.setItem("rb_token", t);
}
export function clearToken() {
  localStorage.removeItem("rb_token");
}
