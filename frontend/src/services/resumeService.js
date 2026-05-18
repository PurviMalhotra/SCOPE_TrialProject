export async function parseResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const apiUrl = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_URL}/api/resume/parse`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to parse resume");
  }

  return response.json();
}
