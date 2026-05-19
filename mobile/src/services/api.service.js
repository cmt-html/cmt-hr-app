import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://10.0.2.2:5000/api'; // Standard Android Emulator IP to reach localhost

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

import * as NavigationService from './NavigationService';

// Request interceptor — inject Bearer token AND x-tenant-slug header
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Multi-tenancy: inject tenant slug header on every request
    const tenantSlug = await AsyncStorage.getItem('tenantSlug');
    if (tenantSlug) {
      config.headers['x-tenant-slug'] = tenantSlug;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session Expired / Unauthorized - clear storage and redirect to Login
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('tenantSlug');
      NavigationService.navigate('Login');
    }
    if (error.response?.status === 402) {
      // Subscription Expired / Payment Required
      NavigationService.navigate('Subscription');
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ───────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password, subdomain = '') => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      // Persist tenant slug from subdomain or JWT user data
      const slug = subdomain || response.data.user?.organizationSlug || '';
      if (slug) await AsyncStorage.setItem('tenantSlug', slug);
    }
    return response.data;
  },
  registerOrganization: async (orgData) => {
    const response = await api.post('/auth/register', orgData);
    if (response.data.organization?.slug) {
      await AsyncStorage.setItem('tenantSlug', response.data.organization.slug);
    }
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('tenantSlug');
  },
};

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

// ─── ATTENDANCE ─────────────────────────────────────────────────────────────
export const attendanceService = {
  checkIn: async (userId, location) => {
    const response = await api.post('/attendance/check-in', { userId, location });
    return response.data;
  },
  checkOut: async (userId, location) => {
    const response = await api.post('/attendance/check-out', { userId, location });
    return response.data;
  },
  getHistory: async (userId) => {
    const response = await api.get(`/attendance/history/${userId}`);
    return response.data;
  },
  getReportData: async (month, year) => {
    const response = await api.get('/attendance/report-data', {
      params: { month, year }
    });
    return response.data;
  },
  regularize: async (data) => {
    const response = await api.post('/attendance/regularize', data);
    return response.data;
  },
};

// ─── EMPLOYEES & PROFILE ─────────────────────────────────────────────────────
export const userService = {
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },
  inviteEmployee: async (data) => {
    const response = await api.post('/employees/invite', data);
    return response.data;
  },
  getInvites: async () => {
    const response = await api.get('/employees/invites');
    return response.data;
  },
  getProfile: async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },
  updateProfile: async (userId, data) => {
    const response = await api.put(`/profile/${userId}`, data);
    return response.data;
  },
};

// ─── LEAVES ──────────────────────────────────────────────────────────────────
export const leaveService = {
  getStats: async (userId) => {
    const response = await api.get(`/leave/stats/${userId}`);
    return response.data;
  },
  getHistory: async (userId) => {
    const response = await api.get(`/leave/history/${userId}`);
    return response.data;
  },
  applyLeave: async (leaveData) => {
    const response = await api.post('/leave/apply', leaveData);
    return response.data;
  },
  getRequests: async (managerId) => {
    const response = await api.get('/leave/requests', { params: { managerId } });
    return response.data;
  },
  approveLeave: async (leaveId, status) => {
    const response = await api.put(`/leave/approve/${leaveId}`, { status });
    return response.data;
  },
};

// ─── PERFORMANCE (OKRs & REVIEWS) ────────────────────────────────────────────
export const performanceService = {
  createGoal: async (data) => {
    const response = await api.post('/goals', data);
    return response.data;
  },
  getGoals: async (userId) => {
    const response = await api.get(`/goals/${userId}`);
    return response.data;
  },
  updateGoalProgress: async (goalId, currentValue, status) => {
    const response = await api.put(`/goals/${goalId}`, { currentValue, status });
    return response.data;
  },
  approveGoal: async (goalId) => {
    const response = await api.put(`/goals/${goalId}/approve`);
    return response.data;
  },
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
  submitSelfReview: async (reviewId, selfReview) => {
    const response = await api.put(`/reviews/${reviewId}/self`, { selfReview });
    return response.data;
  },
  submitManagerReview: async (reviewId, rating, comments) => {
    const response = await api.put(`/reviews/${reviewId}/manager`, { rating, comments });
    return response.data;
  },
  getReviews: async (userId) => {
    const response = await api.get(`/reviews/${userId}`);
    return response.data;
  },
};

// ─── HIRING & ONBOARDING ─────────────────────────────────────────────────────
export const hiringService = {
  createJob: async (data) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },
  getJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },
  applyJob: async (data) => {
    const response = await api.post('/jobs/apply', data);
    return response.data;
  },
  getApplicants: async () => {
    const response = await api.get('/applicants');
    return response.data;
  },
  updateApplicantStatus: async (applicantId, status) => {
    const response = await api.put(`/applicants/${applicantId}/status`, { status });
    return response.data;
  },
  updateOnboardingTask: async (applicantId, taskId, status) => {
    const response = await api.put(`/applicants/${applicantId}/onboarding-task`, { taskId, status });
    return response.data;
  },
};

// ─── OFFBOARDING / SEPARATIONS ───────────────────────────────────────────────
export const offboardingService = {
  requestSeparation: async (data) => {
    const response = await api.post('/separations', data);
    return response.data;
  },
  getSeparations: async () => {
    const response = await api.get('/separations');
    return response.data;
  },
  updateExitStatus: async (exitId, status) => {
    const response = await api.put(`/separations/${exitId}/status`, { status });
    return response.data;
  },
  updateExitTask: async (exitId, taskId, status) => {
    const response = await api.put(`/separations/${exitId}/offboarding-task`, { taskId, status });
    return response.data;
  },
};

// ─── HELP DESK TICKETS ───────────────────────────────────────────────────────
export const ticketService = {
  create: async (data) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },
  getAll: async (userId) => {
    const response = await api.get(`/tickets${userId ? `?userId=${userId}` : ''}`);
    return response.data;
  },
  addComment: async (ticketId, commentData) => {
    const response = await api.post(`/tickets/${ticketId}/comment`, commentData);
    return response.data;
  },
  updateStatus: async (ticketId, status) => {
    const response = await api.put(`/tickets/${ticketId}/status`, { status });
    return response.data;
  },
};

// ─── ANNOUNCEMENTS / NOTICE BOARD ────────────────────────────────────────────
export const announcementService = {
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },
  createAnnouncement: async (announcementData) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },
  likeAnnouncement: async (announcementId, userId) => {
    const response = await api.put(`/announcements/${announcementId}/like`, { userId });
    return response.data;
  },
  // Field name synced to web backend: `text` (not `comment`)
  commentAnnouncement: async (announcementId, commentText, userName, userId) => {
    const response = await api.post(`/announcements/${announcementId}/comment`, {
      userId,
      userName,
      text: commentText,    // ← synced to backend field name
      comment: commentText, // ← kept as fallback for legacy support
    });
    return response.data;
  },
};

// ─── PROJECT TIMESHEETS ──────────────────────────────────────────────────────
export const timesheetService = {
  log: async (data) => {
    const response = await api.post('/timesheets', data);
    return response.data;
  },
  get: async (userId) => {
    const response = await api.get(`/timesheets${userId ? `?userId=${userId}` : ''}`);
    return response.data;
  },
  updateStatus: async (timesheetId, status) => {
    const response = await api.put(`/timesheets/${timesheetId}/status`, { status });
    return response.data;
  },
};

// ─── CUSTOM FORM FIELDS (SYSTEM TOOLS) ───────────────────────────────────────
export const formBuilderService = {
  createField: async (data) => {
    const response = await api.post('/custom-fields', data);
    return response.data;
  },
  getFields: async () => {
    const response = await api.get('/custom-fields');
    return response.data;
  },
  deleteField: async (fieldId) => {
    const response = await api.delete(`/custom-fields/${fieldId}`);
    return response.data;
  },
};

// ─── DOCUMENT VAULT ──────────────────────────────────────────────────────────
export const documentService = {
  upload: async (data) => {
    const response = await api.post('/documents/upload', data);
    return response.data;
  },
  get: async (userId) => {
    const response = await api.get(`/documents/${userId}`);
    return response.data;
  },
};

// ─── SAAS & BILLING ──────────────────────────────────────────────────────────
export const saasService = {
  getPlans: async () => {
    const response = await api.get('/saas/plans');
    return response.data;
  },
  createCheckout: async (planId) => {
    const response = await api.post('/saas/checkout', { planId });
    return response.data;
  },
  upgrade: async (planId, simulateFailure = false) => {
    const response = await api.post('/saas/upgrade', { planId, simulateFailure });
    return response.data;
  },
  getSubscription: async () => {
    const response = await api.get('/saas/subscription');
    return response.data;
  },
};

// ─── AI CHATBOT ──────────────────────────────────────────────────────────────
export const chatbotService = {
  ask: async (query, userId) => {
    const response = await api.post('/chatbot/ask', { query, userId });
    return response.data;
  },
};

export default api;
