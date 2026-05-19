"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tenantSlug, setTenantSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('ACTIVE');

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await axios.get('/api/saas/subscription');
      if (res.data?.subscription?.status) {
        setSubscriptionStatus(res.data.subscription.status);
      }
    } catch (err) {
      console.log('Failed to fetch subscription status in background');
    }
  };

  // Set up request interceptor for X-Tenant-Slug header
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const slug = localStorage.getItem('tenantSlug');
        if (slug) {
          config.headers['X-Tenant-Slug'] = slug;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefresh = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      const storedTenant = localStorage.getItem('tenantSlug');

      if (storedTenant) {
        setTenantSlug(storedTenant);
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefresh);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setTimeout(() => {
          fetchSubscriptionStatus();
        }, 100);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Axios Response Interceptor for handling 401 Unauthenticated errors and performing token refreshing
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;
          try {
            // Attempt to get a new access token using the refresh token
            const res = await axios.post('/api/auth/refresh', { refreshToken });
            const newAccessToken = res.data.token;
            
            localStorage.setItem('token', newAccessToken);
            setToken(newAccessToken);
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            return axios(originalRequest);
          } catch (refreshErr) {
            console.error('Session expired, logging out...', refreshErr);
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  const login = async (email, password, subdomain = '') => {
    try {
      if (subdomain) {
        localStorage.setItem('tenantSlug', subdomain.trim().toLowerCase());
        setTenantSlug(subdomain.trim().toLowerCase());
      } else {
        localStorage.removeItem('tenantSlug');
        setTenantSlug(null);
      }

      const res = await axios.post('/api/auth/login', { email, password });
      const { token: accToken, refreshToken: refToken, user: userData } = res.data;

      localStorage.setItem('token', accToken);
      localStorage.setItem('refreshToken', refToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(accToken);
      setRefreshToken(refToken);
      setUser(userData);

      axios.defaults.headers.common['Authorization'] = `Bearer ${accToken}`;
      setTimeout(() => {
        fetchSubscriptionStatus();
      }, 50);
      return userData;
    } catch (err) {
      localStorage.removeItem('tenantSlug');
      setTenantSlug(null);
      throw new Error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantSlug');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setTenantSlug(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfileInState = (updatedUserFields) => {
    const updated = { ...user, ...updatedUserFields };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  // Helper getters for permissions
  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';
  const isManager = user?.role === 'MANAGER' || isAdmin;
  const isHR = user?.role === 'HR' || isAdmin;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      updateProfileInState,
      isAdmin, 
      isManager,
      isHR,
      role: user?.role || 'EMPLOYEE',
      subscriptionStatus,
      fetchSubscriptionStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
