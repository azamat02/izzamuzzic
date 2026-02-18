const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export interface ImageUploadOptions {
  compressQuality?: number;
  compressMaxWidth?: number;
}

export interface VideoUploadOptions {
  compressPreset?: 'light' | 'medium' | 'heavy';
}

export interface UploadResult {
  url: string;
  filename: string;
  originalSize?: number;
  compressedSize?: number;
}

export interface VideoJobResult {
  jobId: string;
  compressing: true;
}

export interface CompressionJobStatus {
  status: 'compressing' | 'done' | 'error';
  progress: number;
  result?: { url: string; filename: string; originalSize: number; compressedSize: number };
  error?: string;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),

  uploadFile: async (file: File, options?: ImageUploadOptions): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.compressQuality != null) {
      formData.append('compressQuality', String(options.compressQuality));
    }
    if (options?.compressMaxWidth != null) {
      formData.append('compressMaxWidth', String(options.compressMaxWidth));
    }
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  uploadVideo: async (file: File, options?: VideoUploadOptions): Promise<UploadResult | VideoJobResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.compressPreset) {
      formData.append('compressPreset', options.compressPreset);
    }
    const res = await fetch(`${API_BASE}/upload/video`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Video upload failed' }));
      throw new Error(err.error || 'Video upload failed');
    }
    return res.json();
  },

  getCompressionStatus: async (jobId: string): Promise<CompressionJobStatus> => {
    const res = await fetch(`${API_BASE}/upload/video/status/${jobId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to get compression status');
    }
    return res.json();
  },

  login: (username: string, password: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  verifyToken: () => request<{ valid: boolean }>('/auth/verify'),
};
