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

// Request interceptor to add the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 402) {
      // Subscription Expired / Payment Required
      NavigationService.navigate('Subscription');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  registerOrganization: async (orgData) => {
    const response = await api.post('/auth/register', orgData);
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },
};

export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export const attendanceService = {
  checkIn: async (userId, location) => {
    const response = await api.post('/attendance/check-in', { userId, location });
    return response.data;
  },
  checkOut: async (userId) => {
    const response = await api.post('/attendance/check-out', { userId });
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

export const userService = {
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  getProfile: async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },
};

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

export const saasService = {
  getPlans: async () => {
    const response = await api.get('/saas/plans');
    return response.data;
  },
  createCheckout: async (planId) => {
    const response = await api.post('/saas/checkout', { planId });
    return response.data;
  }
};

export default api;
