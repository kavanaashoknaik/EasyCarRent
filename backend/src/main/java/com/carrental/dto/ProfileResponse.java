package com.carrental.dto;

import com.carrental.enums.LicenseStatus;

public record ProfileResponse(
        String email,
        String fullName,
        String phone,
        String address,
        String licenseNumber,
        LicenseStatus licenseStatus,
        boolean licenseUploaded
) {
}