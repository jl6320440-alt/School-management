const API_BASE = (import.meta.env.VITE_REACT_APP_BACKEND_URL as string) || 'http://localhost:5000';

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function get(key: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`);
    const j = await safeJson(res);
    return j?.success ? j.value : null;
  } catch (error) {
    console.warn(`KV Get failed for key: ${key}`);
    return null;
  }
}

export async function set(key: string, value: any): Promise<void> {
  try {
    if (value === null || value === undefined) throw new Error('Cannot set null/undefined');
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    const j = await safeJson(res);
    if (!j?.success) throw new Error(j?.error || 'Failed to set KV');
  } catch (error) {
    console.warn(`KV Set failed for key: ${key}`, error);
  }
}

export async function del(key: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/kv/${encodeURIComponent(key)}`, { method: 'DELETE' });
    const j = await safeJson(res);
    if (!j?.success) throw new Error(j?.error || 'Failed to delete KV');
  } catch (error) {
    console.warn(`KV Delete failed for key: ${key}`, error);
  }
}

export async function mget(keys: string[]): Promise<any[]> {
  const vals = await Promise.all(keys.map(get));
  return vals.filter(v => v !== null);
}

export async function mset(entries: [string, any][]): Promise<void> {
  await Promise.all(entries.map(([k, v]) => set(k, v)));
}

export async function mdel(keys: string[]): Promise<void> {
  await Promise.all(keys.map(k => del(k)));
}

export async function getByPrefix(prefix: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/kv/prefix-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix }),
    });
    const j = await safeJson(res);
    return j?.success ? j.values : [];
  } catch (error) {
    console.warn(`KV Store API not available (prefix: ${prefix}), returning empty array`);
    return [];
  }
}

export async function uploadFile(file: File, filename?: string): Promise<{ publicUrl: string } | null> {
  const form = new FormData();
  form.append('file', file);
  if (filename) form.append('filename', filename);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
  const j = await safeJson(res);
  if (j?.success) return j.data;
  return null;
}

export async function initDemoData(): Promise<any> {
  const res = await fetch(`${API_BASE}/init-demo-data`, { method: 'POST' });
  return safeJson(res);
}

export default {
  get,
  set,
  del,
  mget,
  mset,
  mdel,
  getByPrefix,
  uploadFile,
  initDemoData,
};
