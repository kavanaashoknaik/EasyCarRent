package com.carrental.dto;

import java.math.BigDecimal;

import com.carrental.enums.FuelType;
import com.carrental.enums.Transmission;

public record VariantResponse(
        Long id,
        Long companyId,
        String companyName,
        String name,
        FuelType fuelType,
        Transmission transmission,
        int seatingCapacity,
        BigDecimal pricePerDay,
        String imageUrl
) {
}