// @ts-nocheck
const API_BASE =
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000";

// Runtime-safe teacher API wrapper (no TS-only syntax)
function getToken() {
  return localStorage.getItem("auth:token");
}

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function listTeachers() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/api/teachers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleResponse(res);
  return data.map((t) => ({ ...t, id: t._id || t.id }));
}

export async function createTeacher(data) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const payload = { ...data };
  if (payload.subjects && typeof payload.subjects === "string") {
    payload.subjects = payload.subjects.split(",").map((s) => s.trim());
  }
  if (payload.classes && typeof payload.classes === "string") {
    payload.classes = payload.classes.split(",").map((c) => c.trim());
  }
  const res = await fetch(`${API_BASE}/api/teachers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const responseData = await handleResponse(res);
  return { ...responseData.teacher, id: responseData.teacher._id };
}

export async function getTeacher(id) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await handleResponse(res);
  return { ...data, id: data._id || data.id };
}

export async function updateTeacher(id, data) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const payload = { ...data };
  if (payload.subjects && typeof payload.subjects === "string") {
    payload.subjects = payload.subjects.split(",").map((s) => s.trim());
  }
  if (payload.classes && typeof payload.classes === "string") {
    payload.classes = payload.classes.split(",").map((c) => c.trim());
  }
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const responseData = await handleResponse(res);
  return { ...responseData, id: responseData._id || responseData.id };
}

export async function deleteTeacher(id) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export default {
  listTeachers,
  createTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
};
