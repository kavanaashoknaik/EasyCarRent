package com.carrental.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    List<Payment> findByBookingCustomerIdOrderByPaidAtDesc(Long customerId);

    List<Payment> findAllByOrderByPaidAtDesc();
}