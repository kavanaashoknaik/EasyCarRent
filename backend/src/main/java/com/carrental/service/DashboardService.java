package com.carrental.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.DashboardResponse;
import com.carrental.entity.Payment;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.CarStatus;
import com.carrental.enums.LicenseStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarCompanyRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarVariantRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.PaymentRepository;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final CarCompanyRepository companyRepository;
    private final CarVariantRepository variantRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(CustomerRepository customerRepository,
                            CarCompanyRepository companyRepository,
                            CarVariantRepository variantRepository,
                            CarRepository carRepository,
                            BookingRepository bookingRepository,
                            PaymentRepository paymentRepository) {
        this.customerRepository = customerRepository;
        this.companyRepository = companyRepository;
        this.variantRepository = variantRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        // Revenue counts successful payments whose booking was not cancelled
        BigDecimal revenue = paymentRepository.findAll()
                .stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS)
                .filter(this::bookingIsKept)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(
                customerRepository.count(),
                customerRepository.countByLicenseStatus(LicenseStatus.PENDING),
                companyRepository.count(),
                variantRepository.count(),
                carRepository.count(),
                carRepository.countByStatus(CarStatus.AVAILABLE),
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.APPROVED),
                bookingRepository.countByStatus(BookingStatus.CONFIRMED),
                bookingRepository.countByStatus(BookingStatus.COMPLETED),
                bookingRepository.countByStatus(BookingStatus.REJECTED),
                bookingRepository.countByStatus(BookingStatus.CANCELLED),
                revenue);
    }

    private boolean bookingIsKept(Payment payment) {
        BookingStatus status = payment.getBooking().getStatus();
        return status == BookingStatus.CONFIRMED || status == BookingStatus.COMPLETED;
    }
}