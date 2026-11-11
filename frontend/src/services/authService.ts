import { api, getAppMode } from './api';
import { mockStorage } from './mockStorage';
import { LoginRequest, RegisterRequest, AuthResponse, MessageResponse } from '../types';

export const authService = {
  async register(request: RegisterRequest): Promise<MessageResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.register(request);
    }
    try {
      const res = await api.post<MessageResponse>('/api/auth/register', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        console.info('Backend unreachable, using local storage fallback for register.');
        return mockStorage.register(request);
      }
      throw err;
    }
  },

  async login(request: LoginRequest): Promise<AuthResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.login(request);
    }
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        console.info('Backend unreachable, using local storage fallback for login.');
        return mockStorage.login(request);
      }
      throw err;
    }
  },

  async pingPublic(): Promise<MessageResponse> {
    const res = await api.get<MessageResponse>('/api/public/ping');
    return res.data;
  },

  async pingCustomer(): Promise<MessageResponse> {
    const res = await api.get<MessageResponse>('/api/customer/ping');
    return res.data;
  },

  async pingAdmin(): Promise<MessageResponse> {
    const res = await api.get<MessageResponse>('/api/admin/ping');
    return res.data;
  },
};
