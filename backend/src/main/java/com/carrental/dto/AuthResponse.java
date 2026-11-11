package com.carrental.dto;

public record AuthResponse(
        String token,
        String email,
        String role,
        String fullName
) {
}
