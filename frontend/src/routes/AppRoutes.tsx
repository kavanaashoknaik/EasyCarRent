import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public pages
import { HomePage } from '../pages/public/HomePage';
import { BrowseCarsPage } from '../pages/public/BrowseCarsPage';
import { CarDetailsPage } from '../pages/public/CarDetailsPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Customer pages
import { CustomerDashboardOverview } from '../pages/customer/CustomerDashboardOverview';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';
import { CustomerBookingsPage } from '../pages/customer/CustomerBookingsPage';
import { CustomerPaymentPage } from '../pages/customer/CustomerPaymentPage';
import { CustomerPaymentHistoryPage } from '../pages/customer/CustomerPaymentHistoryPage';

// Admin pages
import { AdminDashboardOverview } from '../pages/admin/AdminDashboardOverview';
import { AdminCompanyManagement } from '../pages/admin/AdminCompanyManagement';
import { AdminVariantManagement } from '../pages/admin/AdminVariantManagement';
import { AdminCarManagement } from '../pages/admin/AdminCarManagement';
import { AdminCustomerManagement } from '../pages/admin/AdminCustomerManagement';
import { AdminLicenseVerification } from '../pages/admin/AdminLicenseVerification';
import { AdminBookingManagement } from '../pages/admin/AdminBookingManagement';
import { AdminPaymentManagement } from '../pages/admin/AdminPaymentManagement';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cars" element={<BrowseCarsPage />} />
        <Route path="/cars/:id" element={<CarDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Portal nested under MainLayout + CustomerLayout */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="ROLE_CUSTOMER">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboardOverview />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="bookings" element={<CustomerBookingsPage />} />
          <Route path="payments" element={<CustomerPaymentHistoryPage />} />
          <Route path="payments/checkout" element={<CustomerPaymentPage />} />
        </Route>
      </Route>

      {/* Admin Dashboard wrapped in AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardOverview />} />
        <Route path="companies" element={<AdminCompanyManagement />} />
        <Route path="variants" element={<AdminVariantManagement />} />
        <Route path="cars" element={<AdminCarManagement />} />
        <Route path="customers" element={<AdminCustomerManagement />} />
        <Route path="licenses" element={<AdminLicenseVerification />} />
        <Route path="bookings" element={<AdminBookingManagement />} />
        <Route path="payments" element={<AdminPaymentManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
