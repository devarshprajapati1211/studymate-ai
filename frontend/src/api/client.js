const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('studymate_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Handle unauthenticated
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/demo/')) {
      localStorage.removeItem('studymate_token');
      localStorage.removeItem('studymate_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/auth/me'),

  // Demo
  seedDemo: () => apiRequest('/demo/seed', { method: 'POST' }),

  // Student Profile & Onboarding
  getProfile: () => apiRequest('/student/profile'),
  updateProfile: (profileData) => apiRequest('/student/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  submitOnboarding: (data) => apiRequest('/student/onboarding', { method: 'POST', body: JSON.stringify(data) }),

  // Subjects
  getSubjects: () => apiRequest('/subjects'),
  createSubject: (subj) => apiRequest('/subjects', { method: 'POST', body: JSON.stringify(subj) }),
  updateSubject: (id, subj) => apiRequest(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(subj) }),
  deleteSubject: (id) => apiRequest(`/subjects/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => apiRequest('/dashboard'),

  // Study Plan
  getStudyPlan: () => apiRequest('/study-plan'),
  regenerateStudyPlan: () => apiRequest('/study-plan/regenerate', { method: 'POST' }),

  // Tasks
  getTasks: (params = '') => apiRequest(`/tasks${params ? `?${params}` : ''}`),
  createTask: (task) => apiRequest('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  toggleTaskComplete: (taskId, completed) => apiRequest(`/tasks/${taskId}/complete`, {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  }),
  rescheduleMissedTasks: () => apiRequest('/tasks/reschedule-missed', { method: 'POST' }),

  // Progress
  getProgress: () => apiRequest('/progress'),

  // AI Assistant
  chatWithAI: (message, history = []) => apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  }),
  getAIStatus: () => apiRequest('/ai/status'),
};
