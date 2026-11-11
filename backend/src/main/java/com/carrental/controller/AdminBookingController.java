package com.carrental.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.ApproveBookingRequest;
import com.carrental.dto.BookingResponse;
import com.carrental.dto.CarResponse;
import com.carrental.dto.RejectBookingRequest;
import com.carrental.enums.BookingStatus;
import com.carrental.service.AdminBookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final AdminBookingService bookingService;

    public AdminBookingController(AdminBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<BookingResponse> getAll(
            @RequestParam(name = "status", required = false) BookingStatus status) {
        return bookingService.getAll(status);
    }

    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable("id") Long id) {
        return bookingService.getById(id);
    }

    @GetMapping("/{id}/available-cars")
    public List<CarResponse> getAvailableCars(@PathVariable("id") Long id) {
        return bookingService.getAvailableCars(id);
    }

    @PutMapping("/{id}/approve")
    public BookingResponse approve(@PathVariable("id") Long id,
                                   @Valid @RequestBody ApproveBookingRequest request) {
        return bookingService.approve(id, request);
    }

    @PutMapping("/{id}/reject")
    public BookingResponse reject(@PathVariable("id") Long id,
                                  @Valid @RequestBody RejectBookingRequest request) {
        return bookingService.reject(id, request);
    }

    @PutMapping("/{id}/complete")
    public BookingResponse complete(@PathVariable("id") Long id) {
        return bookingService.complete(id);
    }
}