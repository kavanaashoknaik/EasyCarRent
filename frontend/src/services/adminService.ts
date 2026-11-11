import { api, getAppMode, API_BASE_URL } from './api';
import { mockStorage } from './mockStorage';
import {
  DashboardResponse,
  CompanyResponse,
  CompanyRequest,
  VariantResponse,
  VariantRequest,
  CarResponse,
  CarRequest,
  CustomerResponse,
  BookingResponse,
  ApproveBookingRequest,
  RejectBookingRequest,
  PaymentResponse,
  MessageResponse,
  LicenseStatus,
  BookingStatus,
} from '../types';

export const adminService = {
  // Dashboard
  async getDashboard(): Promise<DashboardResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.getDashboard();
    }
    try {
      const res = await api.get<DashboardResponse>('/api/admin/dashboard');
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.getDashboard();
      }
      throw err;
    }
  },

  // Companies
  async getCompanies(): Promise<CompanyResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetCompanies();
    }
    try {
      const res = await api.get<CompanyResponse[]>('/api/admin/companies');
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetCompanies();
      }
      throw err;
    }
  },

  async createCompany(request: CompanyRequest): Promise<CompanyResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminCreateCompany(request);
    }
    try {
      const res = await api.post<CompanyResponse>('/api/admin/companies', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminCreateCompany(request);
      }
      throw err;
    }
  },

  async updateCompany(id: number, request: CompanyRequest): Promise<CompanyResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminUpdateCompany(id, request);
    }
    try {
      const res = await api.put<CompanyResponse>(`/api/admin/companies/${id}`, request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminUpdateCompany(id, request);
      }
      throw err;
    }
  },

  async deleteCompany(id: number): Promise<MessageResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminDeleteCompany(id);
    }
    try {
      const res = await api.delete<MessageResponse>(`/api/admin/companies/${id}`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminDeleteCompany(id);
      }
      throw err;
    }
  },

  // Variants
  async getVariants(companyId?: number): Promise<VariantResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetVariants(companyId);
    }
    try {
      const res = await api.get<VariantResponse[]>('/api/admin/variants', {
        params: companyId ? { companyId } : undefined,
      });
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetVariants(companyId);
      }
      throw err;
    }
  },

  async createVariant(request: VariantRequest): Promise<VariantResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminCreateVariant(request);
    }
    try {
      const res = await api.post<VariantResponse>('/api/admin/variants', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminCreateVariant(request);
      }
      throw err;
    }
  },

  async updateVariant(id: number, request: VariantRequest): Promise<VariantResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminUpdateVariant(id, request);
    }
    try {
      const res = await api.put<VariantResponse>(`/api/admin/variants/${id}`, request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminUpdateVariant(id, request);
      }
      throw err;
    }
  },

  async deleteVariant(id: number): Promise<MessageResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminDeleteVariant(id);
    }
    try {
      const res = await api.delete<MessageResponse>(`/api/admin/variants/${id}`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminDeleteVariant(id);
      }
      throw err;
    }
  },

  // Cars
  async getCars(variantId?: number): Promise<CarResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetCars(variantId);
    }
    try {
      const res = await api.get<CarResponse[]>('/api/admin/cars', {
        params: variantId ? { variantId } : undefined,
      });
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetCars(variantId);
      }
      throw err;
    }
  },

  async createCar(request: CarRequest): Promise<CarResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminCreateCar(request);
    }
    try {
      const res = await api.post<CarResponse>('/api/admin/cars', request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminCreateCar(request);
      }
      throw err;
    }
  },

  async updateCar(id: number, request: CarRequest): Promise<CarResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminUpdateCar(id, request);
    }
    try {
      const res = await api.put<CarResponse>(`/api/admin/cars/${id}`, request);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminUpdateCar(id, request);
      }
      throw err;
    }
  },

  async deleteCar(id: number): Promise<MessageResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminDeleteCar(id);
    }
    try {
      const res = await api.delete<MessageResponse>(`/api/admin/cars/${id}`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminDeleteCar(id);
      }
      throw err;
    }
  },

  // Customers & Licenses
  async getCustomers(licenseStatus?: LicenseStatus): Promise<CustomerResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetCustomers(licenseStatus);
    }
    try {
      const res = await api.get<CustomerResponse[]>('/api/admin/customers', {
        params: licenseStatus ? { licenseStatus } : undefined,
      });
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetCustomers(licenseStatus);
      }
      throw err;
    }
  },

  async getCustomer(id: number): Promise<CustomerResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetCustomer(id);
    }
    try {
      const res = await api.get<CustomerResponse>(`/api/admin/customers/${id}`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetCustomer(id);
      }
      throw err;
    }
  },

  async reviewLicense(id: number, status: 'VERIFIED' | 'REJECTED'): Promise<CustomerResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminReviewLicense(id, status);
    }
    try {
      const res = await api.put<CustomerResponse>(`/api/admin/customers/${id}/license`, {
        status,
      });
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminReviewLicense(id, status);
      }
      throw err;
    }
  },

  getLicenseFileUrl(customerId: number): string {
    return `${API_BASE_URL}/api/admin/customers/${customerId}/license-file`;
  },

  // Bookings
  async getBookings(status?: BookingStatus): Promise<BookingResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetBookings(status);
    }
    try {
      const res = await api.get<BookingResponse[]>('/api/admin/bookings', {
        params: status ? { status } : undefined,
      });
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetBookings(status);
      }
      throw err;
    }
  },

  async getAvailableCars(bookingId: number): Promise<CarResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetAvailableCarsForBooking(bookingId);
    }
    try {
      const res = await api.get<CarResponse[]>(`/api/admin/bookings/${bookingId}/available-cars`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetAvailableCarsForBooking(bookingId);
      }
      throw err;
    }
  },

  async approveBooking(
    bookingId: number,
    request: ApproveBookingRequest
  ): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminApproveBooking(bookingId, request);
    }
    try {
      const res = await api.put<BookingResponse>(
        `/api/admin/bookings/${bookingId}/approve`,
        request
      );
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminApproveBooking(bookingId, request);
      }
      throw err;
    }
  },

  async rejectBooking(
    bookingId: number,
    request: RejectBookingRequest
  ): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminRejectBooking(bookingId, request.remark);
    }
    try {
      const res = await api.put<BookingResponse>(
        `/api/admin/bookings/${bookingId}/reject`,
        request
      );
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminRejectBooking(bookingId, request.remark);
      }
      throw err;
    }
  },

  async completeBooking(bookingId: number): Promise<BookingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminCompleteBooking(bookingId);
    }
    try {
      const res = await api.put<BookingResponse>(`/api/admin/bookings/${bookingId}/complete`);
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminCompleteBooking(bookingId);
      }
      throw err;
    }
  },

  // Payments
  async getPayments(): Promise<PaymentResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.adminGetPayments();
    }
    try {
      const res = await api.get<PaymentResponse[]>('/api/admin/payments');
      return res.data;
    } catch (err: any) {
      if ((getAppMode() === 'auto' && !err.response) || err.code === 'ERR_NETWORK') {
        return mockStorage.adminGetPayments();
      }
      throw err;
    }
  },
};
