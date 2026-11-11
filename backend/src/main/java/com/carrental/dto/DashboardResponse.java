package com.carrental.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        long totalCustomers,
        long pendingLicenses,
        long totalCompanies,
        long totalVariants,
        long totalCars,
        long availableCars,
        long totalBookings,
        long pendingBookings,
        long approvedBookings,
        long confirmedBookings,
        long completedBookings,
        long rejectedBookings,
        long cancelledBookings,
        BigDecimal totalRevenue
) {
}