import { api, getAppMode } from './api';
import { mockStorage } from './mockStorage';
import {
  ProfileResponse,
  UpdateProfileRequest,
  BookingRequest,
  BookingResponse,
  PaymentRequest,
  PaymentResponse,
} from '../types';

export const customerService = {
  async getProfile(userEmail?: string): Promise<ProfileResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.getProfile(userEmail || 'customer@carrental.com');
    }
    try {
      const res = await api.get<ProfileResponse>('/api/customer/profile');
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.getProfile(userEmail || 'customer@carrental.com');
      }
      throw err;
    }
  },

  async updateProfile(
    request: UpdateProfileRequest,
    userEmail?: string
  ): Promise<ProfileResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.updateProfile(userEmail || 'customer@carrental.com', request);
    }
    try {
      const res = await api.put<ProfileResponse>('/api/customer/profile', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.updateProfile(userEmail || 'customer@carrental.com', request);
      }
      throw err;
    }
  },

  async uploadLicense(
    licenseNumber: string,
    file: File,
    userEmail?: string
  ): Promise<ProfileResponse> {
    // Check 5 MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds the 5 MB limit');
    }

    if (getAppMode() === 'mock') {
      return mockStorage.uploadLicense(
        userEmail || 'customer@carrental.com',
        licenseNumber,
        file.name
      );
    }

    try {
      const formData = new FormData();
      formData.append('licenseNumber', licenseNumber);
      formData.append('file', file);

      const res = await api.post<ProfileResponse>('/api/customer/license', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.uploadLicense(
          userEmail || 'customer@carrental.com',
          licenseNumber,
          file.name
        );
      }
      throw err;
    }
  },

  async createBooking(
    request: BookingRequest,
    userEmail?: string
  ): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.createBooking(userEmail || 'customer@carrental.com', request);
    }
    try {
      const res = await api.post<BookingResponse>('/api/customer/bookings', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.createBooking(userEmail || 'customer@carrental.com', request);
      }
      throw err;
    }
  },

  async getMyBookings(userEmail?: string): Promise<BookingResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyBookings(userEmail || 'customer@carrental.com');
    }
    try {
      const res = await api.get<BookingResponse[]>('/api/customer/bookings');
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.getMyBookings(userEmail || 'customer@carrental.com');
      }
      throw err;
    }
  },

  async getMyBooking(id: number, userEmail?: string): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyBooking(userEmail || 'customer@carrental.com', id);
    }
    try {
      const res = await api.get<BookingResponse>(`/api/customer/bookings/${id}`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.getMyBooking(userEmail || 'customer@carrental.com', id);
      }
      throw err;
    }
  },

  async cancelBooking(id: number, userEmail?: string): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.cancelBooking(userEmail || 'customer@carrental.com', id);
    }
    try {
      const res = await api.put<BookingResponse>(`/api/customer/bookings/${id}/cancel`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.cancelBooking(userEmail || 'customer@carrental.com', id);
      }
      throw err;
    }
  },

  async pay(request: PaymentRequest, userEmail?: string): Promise<PaymentResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.payBooking(userEmail || 'customer@carrental.com', request);
    }
    try {
      const res = await api.post<PaymentResponse>('/api/customer/payments', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.payBooking(userEmail || 'customer@carrental.com', request);
      }
      throw err;
    }
  },

  async getMyPayments(userEmail?: string): Promise<PaymentResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyPayments(userEmail || 'customer@carrental.com');
    }
    try {
      const res = await api.get<PaymentResponse[]>('/api/customer/payments');
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.getMyPayments(userEmail || 'customer@carrental.com');
      }
      throw err;
    }
  },

  async getReceipt(bookingId: number, userEmail?: string): Promise<PaymentResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyReceipt(userEmail || 'customer@carrental.com', bookingId);
    }
    try {
      const res = await api.get<PaymentResponse>(`/api/customer/payments/booking/${bookingId}`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.getMyReceipt(userEmail || 'customer@carrental.com', bookingId);
      }
      throw err;
    }
  },
};
