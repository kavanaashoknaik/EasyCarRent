package com.carrental.dto;

import com.carrental.enums.CarStatus;

public record CarResponse(
        Long id,
        Long variantId,
        String variantName,
        String companyName,
        String registrationNumber,
        String color,
        Integer manufacturingYear,
        CarStatus status
) {
}