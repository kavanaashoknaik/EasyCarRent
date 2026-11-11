package com.carrental.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.entity.Booking;
import com.carrental.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    boolean existsByVariantId(Long variantId);

    boolean existsByCarId(Long carId);

    long countByStatus(BookingStatus status);

    // Bookings of this car type that overlap the date range (used for the "cars left" count)
    long countByVariantIdAndStatusInAndPickupDateLessThanEqualAndReturnDateGreaterThanEqual(
            Long variantId,
            Collection<BookingStatus> statuses,
            LocalDate endDate,
            LocalDate startDate);

    // Bookings that already use this exact car on overlapping dates (used when assigning a car)
    long countByCarIdAndStatusInAndPickupDateLessThanEqualAndReturnDateGreaterThanEqual(
            Long carId,
            Collection<BookingStatus> statuses,
            LocalDate endDate,
            LocalDate startDate);
}