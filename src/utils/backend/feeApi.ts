const API_BASE = (import.meta.env.VITE_REACT_APP_BACKEND_URL as string) || 'http://localhost:5000';

export interface Fee {
  _id: string;
  studentId: string;
  studentName: string;
  feeType: 'tuition' | 'transport' | 'uniform' | 'books' | 'activities' | 'hostel' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount: number;
  paidDate?: string;
  notes?: string;
}

export interface FeeSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
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

export async function listFees(studentId?: string, status?: string): Promise<Fee[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (studentId) params.append('studentId', studentId);
  if (status) params.append('status', status);

  const res = await fetch(`${API_BASE}/api/fees?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(res);
}

export async function createFee(data: {
  student: string;
  feeType: string;
  amount: number;
  dueDate: string;
  notes?: string;
}): Promise<Fee> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/fees`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateFee(id: string, data: Partial<Fee>): Promise<Fee> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/fees/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteFee(id: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/fees/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(res);
}

export async function getStudentFeeSummary(studentId: string): Promise<FeeSummary> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/fees/student/${studentId}/summary`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(res);
}

export default {
  listFees,
  createFee,
  updateFee,
  deleteFee,
  getStudentFeeSummary,
};
