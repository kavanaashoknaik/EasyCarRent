export type Role = 'ROLE_ADMIN' | 'ROLE_CUSTOMER';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export type CarStatus = 'AVAILABLE' | 'MAINTENANCE';

export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'CNG';

export type LicenseStatus = 'NOT_UPLOADED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING';

export type PaymentStatus = 'SUCCESS' | 'FAILED';

export type Transmission = 'MANUAL' | 'AUTOMATIC';

// DTO Interfaces matching Spring Boot Backend Records

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  fullName: string;
}

export interface MessageResponse {
  message: string;
}

export interface CompanyRequest {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface CompanyResponse {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface VariantRequest {
  companyId: number;
  name: string;
  fuelType: FuelType;
  transmission: Transmission;
  seatingCapacity: number;
  pricePerDay: number;
  imageUrl?: string;
}

export interface VariantResponse {
  id: number;
  companyId: number;
  companyName: string;
  name: string;
  fuelType: FuelType;
  transmission: Transmission;
  seatingCapacity: number;
  pricePerDay: number;
  imageUrl?: string;
}

export interface CarRequest {
  variantId: number;
  registrationNumber: string;
  color?: string;
  manufacturingYear?: number;
  status?: CarStatus;
}

export interface CarResponse {
  id: number;
  variantId: number;
  variantName: string;
  companyName: string;
  registrationNumber: string;
  color?: string;
  manufacturingYear?: number;
  status: CarStatus;
}

export interface CarListingResponse {
  id: number;
  companyId: number;
  companyName: string;
  name: string;
  fuelType: FuelType;
  transmission: Transmission;
  seatingCapacity: number;
  pricePerDay: number;
  imageUrl?: string;
  availableCars: number;
}

export interface AvailabilityResponse {
  available: boolean;
  carsLeft: number;
  totalDays: number;
  totalAmount: number;
}

export interface BookingRequest {
  variantId: number;
  pickupDate: string; // ISO YYYY-MM-DD
  returnDate: string; // ISO YYYY-MM-DD
}

export interface BookingResponse {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  variantId: number;
  companyName: string;
  variantName: string;
  imageUrl?: string;
  carRegistrationNumber?: string;
  pickupDate: string;
  returnDate: string;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  status: BookingStatus;
  adminRemark?: string;
  createdAt: string;
}

export interface ApproveBookingRequest {
  carId: number;
  remark?: string;
}

export interface RejectBookingRequest {
  remark: string;
}

export interface CustomerResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  licenseNumber?: string;
  licenseStatus: LicenseStatus;
  licenseUploaded: boolean;
  registeredAt?: string;
}

export interface ProfileResponse {
  email: string;
  fullName: string;
  phone: string;
  address?: string;
  licenseNumber?: string;
  licenseStatus: LicenseStatus;
  licenseUploaded: boolean;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  address?: string;
}

export interface LicenseReviewRequest {
  status: 'VERIFIED' | 'REJECTED';
}

export interface PaymentRequest {
  bookingId: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  customerName: string;
  customerEmail: string;
  carName: string;
  bookingStatus: BookingStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  paidAt: string;
}

export interface DashboardResponse {
  totalCustomers: number;
  pendingLicenses: number;
  totalCompanies: number;
  totalVariants: number;
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}
