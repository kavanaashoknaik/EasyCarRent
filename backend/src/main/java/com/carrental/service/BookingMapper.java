package com.carrental.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.carrental.dto.BookingResponse;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.CarVariant;
import com.carrental.entity.Customer;

public final class BookingMapper {

    private BookingMapper() {
    }

    public static BookingResponse toResponse(Booking booking) {
        Customer customer = booking.getCustomer();
        CarVariant variant = booking.getVariant();
        Car car = booking.getCar();

        // The price per day that applied when the booking was made
        BigDecimal pricePerDay = booking.getTotalAmount()
                .divide(BigDecimal.valueOf(booking.getTotalDays()), 2, RoundingMode.HALF_UP);

        return new BookingResponse(
                booking.getId(),
                customer.getId(),
                customer.getFullName(),
                customer.getUser().getEmail(),
                variant.getId(),
                variant.getCompany().getName(),
                variant.getName(),
                variant.getImageUrl(),
                car != null ? car.getRegistrationNumber() : null,
                booking.getPickupDate(),
                booking.getReturnDate(),
                booking.getTotalDays(),
                pricePerDay,
                booking.getTotalAmount(),
                booking.getStatus(),
                booking.getAdminRemark(),
                booking.getCreatedAt());
    }
}