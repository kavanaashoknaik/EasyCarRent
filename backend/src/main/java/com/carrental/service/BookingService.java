package com.carrental.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.AvailabilityResponse;
import com.carrental.dto.BookingRequest;
import com.carrental.dto.BookingResponse;
import com.carrental.entity.Booking;
import com.carrental.entity.CarVariant;
import com.carrental.entity.Customer;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.CarStatus;
import com.carrental.enums.LicenseStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarVariantRepository;
import com.carrental.repository.CustomerRepository;

@Service
public class BookingService {

    private static final int MAX_RENTAL_DAYS = 30;

    // Bookings in these statuses are holding a car for their dates
    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(
            BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.CONFIRMED);

    private static final Set<BookingStatus> CANCELLABLE_STATUSES = Set.of(
            BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.CONFIRMED);

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final CarVariantRepository variantRepository;
    private final CarRepository carRepository;

    public BookingService(BookingRepository bookingRepository,
                          CustomerRepository customerRepository,
                          CarVariantRepository variantRepository,
                          CarRepository carRepository) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.variantRepository = variantRepository;
        this.carRepository = carRepository;
    }

    // ---------- Public: price and availability check ----------

    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(Long variantId,
                                                  LocalDate pickupDate,
                                                  LocalDate returnDate) {
        long days = validateDates(pickupDate, returnDate);
        CarVariant variant = findVariant(variantId);

        long carsLeft = countCarsLeft(variant.getId(), pickupDate, returnDate);
        BigDecimal total = variant.getPricePerDay().multiply(BigDecimal.valueOf(days));

        return new AvailabilityResponse(carsLeft > 0, carsLeft, (int) days, total);
    }

    // ---------- Customer: create, list, view, cancel ----------

    @Transactional
    public BookingResponse create(String email, BookingRequest request) {
        Customer customer = findCustomer(email);

        LicenseStatus licenseStatus = customer.getLicenseStatus();
        if (licenseStatus == LicenseStatus.NOT_UPLOADED) {
            throw new BadRequestException("Please upload your driving license before booking a car");
        }
        if (licenseStatus == LicenseStatus.REJECTED) {
            throw new BadRequestException(
                    "Your driving license was rejected. Please upload it again before booking");
        }

        long days = validateDates(request.pickupDate(), request.returnDate());
        CarVariant variant = findVariant(request.variantId());

        long carsLeft = countCarsLeft(variant.getId(), request.pickupDate(), request.returnDate());
        if (carsLeft <= 0) {
            throw new BadRequestException("Sorry, this car is not available for the selected dates");
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setVariant(variant);
        booking.setPickupDate(request.pickupDate());
        booking.setReturnDate(request.returnDate());
        booking.setTotalDays((int) days);
        booking.setTotalAmount(variant.getPricePerDay().multiply(BigDecimal.valueOf(days)));
        booking.setStatus(BookingStatus.PENDING);

        return BookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String email) {
        Customer customer = findCustomer(email);

        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getMyBooking(String email, Long bookingId) {
        return BookingMapper.toResponse(findMyBooking(email, bookingId));
    }

    @Transactional
    public BookingResponse cancel(String email, Long bookingId) {
        Booking booking = findMyBooking(email, bookingId);

        if (!CANCELLABLE_STATUSES.contains(booking.getStatus())) {
            throw new BadRequestException(
                    "This booking cannot be cancelled because it is " + booking.getStatus());
        }
        if (!LocalDate.now().isBefore(booking.getPickupDate())) {
            throw new BadRequestException("A booking can only be cancelled before its pickup date");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return BookingMapper.toResponse(bookingRepository.save(booking));
    }

    // ---------- Helpers ----------

    private long validateDates(LocalDate pickupDate, LocalDate returnDate) {
        if (pickupDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Pickup date cannot be in the past");
        }
        if (returnDate.isBefore(pickupDate)) {
            throw new BadRequestException("Return date cannot be before the pickup date");
        }

        long days = ChronoUnit.DAYS.between(pickupDate, returnDate) + 1;
        if (days > MAX_RENTAL_DAYS) {
            throw new BadRequestException("A booking can be for at most " + MAX_RENTAL_DAYS + " days");
        }
        return days;
    }

    private long countCarsLeft(Long variantId, LocalDate pickupDate, LocalDate returnDate) {
        long totalCars = carRepository.countByVariantIdAndStatus(variantId, CarStatus.AVAILABLE);

        long takenCars = bookingRepository
                .countByVariantIdAndStatusInAndPickupDateLessThanEqualAndReturnDateGreaterThanEqual(
                        variantId, ACTIVE_STATUSES, returnDate, pickupDate);

        return Math.max(0, totalCars - takenCars);
    }

    private Customer findCustomer(String email) {
        return customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
    }

    private CarVariant findVariant(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id " + id));
    }

    private Booking findMyBooking(String email, Long bookingId) {
        Customer customer = findCustomer(email);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));

        // A customer must never see someone else's booking
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new ResourceNotFoundException("Booking not found with id " + bookingId);
        }
        return booking;
    }
}
