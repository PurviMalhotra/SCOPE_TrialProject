import { API_BASE_URL, authHeaders } from "./authService";

export async function getRequests() {
  const response = await fetch(
    `${API_BASE_URL}/api/event-requests`,
    {
      headers: authHeaders(),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || "Failed to fetch requests");
  }

  return body.data;
}

export async function createRequest(data) {
  const response = await fetch(
    `${API_BASE_URL}/api/event-requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(data),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || "Failed to create request");
  }

  return body.data;
}

export async function updateRequest(id, data) {
  const response = await fetch(
    `${API_BASE_URL}/api/event-requests/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(data),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || "Failed to update request");
  }

  return body.data;
}

export async function deleteRequest(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/event-requests/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || "Failed to delete request");
  }

  return body.data;
}