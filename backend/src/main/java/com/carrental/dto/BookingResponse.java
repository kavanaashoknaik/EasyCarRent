package com.carrental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.carrental.enums.BookingStatus;

public record BookingResponse(
        Long id,
        Long customerId,
        String customerName,
        String customerEmail,
        Long variantId,
        String companyName,
        String variantName,
        String imageUrl,
        String carRegistrationNumber,
        LocalDate pickupDate,
        LocalDate returnDate,
        int totalDays,
        BigDecimal pricePerDay,
        BigDecimal totalAmount,
        BookingStatus status,
        String adminRemark,
        LocalDateTime createdAt
) {
}