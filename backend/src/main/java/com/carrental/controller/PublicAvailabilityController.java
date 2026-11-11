package com.carrental.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.AvailabilityResponse;
import com.carrental.service.BookingService;

@RestController
public class PublicAvailabilityController {

    private final BookingService bookingService;

    public PublicAvailabilityController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/api/public/variants/{id}/availability")
    public AvailabilityResponse checkAvailability(
            @PathVariable("id") Long id,
            @RequestParam("pickupDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam("returnDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate) {

        return bookingService.checkAvailability(id, pickupDate, returnDate);
    }
}
