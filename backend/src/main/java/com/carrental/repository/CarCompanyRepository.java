package com.carrental.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.entity.CarCompany;

public interface CarCompanyRepository extends JpaRepository<CarCompany, Long> {

    boolean existsByNameIgnoreCase(String name);
}