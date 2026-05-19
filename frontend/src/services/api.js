import axios from 'axios';

// All routes are proxied to http://localhost:5000 in development via vite.config.js
const api = {
  // Authentication
  auth: {
    login: (email, password) => axios.post('/api/auth/login', { email, password }),
    register: (data) => axios.post('/api/auth/register', data),
  },

  // Dashboard
  dashboard: {
    getData: () => axios.get('/api/dashboard'),
  },

  // Employees & Profile
  employees: {
    getAll: () => axios.get('/api/employees'),
    create: (data) => axios.post('/api/employees', data),
    invite: (data) => axios.post('/api/employees/invite', data),
    getInvites: () => axios.get('/api/employees/invites'),
    getProfile: (userId) => axios.get(`/api/profile/${userId}`),
    updateProfile: (userId, data) => axios.put(`/api/profile/${userId}`, data),
  },
  
  // SaaS & Subscription
  saas: {
    getPlans: () => axios.get('/api/saas/plans'),
    checkout: (planId) => axios.post('/api/saas/checkout', { planId }),
    upgrade: (planId, simulateFailure) => axios.post('/api/saas/upgrade', { planId, simulateFailure }),
    getSubscription: () => axios.get('/api/saas/subscription'),
  },

  // Attendance
  attendance: {
    checkIn: (userId, location) => axios.post('/api/attendance/check-in', { userId, location }),
    checkOut: (userId, location) => axios.post('/api/attendance/check-out', { userId, location }),
    getHistory: (userId) => axios.get(`/api/attendance/history/${userId}`),
    getReportData: (month, year) => axios.get(`/api/attendance/report-data?month=${month}&year=${year}`),
    regularize: (data) => axios.post('/api/attendance/regularize', data),
  },

  // Leave
  leaves: {
    getStats: (userId) => axios.get(`/api/leave/stats/${userId}`),
    getHistory: (userId) => axios.get(`/api/leave/history/${userId}`),
    apply: (data) => axios.post('/api/leave/apply', data),
    getRequests: (managerId) => axios.get(`/api/leave/requests${managerId ? `?managerId=${managerId}` : ''}`),
    approve: (leaveId, status) => axios.put(`/api/leave/approve/${leaveId}`, { status }),
  },

  // Performance OKRs & Reviews
  performance: {
    // Goals OKRs
    createGoal: (data) => axios.post('/api/goals', data),
    getGoals: (userId) => axios.get(`/api/goals/${userId}`),
    updateGoalProgress: (goalId, currentValue, status) => axios.put(`/api/goals/${goalId}`, { currentValue, status }),
    approveGoal: (goalId) => axios.put(`/api/goals/${goalId}/approve`),
    // Reviews
    createReview: (data) => axios.post('/api/reviews', data),
    submitSelfReview: (reviewId, selfReview) => axios.put(`/api/reviews/${reviewId}/self`, { selfReview }),
    submitManagerReview: (reviewId, rating, comments) => axios.put(`/api/reviews/${reviewId}/manager`, { rating, comments }),
    getReviews: (userId) => axios.get(`/api/reviews/${userId}`),
  },

  // Hiring & Onboarding
  hiring: {
    createJob: (data) => axios.post('/api/jobs', data),
    getJobs: () => axios.get('/api/jobs'),
    applyJob: (data) => axios.post('/api/jobs/apply', data),
    getApplicants: () => axios.get('/api/applicants'),
    updateApplicantStatus: (applicantId, status) => axios.put(`/api/applicants/${applicantId}/status`, { status }),
    updateOnboardingTask: (applicantId, taskId, status) => axios.put(`/api/applicants/${applicantId}/onboarding-task`, { taskId, status }),
  },

  // Separation / Offboarding
  offboarding: {
    requestSeparation: (data) => axios.post('/api/separations', data),
    getSeparations: () => axios.get('/api/separations'),
    updateExitStatus: (exitId, status) => axios.put(`/api/separations/${exitId}/status`, { status }),
    updateExitTask: (exitId, taskId, status) => axios.put(`/api/separations/${exitId}/offboarding-task`, { taskId, status }),
  },

  // Help Desk Tickets
  tickets: {
    create: (data) => axios.post('/api/tickets', data),
    getAll: (userId) => axios.get(`/api/tickets${userId ? `?userId=${userId}` : ''}`),
    addComment: (ticketId, commentData) => axios.post(`/api/tickets/${ticketId}/comment`, commentData),
    updateStatus: (ticketId, status) => axios.put(`/api/tickets/${ticketId}/status`, { status }),
  },

  // System Custom Form Fields
  formBuilder: {
    createField: (data) => axios.post('/api/custom-fields', data),
    getFields: () => axios.get('/api/custom-fields'),
    deleteField: (fieldId) => axios.delete(`/api/custom-fields/${fieldId}`),
  },

  // Document Vault
  documents: {
    upload: (data) => axios.post('/api/documents/upload', data),
    get: (userId) => axios.get(`/api/documents/${userId}`),
  },

  // Project Timesheets
  timesheets: {
    log: (data) => axios.post('/api/timesheets', data),
    get: (userId) => axios.get(`/api/timesheets${userId ? `?userId=${userId}` : ''}`),
    updateStatus: (timesheetId, status) => axios.put(`/api/timesheets/${timesheetId}/status`, { status }),
  },

  // Announcements Feed
  announcements: {
    getAll: () => axios.get('/api/announcements'),
    create: (data) => axios.post('/api/announcements', data),
    like: (announcementId, userId) => axios.put(`/api/announcements/${announcementId}/like`, { userId }),
    comment: (announcementId, commentData) => axios.post(`/api/announcements/${announcementId}/comment`, commentData),
  },

  // FAQ AI Chatbot
  chatbot: {
    ask: (query, userId) => axios.post('/api/chatbot/ask', { query, userId }),
  },
};

export default api;
