package com.carrental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectBookingRequest(

        @NotBlank(message = "Please give a reason for rejecting the booking")
        @Size(max = 255, message = "Remark must be at most 255 characters")
        String remark
) {
}