const API_BASE = (import.meta.env.VITE_REACT_APP_BACKEND_URL as string) || 'http://localhost:5000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    avatar?: string;
    phone?: string;
    address?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  phone?: string;
  address?: string;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  console.log('🔐 Attempting login to:', `${API_BASE}/api/auth/login`, 'with email:', credentials.email);
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  console.log('📡 Backend response status:', res.status);
  return handleResponse(res);
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getCurrentUser(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function updateProfile(token: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export default {
  login,
  register,
  getCurrentUser,
  updateProfile,
};
