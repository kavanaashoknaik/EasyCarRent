import { api, getAppMode } from './api';
import { mockStorage } from './mockStorage';
import {
  CompanyResponse,
  CarListingResponse,
  AvailabilityResponse,
  FuelType,
  Transmission,
} from '../types';

export interface SearchFilters {
  companyId?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  keyword?: string;
}

export const publicService = {
  async getCompanies(): Promise<CompanyResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.getCompanies();
    }
    const res = await api.get<CompanyResponse[]>('/api/public/companies');
    return res.data;
  },

  async searchCars(filters: SearchFilters = {}): Promise<CarListingResponse[]> {
    if (getAppMode() === 'mock') {
      return mockStorage.searchCars(filters);
    }
    const params = new URLSearchParams();
    if (filters.companyId) params.append('companyId', String(filters.companyId));
    if (filters.fuelType) params.append('fuelType', filters.fuelType);
    if (filters.transmission) params.append('transmission', filters.transmission);
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice > 0)
      params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice > 0)
      params.append('maxPrice', String(filters.maxPrice));
    if (filters.seats) params.append('seats', String(filters.seats));
    if (filters.keyword && filters.keyword.trim())
      params.append('keyword', filters.keyword.trim());

    const res = await api.get<CarListingResponse[]>(`/api/public/variants?${params.toString()}`);
    return res.data;
  },

  async getCarById(id: number): Promise<CarListingResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.getCarById(id);
    }
    const res = await api.get<CarListingResponse>(`/api/public/variants/${id}`);
    return res.data;
  },

  async checkAvailability(
    variantId: number,
    pickupDate: string,
    returnDate: string
  ): Promise<AvailabilityResponse> {
    if (getAppMode() === 'mock') {
      return mockStorage.checkAvailability(variantId, pickupDate, returnDate);
    }
    const res = await api.get<AvailabilityResponse>(
      `/api/public/variants/${variantId}/availability`,
      {
        params: { pickupDate, returnDate },
      }
    );
    return res.data;
  },
};