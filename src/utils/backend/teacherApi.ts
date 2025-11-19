const API_BASE = (import.meta.env.VITE_REACT_APP_BACKEND_URL as string) || 'http://localhost:5000';

export interface TeacherData {
  name: string;
  email: string;
  password?: string;
  staffId?: string;
  subjects?: string[];
  qualification?: string;
  experience?: number;
  department?: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface Teacher extends TeacherData {
  _id?: string;
  id: string;
}

function getToken(): string | null {
  return localStorage.getItem('auth:token');
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function listTeachers(): Promise<Teacher[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/teachers`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await handleResponse(res);
  return data.map((t: any) => ({ ...t, id: t._id || t.id }));
}

export async function createTeacher(data: TeacherData): Promise<Teacher> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const payload: any = { ...data };
  if (payload.subjects && typeof payload.subjects === 'string') {
    payload.subjects = payload.subjects.split(',').map((s: string) => s.trim());
  }
  const res = await fetch(`${API_BASE}/api/teachers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const responseData = await handleResponse(res);
  return { ...responseData.teacher, id: responseData.teacher._id };
}

export async function getTeacher(id: string): Promise<Teacher> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await handleResponse(res);
  return { ...data, id: data._id || data.id };
}

export async function updateTeacher(id: string, data: Partial<TeacherData>): Promise<Teacher> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const payload: any = { ...data };
  if (payload.subjects && typeof payload.subjects === 'string') {
    payload.subjects = payload.subjects.split(',').map((s: string) => s.trim());
  }
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const responseData = await handleResponse(res);
  return { ...responseData, id: responseData._id || responseData.id };
}

export async function deleteTeacher(id: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
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
