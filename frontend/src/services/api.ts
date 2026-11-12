import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { mockStorage } from './mockStorage';

// Initialize mock storage seed once
mockStorage.init();

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080';

// Storage key to toggle forcing Mock/Demo mode or Live mode
export const MODE_STORAGE_KEY = 'easycarrent_mode'; // 'live' | 'mock' | 'auto'

export function getAppMode(): 'live' | 'mock' | 'auto' {
  return (localStorage.getItem(MODE_STORAGE_KEY) as 'live' | 'mock' | 'auto') || 'live';
}

export function setAppMode(mode: 'live' | 'mock' | 'auto'): void {
  localStorage.setItem(MODE_STORAGE_KEY, mode);
  window.dispatchEvent(new Event('easycarrent_mode_changed'));
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    if (error.response?.status === 401) {
      console.warn('Authentication expired or unauthorized.');
    }
    return Promise.reject(error);
  }
);

// Helper to format backend error messages from Spring Boot
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors) {
      const errorList = Object.values(data.errors);
      if (errorList.length > 0) return String(errorList[0]);
    }
    if (data?.message) {
      return data.message;
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to access this resource';
    }
    if (error.response?.status === 401) {
      return 'Please login to access this resource';
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Backend unreachable. Please verify Spring Boot is running on ' + API_BASE_URL;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}