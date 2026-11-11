package com.carrental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(

        @NotBlank(message = "Company name is required")
        @Size(max = 100, message = "Company name must be at most 100 characters")
        String name,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        @Size(max = 255, message = "Logo URL must be at most 255 characters")
        String logoUrl
) {
}