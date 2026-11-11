package com.carrental.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.ApproveBookingRequest;
import com.carrental.dto.BookingResponse;
import com.carrental.dto.CarResponse;
import com.carrental.dto.RejectBookingRequest;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.CarVariant;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.CarStatus;
import com.carrental.enums.LicenseStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;

@Service
public class AdminBookingService {

    // A car is "in use" for its dates when a booking with one of these statuses has it assigned
    private static final List<BookingStatus> CAR_HOLDING_STATUSES =
            List.of(BookingStatus.APPROVED, BookingStatus.CONFIRMED);

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;

    public AdminBookingService(BookingRepository bookingRepository, CarRepository carRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAll(BookingStatus status) {
        List<Booking> bookings = (status == null)
                ? bookingRepository.findAllByOrderByCreatedAtDesc()
                : bookingRepository.findByStatusOrderByCreatedAtDesc(status);

        return bookings.stream().map(BookingMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(Long id) {
        return BookingMapper.toResponse(findBooking(id));
    }

    // Cars the admin can assign to this booking: right type, AVAILABLE, and free on the booking dates
    @Transactional(readOnly = true)
    public List<CarResponse> getAvailableCars(Long bookingId) {
        Booking booking = findBooking(bookingId);

        return carRepository.findByVariantId(booking.getVariant().getId())
                .stream()
                .filter(car -> car.getStatus() == CarStatus.AVAILABLE)
                .filter(car -> isCarFree(car.getId(), booking))
                .map(this::toCarResponse)
                .toList();
    }

    @Transactional
    public BookingResponse approve(Long id, ApproveBookingRequest request) {
        Booking booking = findBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING bookings can be approved. This booking is " + booking.getStatus());
        }
        if (booking.getCustomer().getLicenseStatus() != LicenseStatus.VERIFIED) {
            throw new BadRequestException(
                    "Verify the customer's driving license before approving this booking");
        }
        if (booking.getPickupDate().isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "The pickup date has already passed. Please reject this booking instead");
        }

        Car car = carRepository.findById(request.carId())
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id " + request.carId()));

        if (!car.getVariant().getId().equals(booking.getVariant().getId())) {
            throw new BadRequestException(
                    "This car is not a " + booking.getVariant().getName() + ". Choose a car of the booked type");
        }
        if (car.getStatus() != CarStatus.AVAILABLE) {
            throw new BadRequestException("This car is not available (status: " + car.getStatus() + ")");
        }
        if (!isCarFree(car.getId(), booking)) {
            throw new BadRequestException(
                    "This car is already assigned to another booking on these dates");
        }

        booking.setCar(car);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminRemark(clean(request.remark()));

        return BookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse reject(Long id, RejectBookingRequest request) {
        Booking booking = findBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING bookings can be rejected. This booking is " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminRemark(request.remark().trim());

        return BookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse complete(Long id) {
        Booking booking = findBooking(id);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException(
                    "Only CONFIRMED (paid) bookings can be completed. This booking is " + booking.getStatus());
        }
        if (LocalDate.now().isBefore(booking.getPickupDate())) {
            throw new BadRequestException("A booking cannot be completed before its pickup date");
        }

        booking.setStatus(BookingStatus.COMPLETED);

        return BookingMapper.toResponse(bookingRepository.save(booking));
    }

    // ---------- Helpers ----------

    private boolean isCarFree(Long carId, Booking booking) {
        long clashes = bookingRepository
                .countByCarIdAndStatusInAndPickupDateLessThanEqualAndReturnDateGreaterThanEqual(
                        carId, CAR_HOLDING_STATUSES, booking.getReturnDate(), booking.getPickupDate());
        return clashes == 0;
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + id));
    }

    private CarResponse toCarResponse(Car car) {
        CarVariant variant = car.getVariant();
        return new CarResponse(
                car.getId(),
                variant.getId(),
                variant.getName(),
                variant.getCompany().getName(),
                car.getRegistrationNumber(),
                car.getColor(),
                car.getManufacturingYear(),
                car.getStatus());
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}