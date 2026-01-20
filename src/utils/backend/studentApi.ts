const API_BASE = (import.meta.env.VITE_REACT_APP_BACKEND_URL as string) || 'http://localhost:5000';

export interface StudentData {
  name: string;
  email: string;
  password?: string;
  admissionNumber?: string;
  className?: string;
  classId?: string;
  section?: string;
  guardianName?: string;
  guardianPhone?: string;
  parentContact?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  rollNumber?: string;
  dateOfBirth?: string;
  dob?: string;
  status?: string;
  enrollmentDate?: string;
  studentCode?: string;
}

export interface Student extends StudentData {
  _id?: string;
  id: string;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Get auth token from localStorage
function getToken(): string | null {
  return localStorage.getItem('auth:token');
}

export async function listStudents(): Promise<Student[]> {
  try {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/api/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await handleResponse(res);
    // Map _id to id for frontend compatibility
    return data.map((student: any) => ({
      ...student,
      id: student._id || student.id,
    }));
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return [];
  }
}

export async function createStudent(data: StudentData): Promise<Student> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  // Generate a temporary password if not provided
  const password = data.password || Math.random().toString(36).slice(-8);
  
  // Generate admission number if not provided (use studentCode or create new one)
  const admissionNumber = data.admissionNumber || data.studentCode || `ADM-${Date.now()}`;
  
  // Build a payload that matches backend expectations (Joi schema).
  // The backend expects: name, email, password, admissionNumber, dob, parentContact, classId, section, guardianName, guardianPhone
  const payload: any = {
    name: data.name,
    email: data.email,
    password,
    admissionNumber,
    dob: data.dateOfBirth || data.dob || undefined,
    parentContact: data.parentContact || data.guardianPhone || undefined,
    classId: data.classId || undefined,
    rollNumber: data.rollNumber || undefined,
    section: data.section || undefined,
    guardianName: data.guardianName || undefined,
    guardianPhone: data.guardianPhone || undefined,
    avatar: data.avatar || undefined,
    studentCode: data.studentCode || undefined,
  };

  // Remove undefined properties so Joi won't see extra/unknown fields
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const res = await fetch(`${API_BASE}/api/students`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const responseData = await handleResponse(res);
  // Map _id to id for frontend compatibility
  return {
    ...responseData,
    id: responseData._id || responseData.id,
  };
}

export async function getStudent(id: string): Promise<Student> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const responseData = await handleResponse(res);
  // Map _id to id for frontend compatibility
  return {
    ...responseData,
    id: responseData._id || responseData.id,
  };
}

export async function getStudentByCode(code: string): Promise<Student | null> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/api/students/by-code/${encodeURIComponent(code)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 404) return null;
  const responseData = await handleResponse(res);
  return {
    ...responseData,
    id: responseData._id || responseData.id,
  };
}

export async function updateStudent(id: string, data: Partial<StudentData>): Promise<Student> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  // Only send fields allowed by backend update schema: classId, section, guardianName, guardianPhone, parentContact, status
  const payload: any = {
    classId: data.classId || undefined,
    rollNumber: data.rollNumber || undefined,
    section: data.section || undefined,
    guardianName: data.guardianName || undefined,
    guardianPhone: data.guardianPhone || undefined,
    parentContact: data.parentContact || data.guardianPhone || undefined,
    status: data.status || undefined,
  };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const responseData = await handleResponse(res);
  return {
    ...responseData,
    id: responseData._id || responseData.id,
  };
}

export async function deleteStudent(id: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(res);
}

export default {
  listStudents,
  createStudent,
  getStudent,
  getStudentByCode,
  updateStudent,
  deleteStudent,
};
