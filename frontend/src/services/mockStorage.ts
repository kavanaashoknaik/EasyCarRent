import {
  CompanyResponse,
  CompanyRequest,
  VariantResponse,
  VariantRequest,
  CarResponse,
  CarRequest,
  CustomerResponse,
  BookingResponse,
  PaymentResponse,
  DashboardResponse,
  CarListingResponse,
  AvailabilityResponse,
  ProfileResponse,
  UpdateProfileRequest,
  BookingRequest,
  ApproveBookingRequest,
  PaymentRequest,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Role,
  LicenseStatus,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_VARIANTS,
  INITIAL_CARS,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
} from './mockData';

const STORAGE_KEYS = {
  COMPANIES: 'easycarrent_companies',
  VARIANTS: 'easycarrent_variants',
  CARS: 'easycarrent_cars',
  CUSTOMERS: 'easycarrent_customers',
  BOOKINGS: 'easycarrent_bookings',
  PAYMENTS: 'easycarrent_payments',
  USER_PASSWORDS: 'easycarrent_passwords',
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export const mockStorage = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
      setStorage(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VARIANTS)) {
      setStorage(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARS)) {
      setStorage(STORAGE_KEYS.CARS, INITIAL_CARS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      setStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      setStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      setStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_PASSWORDS)) {
      setStorage(STORAGE_KEYS.USER_PASSWORDS, {
        'admin@carrental.com': 'Admin@123',
        'customer@carrental.com': 'Password@123',
      });
    }
  },

  // Auth
  login(request: LoginRequest): AuthResponse {
    const email = request.email.trim().toLowerCase();
    const passwords = getStorage<Record<string, string>>(STORAGE_KEYS.USER_PASSWORDS, {});
    
    // Default admin account matching backend DataInitializer
    if (email === 'admin@carrental.com') {
      if (request.password === 'Admin@123' || passwords[email] === request.password) {
        return {
          token: 'demo-jwt-admin-token-' + Date.now(),
          email: 'admin@carrental.com',
          role: 'ROLE_ADMIN' as Role,
          fullName: 'System Administrator',
        };
      }
      throw new Error('Invalid email or password');
    }

    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const customer = customers.find((c) => c.email.toLowerCase() === email);

    if (customer && (passwords[email] === request.password || request.password === 'Password@123')) {
      return {
        token: 'demo-jwt-customer-token-' + Date.now(),
        email: customer.email,
        role: 'ROLE_CUSTOMER' as Role,
        fullName: customer.fullName,
      };
    }

    throw new Error('Invalid email or password');
  },

  register(request: RegisterRequest): { message: string } {
    const email = request.email.trim().toLowerCase();
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    if (customers.some((c) => c.email.toLowerCase() === email) || email === 'admin@carrental.com') {
      throw new Error('Email is already registered');
    }

    const newCustomer: CustomerResponse = {
      id: Date.now(),
      fullName: request.fullName.trim(),
      email,
      phone: request.phone,
      address: '',
      licenseNumber: '',
      licenseStatus: 'NOT_UPLOADED',
      licenseUploaded: false,
      registeredAt: new Date().toISOString(),
    };

    customers.unshift(newCustomer);
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    const passwords = getStorage<Record<string, string>>(STORAGE_KEYS.USER_PASSWORDS, {});
    passwords[email] = request.password;
    setStorage(STORAGE_KEYS.USER_PASSWORDS, passwords);

    return { message: 'Registration successful. Please login.' };
  },

  // Public Catalog
  getCompanies(): CompanyResponse[] {
    return getStorage<CompanyResponse[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  },

  searchCars(params: {
    companyId?: number;
    fuelType?: string;
    transmission?: string;
    minPrice?: number;
    maxPrice?: number;
    seats?: number;
    keyword?: string;
  }): CarListingResponse[] {
    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);

    const key = params.keyword ? params.keyword.trim().toLowerCase() : null;

    return variants
      .filter((v) => !params.companyId || v.companyId === params.companyId)
      .filter((v) => !params.fuelType || v.fuelType === params.fuelType)
      .filter((v) => !params.transmission || v.transmission === params.transmission)
      .filter((v) => !params.minPrice || v.pricePerDay >= params.minPrice)
      .filter((v) => !params.maxPrice || v.pricePerDay <= params.maxPrice)
      .filter((v) => !params.seats || v.seatingCapacity >= params.seats)
      .filter(
        (v) =>
          !key ||
          v.name.toLowerCase().includes(key) ||
          v.companyName.toLowerCase().includes(key)
      )
      .map((v) => {
        const availableCars = cars.filter(
          (c) => c.variantId === v.id && c.status === 'AVAILABLE'
        ).length;
        return {
          id: v.id,
          companyId: v.companyId,
          companyName: v.companyName,
          name: v.name,
          fuelType: v.fuelType,
          transmission: v.transmission,
          seatingCapacity: v.seatingCapacity,
          pricePerDay: v.pricePerDay,
          imageUrl: v.imageUrl,
          availableCars,
        };
      })
      .sort((a, b) => a.pricePerDay - b.pricePerDay);
  },

  getCarById(id: number): CarListingResponse {
    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const variant = variants.find((v) => v.id === id);
    if (!variant) throw new Error(`Car not found with id ${id}`);

    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const availableCars = cars.filter(
      (c) => c.variantId === variant.id && c.status === 'AVAILABLE'
    ).length;

    return {
      id: variant.id,
      companyId: variant.companyId,
      companyName: variant.companyName,
      name: variant.name,
      fuelType: variant.fuelType,
      transmission: variant.transmission,
      seatingCapacity: variant.seatingCapacity,
      pricePerDay: variant.pricePerDay,
      imageUrl: variant.imageUrl,
      availableCars,
    };
  },

  checkAvailability(id: number, pickupDate: string, returnDate: string): AvailabilityResponse {
    const pDate = new Date(pickupDate);
    const rDate = new Date(returnDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (pDate < now) throw new Error('Pickup date cannot be in the past');
    if (rDate < pDate) throw new Error('Return date cannot be before the pickup date');

    const totalDays = Math.max(1, Math.round((rDate.getTime() - pDate.getTime()) / (1000 * 3600 * 24)) + 1);
    if (totalDays > 30) throw new Error('A booking can be for at most 30 days');

    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const variant = variants.find((v) => v.id === id);
    if (!variant) throw new Error('Car not found with id ' + id);

    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const totalCars = cars.filter((c) => c.variantId === id && c.status === 'AVAILABLE').length;

    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const clashes = bookings.filter((b) => {
      if (b.variantId !== id) return false;
      if (!['PENDING', 'APPROVED', 'CONFIRMED'].includes(b.status)) return false;
      return b.pickupDate <= returnDate && b.returnDate >= pickupDate;
    }).length;

    const carsLeft = Math.max(0, totalCars - clashes);
    const totalAmount = variant.pricePerDay * totalDays;

    return {
      available: carsLeft > 0,
      carsLeft,
      totalDays,
      totalAmount,
    };
  },

  // Customer Profile
  getProfile(email: string): ProfileResponse {
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const customer = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (!customer) throw new Error('Customer profile not found');
    return {
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      licenseNumber: customer.licenseNumber,
      licenseStatus: customer.licenseStatus,
      licenseUploaded: customer.licenseUploaded,
    };
  },

  updateProfile(email: string, request: UpdateProfileRequest): ProfileResponse {
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());
    if (index === -1) throw new Error('Customer profile not found');

    customers[index].fullName = request.fullName.trim();
    customers[index].phone = request.phone;
    customers[index].address = request.address?.trim() || '';

    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return this.getProfile(email);
  },

  uploadLicense(email: string, licenseNumber: string, _fileName?: string): ProfileResponse {
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());
    if (index === -1) throw new Error('Customer profile not found');

    customers[index].licenseNumber = licenseNumber.trim();
    customers[index].licenseStatus = 'PENDING';
    customers[index].licenseUploaded = true;

    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return this.getProfile(email);
  },

  // Bookings (Customer)
  createBooking(email: string, request: BookingRequest): BookingResponse {
    const profile = this.getProfile(email);
    if (profile.licenseStatus === 'NOT_UPLOADED') {
      throw new Error('Please upload your driving license before booking a car');
    }
    if (profile.licenseStatus === 'REJECTED') {
      throw new Error('Your driving license was rejected. Please upload it again before booking');
    }

    const avail = this.checkAvailability(request.variantId, request.pickupDate, request.returnDate);
    if (!avail.available) {
      throw new Error('Sorry, this car is not available for the selected dates');
    }

    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const variant = variants.find((v) => v.id === request.variantId);
    if (!variant) throw new Error('Car variant not found');

    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const newBooking: BookingResponse = {
      id: Date.now(),
      customerId: 1, // sample ID
      customerName: profile.fullName,
      customerEmail: profile.email,
      variantId: variant.id,
      companyName: variant.companyName,
      variantName: variant.name,
      imageUrl: variant.imageUrl,
      pickupDate: request.pickupDate,
      returnDate: request.returnDate,
      totalDays: avail.totalDays,
      pricePerDay: variant.pricePerDay,
      totalAmount: avail.totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return newBooking;
  },

  getMyBookings(email: string): BookingResponse[] {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return bookings.filter((b) => b.customerEmail.toLowerCase() === email.toLowerCase());
  },

  getMyBooking(email: string, id: number): BookingResponse {
    const bookings = this.getMyBookings(email);
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw new Error('Booking not found with id ' + id);
    return booking;
  },

  cancelBooking(email: string, id: number): BookingResponse {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const booking = bookings.find(
      (b) => b.id === id && b.customerEmail.toLowerCase() === email.toLowerCase()
    );
    if (!booking) throw new Error('Booking not found with id ' + id);

    if (!['PENDING', 'APPROVED', 'CONFIRMED'].includes(booking.status)) {
      throw new Error(`This booking cannot be cancelled because it is ${booking.status}`);
    }

    const today = new Date().toISOString().split('T')[0];
    if (today >= booking.pickupDate) {
      throw new Error('A booking can only be cancelled before its pickup date');
    }

    booking.status = 'CANCELLED';
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return booking;
  },

  // Payments (Customer)
  payBooking(email: string, request: PaymentRequest): PaymentResponse {
    const booking = this.getMyBooking(email, request.bookingId);
    if (booking.status === 'PENDING') {
      throw new Error('Your booking is waiting for admin approval. You can pay after it is approved');
    }
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      throw new Error('This booking is already paid');
    }
    if (booking.status !== 'APPROVED') {
      throw new Error(`This booking cannot be paid because it is ${booking.status}`);
    }

    const payments = getStorage<PaymentResponse[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    if (payments.some((p) => p.bookingId === booking.id)) {
      throw new Error('A payment already exists for this booking');
    }

    const txnId = 'TXN' + Math.random().toString(36).substring(2, 14).toUpperCase();
    const newPayment: PaymentResponse = {
      id: Date.now(),
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      carName: `${booking.companyName} ${booking.variantName}`,
      bookingStatus: 'CONFIRMED',
      amount: booking.totalAmount,
      paymentMethod: request.paymentMethod,
      transactionId: txnId,
      status: 'SUCCESS',
      paidAt: new Date().toISOString(),
    };

    payments.unshift(newPayment);
    setStorage(STORAGE_KEYS.PAYMENTS, payments);

    // Update booking status to CONFIRMED
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const bIndex = bookings.findIndex((b) => b.id === booking.id);
    if (bIndex !== -1) {
      bookings[bIndex].status = 'CONFIRMED';
      setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    }

    return newPayment;
  },

  getMyPayments(email: string): PaymentResponse[] {
    const payments = getStorage<PaymentResponse[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    return payments.filter((p) => p.customerEmail.toLowerCase() === email.toLowerCase());
  },

  getMyReceipt(email: string, bookingId: number): PaymentResponse {
    const payment = this.getMyPayments(email).find((p) => p.bookingId === bookingId);
    if (!payment) throw new Error('No payment found for this booking');
    return payment;
  },

  // Admin Dashboard & Management
  getDashboard(): DashboardResponse {
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const companies = getStorage<CompanyResponse[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const payments = getStorage<PaymentResponse[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);

    const pendingLicenses = customers.filter((c) => c.licenseStatus === 'PENDING').length;
    const availableCars = cars.filter((c) => c.status === 'AVAILABLE').length;

    const totalRevenue = payments
      .filter((p) => p.status === 'SUCCESS')
      .filter((p) => {
        const b = bookings.find((bk) => bk.id === p.bookingId);
        return b && (b.status === 'CONFIRMED' || b.status === 'COMPLETED');
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalCustomers: customers.length,
      pendingLicenses,
      totalCompanies: companies.length,
      totalVariants: variants.length,
      totalCars: cars.length,
      availableCars,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === 'PENDING').length,
      approvedBookings: bookings.filter((b) => b.status === 'APPROVED').length,
      confirmedBookings: bookings.filter((b) => b.status === 'CONFIRMED').length,
      completedBookings: bookings.filter((b) => b.status === 'COMPLETED').length,
      rejectedBookings: bookings.filter((b) => b.status === 'REJECTED').length,
      cancelledBookings: bookings.filter((b) => b.status === 'CANCELLED').length,
      totalRevenue,
    };
  },

  // Admin Companies
  adminGetCompanies(): CompanyResponse[] {
    return this.getCompanies();
  },

  adminCreateCompany(request: CompanyRequest): CompanyResponse {
    const companies = getStorage<CompanyResponse[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    if (companies.some((c) => c.name.toLowerCase() === request.name.trim().toLowerCase())) {
      throw new Error(`Company already exists: ${request.name}`);
    }
    const newCompany: CompanyResponse = {
      id: Date.now(),
      name: request.name.trim(),
      description: request.description?.trim(),
      logoUrl: request.logoUrl?.trim(),
    };
    companies.push(newCompany);
    setStorage(STORAGE_KEYS.COMPANIES, companies);
    return newCompany;
  },

  adminUpdateCompany(id: number, request: CompanyRequest): CompanyResponse {
    const companies = getStorage<CompanyResponse[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const index = companies.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Company not found with id ' + id);

    companies[index].name = request.name.trim();
    companies[index].description = request.description?.trim();
    companies[index].logoUrl = request.logoUrl?.trim();
    setStorage(STORAGE_KEYS.COMPANIES, companies);
    return companies[index];
  },

  adminDeleteCompany(id: number): { message: string } {
    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    if (variants.some((v) => v.companyId === id)) {
      throw new Error('Cannot delete this company because it has car variants. Delete its variants first.');
    }
    let companies = getStorage<CompanyResponse[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    companies = companies.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.COMPANIES, companies);
    return { message: 'Company deleted successfully' };
  },

  // Admin Variants
  adminGetVariants(companyId?: number): VariantResponse[] {
    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    return companyId ? variants.filter((v) => v.companyId === companyId) : variants;
  },

  adminCreateVariant(request: VariantRequest): VariantResponse {
    const companies = getStorage<CompanyResponse[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const company = companies.find((c) => c.id === request.companyId);
    if (!company) throw new Error('Company not found with id ' + request.companyId);

    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    if (
      variants.some(
        (v) =>
          v.companyId === company.id &&
          v.name.toLowerCase() === request.name.trim().toLowerCase()
      )
    ) {
      throw new Error(`${company.name} already has a variant named ${request.name}`);
    }

    const newVariant: VariantResponse = {
      id: Date.now(),
      companyId: company.id,
      companyName: company.name,
      name: request.name.trim(),
      fuelType: request.fuelType,
      transmission: request.transmission,
      seatingCapacity: request.seatingCapacity,
      pricePerDay: Number(request.pricePerDay),
      imageUrl: request.imageUrl?.trim(),
    };
    variants.push(newVariant);
    setStorage(STORAGE_KEYS.VARIANTS, variants);
    return newVariant;
  },

  adminUpdateVariant(id: number, request: VariantRequest): VariantResponse {
    const companies = getStorage<CompanyResponse[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const company = companies.find((c) => c.id === request.companyId);
    if (!company) throw new Error('Company not found with id ' + request.companyId);

    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const index = variants.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Variant not found with id ' + id);

    variants[index] = {
      ...variants[index],
      companyId: company.id,
      companyName: company.name,
      name: request.name.trim(),
      fuelType: request.fuelType,
      transmission: request.transmission,
      seatingCapacity: request.seatingCapacity,
      pricePerDay: Number(request.pricePerDay),
      imageUrl: request.imageUrl?.trim(),
    };
    setStorage(STORAGE_KEYS.VARIANTS, variants);
    return variants[index];
  },

  adminDeleteVariant(id: number): { message: string } {
    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    if (cars.some((c) => c.variantId === id)) {
      throw new Error('Cannot delete this variant because it has cars. Delete its cars first.');
    }
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    if (bookings.some((b) => b.variantId === id)) {
      throw new Error('Cannot delete this variant because it has bookings.');
    }
    let variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    variants = variants.filter((v) => v.id !== id);
    setStorage(STORAGE_KEYS.VARIANTS, variants);
    return { message: 'Variant deleted successfully' };
  },

  // Admin Cars
  adminGetCars(variantId?: number): CarResponse[] {
    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    return variantId ? cars.filter((c) => c.variantId === variantId) : cars;
  },

  adminCreateCar(request: CarRequest): CarResponse {
    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const variant = variants.find((v) => v.id === request.variantId);
    if (!variant) throw new Error('Variant not found with id ' + request.variantId);

    const reg = request.registrationNumber.trim().toUpperCase();
    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    if (cars.some((c) => c.registrationNumber.toUpperCase() === reg)) {
      throw new Error(`A car with registration number ${reg} already exists`);
    }

    const newCar: CarResponse = {
      id: Date.now(),
      variantId: variant.id,
      variantName: variant.name,
      companyName: variant.companyName,
      registrationNumber: reg,
      color: request.color?.trim(),
      manufacturingYear: request.manufacturingYear,
      status: request.status || 'AVAILABLE',
    };
    cars.push(newCar);
    setStorage(STORAGE_KEYS.CARS, cars);
    return newCar;
  },

  adminUpdateCar(id: number, request: CarRequest): CarResponse {
    const variants = getStorage<VariantResponse[]>(STORAGE_KEYS.VARIANTS, INITIAL_VARIANTS);
    const variant = variants.find((v) => v.id === request.variantId);
    if (!variant) throw new Error('Variant not found with id ' + request.variantId);

    const reg = request.registrationNumber.trim().toUpperCase();
    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const index = cars.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Car not found with id ' + id);

    cars[index] = {
      ...cars[index],
      variantId: variant.id,
      variantName: variant.name,
      companyName: variant.companyName,
      registrationNumber: reg,
      color: request.color?.trim(),
      manufacturingYear: request.manufacturingYear,
      status: request.status || cars[index].status,
    };
    setStorage(STORAGE_KEYS.CARS, cars);
    return cars[index];
  },

  adminDeleteCar(id: number): { message: string } {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const car = cars.find((c) => c.id === id);
    if (car && bookings.some((b) => b.carRegistrationNumber === car.registrationNumber)) {
      throw new Error('Cannot delete this car because it has bookings. Set its status to MAINTENANCE instead.');
    }
    const filtered = cars.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CARS, filtered);
    return { message: 'Car deleted successfully' };
  },

  // Admin Customers & Licenses
  adminGetCustomers(licenseStatus?: LicenseStatus): CustomerResponse[] {
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return licenseStatus ? customers.filter((c) => c.licenseStatus === licenseStatus) : customers;
  },

  adminGetCustomer(id: number): CustomerResponse {
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const customer = customers.find((c) => c.id === id);
    if (!customer) throw new Error('Customer not found with id ' + id);
    return customer;
  },

  adminReviewLicense(id: number, status: 'VERIFIED' | 'REJECTED'): CustomerResponse {
    const customers = getStorage<CustomerResponse[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Customer not found with id ' + id);

    customers[index].licenseStatus = status;
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return customers[index];
  },

  // Admin Bookings
  adminGetBookings(status?: string): BookingResponse[] {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return status ? bookings.filter((b) => b.status === status) : bookings;
  },

  adminGetAvailableCarsForBooking(bookingId: number): CarResponse[] {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found with id ' + bookingId);

    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const variantCars = cars.filter(
      (c) => c.variantId === booking.variantId && c.status === 'AVAILABLE'
    );

    // Filter out cars assigned to clashing active bookings
    const clashes = bookings.filter((b) => {
      if (b.id === booking.id) return false;
      if (!['APPROVED', 'CONFIRMED'].includes(b.status)) return false;
      return b.pickupDate <= booking.returnDate && b.returnDate >= booking.pickupDate;
    });

    const busyPlateSet = new Set(clashes.map((c) => c.carRegistrationNumber));
    return variantCars.filter((c) => !busyPlateSet.has(c.registrationNumber));
  },

  adminApproveBooking(id: number, request: ApproveBookingRequest): BookingResponse {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Booking not found with id ' + id);

    if (bookings[index].status !== 'PENDING') {
      throw new Error(`Only PENDING bookings can be approved. This booking is ${bookings[index].status}`);
    }

    const cars = getStorage<CarResponse[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    const car = cars.find((c) => c.id === request.carId);
    if (!car) throw new Error('Car not found with id ' + request.carId);

    bookings[index].status = 'APPROVED';
    bookings[index].carRegistrationNumber = car.registrationNumber;
    if (request.remark) bookings[index].adminRemark = request.remark.trim();

    setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[index];
  },

  adminRejectBooking(id: number, remark: string): BookingResponse {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Booking not found with id ' + id);

    if (bookings[index].status !== 'PENDING') {
      throw new Error(`Only PENDING bookings can be rejected. This booking is ${bookings[index].status}`);
    }

    bookings[index].status = 'REJECTED';
    bookings[index].adminRemark = remark.trim();

    setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[index];
  },

  adminCompleteBooking(id: number): BookingResponse {
    const bookings = getStorage<BookingResponse[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Booking not found with id ' + id);

    if (bookings[index].status !== 'CONFIRMED') {
      throw new Error(
        `Only CONFIRMED (paid) bookings can be completed. This booking is ${bookings[index].status}`
      );
    }

    bookings[index].status = 'COMPLETED';
    setStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[index];
  },

  // Admin Payments
  adminGetPayments(): PaymentResponse[] {
    return getStorage<PaymentResponse[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },
};
