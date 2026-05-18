export async function parseResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch("http://localhost:5000/api/resume/parse", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to parse resume");
  }

  return response.json();
}
