import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const unwrapResumePayload = (payload: any) => ('resume' in payload ? payload.resume : payload);
const unwrapResumesPayload = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.resumes)) return payload.resumes;
  return [];
};

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  googleLogin: async (idToken: string) => {
    const { data } = await api.post('/auth/google', { idToken });
    return data;
  },
};

export const resumeService = {
  create: async (resumeData: any) => {
    const { data } = await api.post('/resumes', resumeData);
    return data;
  },
  
  getMyResumes: async () => {
    const { data } = await api.get('/resumes/me');
    return unwrapResumesPayload(data);
  },
  
  getResume: async (id: string) => {
    const { data } = await api.get(`/resumes/${id}`);
    return unwrapResumePayload(data);
  },
  
  downloadPDF: async (id: string, template?: string) => {
    const response = await api.get(`/resumes/${id}/pdf`, {
      params: template ? { template } : undefined,
      responseType: 'blob',
    });
    return response.data;
  },
  
  getQR: async (id: string, template?: string) => {
    const { data } = await api.get(`/resumes/${id}/qr`, {
      params: template ? { template } : undefined,
    });
    return data;
  },
  
  createVersion: async (id: string, version: any) => {
    const { data } = await api.post(`/resumes/${id}/versions`, { version });
    return data;
  },
  
  setCurrentVersion: async (id: string, index: number) => {
    const { data } = await api.patch(`/resumes/${id}/current-version`, { index });
    return data;
  },
  
  addComment: async (id: string, authorName: string, text: string) => {
    const { data } = await api.post(`/resumes/${id}/comments`, { authorName, text });
    return data;
  },
  
  uploadMedia: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('media', file);
    const { data } = await api.post(`/resumes/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export const publicService = {
  getResume: async (slug: string) => {
    const { data } = await api.get(`/public/resume/${slug}`);
    return unwrapResumePayload(data);
  },
};
