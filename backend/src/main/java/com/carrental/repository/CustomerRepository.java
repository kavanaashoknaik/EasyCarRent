package com.carrental.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.entity.Customer;
import com.carrental.enums.LicenseStatus;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByUserId(Long userId);

    Optional<Customer> findByUserEmail(String email);

    List<Customer> findByLicenseStatus(LicenseStatus licenseStatus);

    long countByLicenseStatus(LicenseStatus licenseStatus);
}