package com.carrental.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record BookingRequest(

        @NotNull(message = "Car is required")
        Long variantId,

        @NotNull(message = "Pickup date is required")
        LocalDate pickupDate,

        @NotNull(message = "Return date is required")
        LocalDate returnDate
) {
}