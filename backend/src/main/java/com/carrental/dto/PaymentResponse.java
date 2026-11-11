package com.carrental.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.carrental.enums.BookingStatus;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;

public record PaymentResponse(
        Long id,
        Long bookingId,
        String customerName,
        String customerEmail,
        String carName,
        BookingStatus bookingStatus,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        String transactionId,
        PaymentStatus status,
        LocalDateTime paidAt
) {
}