package com.carrental.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.BookingRequest;
import com.carrental.dto.BookingResponse;
import com.carrental.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customer/bookings")
public class CustomerBookingController {

    private final BookingService bookingService;

    public CustomerBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(Principal principal,
                                                  @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.create(principal.getName(), request));
    }

    @GetMapping
    public List<BookingResponse> getMyBookings(Principal principal) {
        return bookingService.getMyBookings(principal.getName());
    }

    @GetMapping("/{id}")
    public BookingResponse getMyBooking(Principal principal, @PathVariable("id") Long id) {
        return bookingService.getMyBooking(principal.getName(), id);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancel(Principal principal, @PathVariable("id") Long id) {
        return bookingService.cancel(principal.getName(), id);
    }
}