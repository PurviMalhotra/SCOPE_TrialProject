export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5500";
const TOKEN_KEY = "scope_auth_token";

export const DEV_LOGIN_EMAIL =
  import.meta.env.VITE_DEV_LOGIN_EMAIL || "rahul.sharma@vit.ac.in";

export function getGoogleLoginUrl() {
  return `${API_BASE_URL}/api/auth/google`;
}

export async function getAuthConfig() {
  const response = await fetch(`${API_BASE_URL}/api/auth/config`);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || "Unable to load auth config");
  }

  return body.data;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(token = getStoredToken()) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function devLogin(email = DEV_LOGIN_EMAIL) {
  const response = await fetch(`${API_BASE_URL}/api/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || "Dev login failed");
  }

  storeToken(body.data.token);
  return body.data;
}

export async function getCurrentUser(token = getStoredToken()) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: authHeaders(token),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || "Unable to fetch current user");
  }

  return body.data;
}

export async function logoutUser(token = getStoredToken()) {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok && response.status !== 401) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Unable to log out");
  }
}
