package com.carrental.dto;

import java.time.LocalDateTime;

import com.carrental.enums.LicenseStatus;

public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String address,
        String licenseNumber,
        LicenseStatus licenseStatus,
        boolean licenseUploaded,
        LocalDateTime registeredAt
) {
}