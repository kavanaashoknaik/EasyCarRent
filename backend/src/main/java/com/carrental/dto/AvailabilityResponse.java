package com.carrental.dto;

import java.math.BigDecimal;

public record AvailabilityResponse(
        boolean available,
        long carsLeft,
        int totalDays,
        BigDecimal totalAmount
) {
}