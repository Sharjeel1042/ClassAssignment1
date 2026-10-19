// All calls to the backend live here, so components never deal with fetch directly

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // The backend always answers with JSON (or an empty body)
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON: usually means the backend is not running
  }

  if (!res.ok) {
    const detail = data?.detail ?? `Request failed (${res.status}). Is the backend running?`;
    // Validation errors (422) come back as a list of messages
    throw new Error(Array.isArray(detail) ? detail.join("\n") : detail);
  }
  return data;
}

const enc = encodeURIComponent;

export const api = {
  submitApplication: (data) => request("POST", "/applications", data),
  getApplication: (id) => request("GET", `/applications/${enc(id)}`),
  checkEligibility: (id) => request("GET", `/applications/${enc(id)}/eligibility`),
  decide: (id, decision) => request("PATCH", `/applications/${enc(id)}/decision`, { decision }),
  enroll: (applicationId, courseId) =>
    request("POST", "/enrollments", { application_id: applicationId, course_id: courseId }),
};
