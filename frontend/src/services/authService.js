export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5500";
const TOKEN_KEY = "scope_auth_token";

export function getGoogleLoginUrl() {
  return `${API_BASE_URL}/api/auth/google`;
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
