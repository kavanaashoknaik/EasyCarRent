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
    const res = await api.get<ProfileResponse>('/api/customer/profile');
    return res.data;
  },

  async updateProfile(
    request: UpdateProfileRequest,
    userEmail?: string
  ): Promise<ProfileResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.updateProfile(userEmail || 'customer@carrental.com', request);
    }
    const res = await api.put<ProfileResponse>('/api/customer/profile', request);
    return res.data;
  },

  async uploadLicense(
    licenseNumber: string,
    file: File,
    userEmail?: string
  ): Promise<ProfileResponse> {
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

    const formData = new FormData();
    formData.append('licenseNumber', licenseNumber);
    formData.append('file', file);

    const res = await api.post<ProfileResponse>('/api/customer/license', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async createBooking(
    request: BookingRequest,
    userEmail?: string
  ): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.createBooking(userEmail || 'customer@carrental.com', request);
    }
    const res = await api.post<BookingResponse>('/api/customer/bookings', request);
    return res.data;
  },

  async getMyBookings(userEmail?: string): Promise<BookingResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyBookings(userEmail || 'customer@carrental.com');
    }
    const res = await api.get<BookingResponse[]>('/api/customer/bookings');
    return res.data;
  },

  async getMyBooking(id: number, userEmail?: string): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyBooking(userEmail || 'customer@carrental.com', id);
    }
    const res = await api.get<BookingResponse>(`/api/customer/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id: number, userEmail?: string): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.cancelBooking(userEmail || 'customer@carrental.com', id);
    }
    const res = await api.put<BookingResponse>(`/api/customer/bookings/${id}/cancel`);
    return res.data;
  },

  async pay(request: PaymentRequest, userEmail?: string): Promise<PaymentResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.payBooking(userEmail || 'customer@carrental.com', request);
    }
    const res = await api.post<PaymentResponse>('/api/customer/payments', request);
    return res.data;
  },

  async getMyPayments(userEmail?: string): Promise<PaymentResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyPayments(userEmail || 'customer@carrental.com');
    }
    const res = await api.get<PaymentResponse[]>('/api/customer/payments');
    return res.data;
  },

  async getReceipt(bookingId: number, userEmail?: string): Promise<PaymentResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.getMyReceipt(userEmail || 'customer@carrental.com', bookingId);
    }
    const res = await api.get<PaymentResponse>(`/api/customer/payments/booking/${bookingId}`);
    return res.data;
  },
};