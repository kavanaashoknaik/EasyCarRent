package com.carrental.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApproveBookingRequest(

        @NotNull(message = "Please choose a car to assign")
        Long carId,

        @Size(max = 255, message = "Remark must be at most 255 characters")
        String remark
) {
}
