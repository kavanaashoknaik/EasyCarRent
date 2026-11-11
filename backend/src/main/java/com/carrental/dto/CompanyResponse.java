package com.carrental.dto;

public record CompanyResponse(
        Long id,
        String name,
        String description,
        String logoUrl
) {
}
