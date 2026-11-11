package com.carrental.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.entity.Car;
import com.carrental.enums.CarStatus;

public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findByVariantId(Long variantId);

    boolean existsByVariantId(Long variantId);

    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);

    long countByVariantIdAndStatus(Long variantId, CarStatus status);

    long countByStatus(CarStatus status);
}