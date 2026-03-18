import { Category, KnowledgeBlock, Prompt } from '../data';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(response.status, data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () =>
    fetchAPI('/auth/logout', { method: 'POST' }),

  me: () =>
    fetchAPI<any>('/auth/me'),
};

// Knowledge Blocks API
export const knowledgeAPI = {
  getAll: () =>
    fetchAPI('/knowledge'),

  getById: (id: string) =>
    fetchAPI(`/knowledge/${id}`),

  create: (data: Partial<KnowledgeBlock>) =>
    fetchAPI('/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<KnowledgeBlock>) =>
    fetchAPI(`/knowledge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI(`/knowledge/${id}`, { method: 'DELETE' }),

  batchDelete: (ids: string[]) =>
    fetchAPI('/knowledge/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
};

// Prompts API
export const promptsAPI = {
  getAll: () =>
    fetchAPI('/prompts'),

  getById: (id: string) =>
    fetchAPI(`/prompts/${id}`),

  create: (data: Partial<Prompt>) =>
    fetchAPI('/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Prompt>) =>
    fetchAPI(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI(`/prompts/${id}`, { method: 'DELETE' }),
};

// Categories API
export const categoriesAPI = {
  getAll: () =>
    fetchAPI('/categories'),

  create: (data: Partial<Category>) =>
    fetchAPI('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Category>) =>
    fetchAPI(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI(`/categories/${id}`, { method: 'DELETE' }),
};
