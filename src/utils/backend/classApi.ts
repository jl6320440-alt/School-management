const API_BASE = (import.meta.env.VITE_REACT_APP_BACKEND_URL as string) || 'http://localhost:5000';

export interface ClassData {
  name: string;
  code: string;
  grade: string;
  subject: string;
  teacherId?: string;
  capacity?: number;
  schedule?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  location?: string;
  status?: 'active' | 'archived';
}

export interface Class extends ClassData {
  _id?: string;
  id: string;
  teacher?: {
    _id: string;
    name: string;
    email: string;
  } | null;
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

export async function listClasses(filters?: {
  status?: 'active' | 'archived' | 'all';
  grade?: string;
  subject?: string;
  teacherId?: string;
}): Promise<Class[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.grade) params.append('grade', filters.grade);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.teacherId) params.append('teacherId', filters.teacherId);

  const query = params.toString();
  const url = `${API_BASE}/api/classes${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await handleResponse(res);
  return data.map((c: any) => ({ ...c, id: c._id || c.id }));
}

export async function createClass(data: ClassData): Promise<Class> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  const createdClass = await handleResponse(res);
  return { ...createdClass, id: createdClass._id || createdClass.id };
}

export async function updateClass(id: string, data: Partial<ClassData>): Promise<Class> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  const updatedClass = await handleResponse(res);
  return { ...updatedClass, id: updatedClass._id || updatedClass.id };
}

export async function deleteClass(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  await handleResponse(res);
}

export async function getClass(id: string): Promise<Class> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/classes/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await handleResponse(res);
  return { ...data, id: data._id || data.id };
}