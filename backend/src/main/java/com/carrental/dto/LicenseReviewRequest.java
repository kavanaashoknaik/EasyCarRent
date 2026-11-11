package com.carrental.dto;

import com.carrental.enums.LicenseStatus;

import jakarta.validation.constraints.NotNull;

public record LicenseReviewRequest(

        @NotNull(message = "Status is required (VERIFIED or REJECTED)")
        LicenseStatus status
) {
}