package com.carrental.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.PaymentRequest;
import com.carrental.dto.PaymentResponse;
import com.carrental.entity.Booking;
import com.carrental.entity.CarVariant;
import com.carrental.entity.Customer;
import com.carrental.entity.Payment;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          CustomerRepository customerRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
    }

    // ---------- Customer ----------

    @Transactional
    public PaymentResponse pay(String email, PaymentRequest request) {
        Customer customer = findCustomer(email);

        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id " + request.bookingId()));

        // A customer can only pay for their own bookings
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new ResourceNotFoundException("Booking not found with id " + request.bookingId());
        }

        BookingStatus status = booking.getStatus();
        if (status == BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Your booking is waiting for admin approval. You can pay after it is approved");
        }
        if (status == BookingStatus.CONFIRMED || status == BookingStatus.COMPLETED) {
            throw new BadRequestException("This booking is already paid");
        }
        if (status != BookingStatus.APPROVED) {
            throw new BadRequestException("This booking cannot be paid because it is " + status);
        }
        if (paymentRepository.existsByBookingId(booking.getId())) {
            throw new BadRequestException("A payment already exists for this booking");
        }
        if (booking.getPickupDate().isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "The pickup date has passed, so this booking can no longer be paid");
        }

        // Simulated payment: the amount always comes from the booking, never from the customer
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setTransactionId(generateTransactionId());
        payment.setStatus(PaymentStatus.SUCCESS);
        Payment saved = paymentRepository.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments(String email) {
        Customer customer = findCustomer(email);

        return paymentRepository.findByBookingCustomerIdOrderByPaidAtDesc(customer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getMyReceipt(String email, Long bookingId) {
        Customer customer = findCustomer(email);

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for this booking"));

        if (!payment.getBooking().getCustomer().getId().equals(customer.getId())) {
            throw new ResourceNotFoundException("No payment found for this booking");
        }
        return toResponse(payment);
    }

    // ---------- Admin ----------

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByPaidAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ---------- Helpers ----------

    private Customer findCustomer(String email) {
        return customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
    }

    private String generateTransactionId() {
        return "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private PaymentResponse toResponse(Payment payment) {
        Booking booking = payment.getBooking();
        Customer customer = booking.getCustomer();
        CarVariant variant = booking.getVariant();

        return new PaymentResponse(
                payment.getId(),
                booking.getId(),
                customer.getFullName(),
                customer.getUser().getEmail(),
                variant.getCompany().getName() + " " + variant.getName(),
                booking.getStatus(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getTransactionId(),
                payment.getStatus(),
                payment.getPaidAt());
    }
}
