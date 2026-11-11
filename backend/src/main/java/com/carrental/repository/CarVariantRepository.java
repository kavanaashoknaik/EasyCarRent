package com.carrental.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.entity.CarVariant;

public interface CarVariantRepository extends JpaRepository<CarVariant, Long> {

    List<CarVariant> findByCompanyId(Long companyId);

    boolean existsByCompanyId(Long companyId);

    boolean existsByCompanyIdAndNameIgnoreCase(Long companyId, String name);
}