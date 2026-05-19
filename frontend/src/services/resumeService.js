import { API_BASE_URL, authHeaders } from "./authService";

export async function parseResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(`${API_BASE_URL}/api/resume/parse`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Failed to parse resume");
  }

  return response.json();
}
