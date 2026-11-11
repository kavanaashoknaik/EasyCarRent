package com.carrental.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.CarListingResponse;
import com.carrental.entity.CarVariant;
import com.carrental.enums.CarStatus;
import com.carrental.enums.FuelType;
import com.carrental.enums.Transmission;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarVariantRepository;

@Service
public class CatalogService {

    private final CarVariantRepository variantRepository;
    private final CarRepository carRepository;

    public CatalogService(CarVariantRepository variantRepository, CarRepository carRepository) {
        this.variantRepository = variantRepository;
        this.carRepository = carRepository;
    }

    @Transactional(readOnly = true)
    public List<CarListingResponse> search(Long companyId,
                                           FuelType fuelType,
                                           Transmission transmission,
                                           BigDecimal minPrice,
                                           BigDecimal maxPrice,
                                           Integer seats,
                                           String keyword) {

        String key = (keyword == null || keyword.isBlank()) ? null : keyword.trim().toLowerCase();

        return variantRepository.findAll(Sort.by("pricePerDay"))
                .stream()
                .filter(v -> companyId == null || v.getCompany().getId().equals(companyId))
                .filter(v -> fuelType == null || v.getFuelType() == fuelType)
                .filter(v -> transmission == null || v.getTransmission() == transmission)
                .filter(v -> minPrice == null || v.getPricePerDay().compareTo(minPrice) >= 0)
                .filter(v -> maxPrice == null || v.getPricePerDay().compareTo(maxPrice) <= 0)
                .filter(v -> seats == null || v.getSeatingCapacity() >= seats)
                .filter(v -> key == null
                        || v.getName().toLowerCase().contains(key)
                        || v.getCompany().getName().toLowerCase().contains(key))
                .map(this::toListing)
                .toList();
    }

    @Transactional(readOnly = true)
    public CarListingResponse getById(Long id) {
        CarVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id " + id));
        return toListing(variant);
    }

    private CarListingResponse toListing(CarVariant variant) {
        long availableCars = carRepository.countByVariantIdAndStatus(variant.getId(), CarStatus.AVAILABLE);

        return new CarListingResponse(
                variant.getId(),
                variant.getCompany().getId(),
                variant.getCompany().getName(),
                variant.getName(),
                variant.getFuelType(),
                variant.getTransmission(),
                variant.getSeatingCapacity(),
                variant.getPricePerDay(),
                variant.getImageUrl(),
                availableCars);
    }
}