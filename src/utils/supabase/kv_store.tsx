import { projectId, publicAnonKey } from './info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0f9c0abd`;

export async function get(key: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    const result = await response.json();
    return result.success ? result.value : null;
  } catch (error) {
    console.error('Error getting KV value:', error);
    return null;
  }
}

export async function set(key: string, value: any): Promise<void> {
  // Validate value is not null or undefined
  if (value === null || value === undefined) {
    console.error(`Attempted to set null/undefined value for key: ${key}`);
    throw new Error('Cannot set null or undefined value in KV store');
  }

  const response = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ value }),
  });

  const result = await response.json();
  if (!result.success) {
    console.error(`Failed to set KV value for key ${key}:`, result.error);
    throw new Error(result.error || 'Failed to set KV value');
  }
}

export async function del(key: string): Promise<void> {
  const response = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete KV value');
  }
}

export async function mget(keys: string[]): Promise<any[]> {
  const values = await Promise.all(keys.map(key => get(key)));
  return values.filter(v => v !== null);
}

export async function mset(entries: [string, any][]): Promise<void> {
  // Filter out entries with null or undefined values
  const validEntries = entries.filter(([key, value]) => {
    if (value === null || value === undefined) {
      console.warn(`Skipping null/undefined value for key: ${key}`);
      return false;
    }
    return true;
  });
  
  await Promise.all(validEntries.map(([key, value]) => set(key, value)));
}

export async function mdel(keys: string[]): Promise<void> {
  await Promise.all(keys.map(key => del(key)));
}

export async function getByPrefix(prefix: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/kv/prefix-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ prefix }),
    });
    
    const result = await response.json();
    return result.success ? result.values : [];
  } catch (error) {
    console.error('Error searching KV by prefix:', error);
    return [];
  }
}
