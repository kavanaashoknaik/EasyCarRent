package com.carrental.dto;

import com.carrental.enums.CarStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CarRequest(

        @NotNull(message = "Car variant is required")
        Long variantId,

        @NotBlank(message = "Registration number is required")
        @Size(max = 20, message = "Registration number must be at most 20 characters")
        String registrationNumber,

        @Size(max = 30, message = "Color must be at most 30 characters")
        String color,

        @Min(value = 2000, message = "Manufacturing year must be 2000 or later")
        @Max(value = 2100, message = "Manufacturing year is not valid")
        Integer manufacturingYear,

        CarStatus status
) {
}