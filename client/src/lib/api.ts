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

function uploadWithProgress<T>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${url}`);

    const token = localStorage.getItem('admin_token');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || 'Upload failed'));
        }
      } catch {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),

  uploadFile: (file: File, options?: ImageUploadOptions, onProgress?: (percent: number) => void): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.compressQuality != null) {
      formData.append('compressQuality', String(options.compressQuality));
    }
    if (options?.compressMaxWidth != null) {
      formData.append('compressMaxWidth', String(options.compressMaxWidth));
    }
    return uploadWithProgress<UploadResult>('/upload', formData, onProgress);
  },

  uploadVideo: (file: File, options?: VideoUploadOptions, onProgress?: (percent: number) => void): Promise<UploadResult | VideoJobResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.compressPreset) {
      formData.append('compressPreset', options.compressPreset);
    }
    return uploadWithProgress<UploadResult | VideoJobResult>('/upload/video', formData, onProgress);
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
