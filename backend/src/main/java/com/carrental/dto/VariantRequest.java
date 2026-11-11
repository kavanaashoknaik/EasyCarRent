package com.carrental.dto;

import java.math.BigDecimal;

import com.carrental.enums.FuelType;
import com.carrental.enums.Transmission;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VariantRequest(

        @NotNull(message = "Company is required")
        Long companyId,

        @NotBlank(message = "Variant name is required")
        @Size(max = 100, message = "Variant name must be at most 100 characters")
        String name,

        @NotNull(message = "Fuel type is required (PETROL, DIESEL, ELECTRIC or CNG)")
        FuelType fuelType,

        @NotNull(message = "Transmission is required (MANUAL or AUTOMATIC)")
        Transmission transmission,

        @NotNull(message = "Seating capacity is required")
        @Min(value = 1, message = "Seating capacity must be at least 1")
        @Max(value = 20, message = "Seating capacity must be at most 20")
        Integer seatingCapacity,

        @NotNull(message = "Price per day is required")
        @DecimalMin(value = "1.00", message = "Price per day must be at least 1")
        @Digits(integer = 8, fraction = 2, message = "Price can have up to 8 digits and 2 decimals")
        BigDecimal pricePerDay,

        @Size(max = 255, message = "Image URL must be at most 255 characters")
        String imageUrl
) {
}