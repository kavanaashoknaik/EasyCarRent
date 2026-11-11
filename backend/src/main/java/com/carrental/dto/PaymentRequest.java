package com.carrental.dto;

import com.carrental.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;

public record PaymentRequest(

        @NotNull(message = "Booking is required")
        Long bookingId,

        @NotNull(message = "Payment method is required (UPI, CARD or NET_BANKING)")
        PaymentMethod paymentMethod
) {
}
