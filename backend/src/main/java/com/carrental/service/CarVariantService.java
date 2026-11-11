package com.carrental.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.VariantRequest;
import com.carrental.dto.VariantResponse;
import com.carrental.entity.CarCompany;
import com.carrental.entity.CarVariant;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarCompanyRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarVariantRepository;

@Service
public class CarVariantService {

    private final CarVariantRepository variantRepository;
    private final CarCompanyRepository companyRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;

    public CarVariantService(CarVariantRepository variantRepository,
                             CarCompanyRepository companyRepository,
                             CarRepository carRepository,
                             BookingRepository bookingRepository) {
        this.variantRepository = variantRepository;
        this.companyRepository = companyRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public VariantResponse create(VariantRequest request) {
        CarCompany company = findCompany(request.companyId());
        String name = request.name().trim();

        if (variantRepository.existsByCompanyIdAndNameIgnoreCase(company.getId(), name)) {
            throw new BadRequestException(
                    company.getName() + " already has a variant named " + name);
        }

        CarVariant variant = new CarVariant();
        apply(variant, request, company, name);

        return toResponse(variantRepository.save(variant));
    }

    @Transactional(readOnly = true)
    public List<VariantResponse> getAll(Long companyId) {
        List<CarVariant> variants = (companyId == null)
                ? variantRepository.findAll(Sort.by("name"))
                : variantRepository.findByCompanyId(companyId);

        return variants.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public VariantResponse getById(Long id) {
        return toResponse(findVariant(id));
    }

    @Transactional
    public VariantResponse update(Long id, VariantRequest request) {
        CarVariant variant = findVariant(id);
        CarCompany company = findCompany(request.companyId());
        String name = request.name().trim();

        boolean changed = !variant.getCompany().getId().equals(company.getId())
                || !variant.getName().equalsIgnoreCase(name);

        if (changed && variantRepository.existsByCompanyIdAndNameIgnoreCase(company.getId(), name)) {
            throw new BadRequestException(
                    company.getName() + " already has a variant named " + name);
        }

        apply(variant, request, company, name);

        return toResponse(variantRepository.save(variant));
    }

    @Transactional
    public void delete(Long id) {
        CarVariant variant = findVariant(id);

        if (carRepository.existsByVariantId(id)) {
            throw new BadRequestException(
                    "Cannot delete this variant because it has cars. Delete its cars first.");
        }
        if (bookingRepository.existsByVariantId(id)) {
            throw new BadRequestException(
                    "Cannot delete this variant because it has bookings.");
        }

        variantRepository.delete(variant);
    }

    private void apply(CarVariant variant, VariantRequest request, CarCompany company, String name) {
        variant.setCompany(company);
        variant.setName(name);
        variant.setFuelType(request.fuelType());
        variant.setTransmission(request.transmission());
        variant.setSeatingCapacity(request.seatingCapacity());
        variant.setPricePerDay(request.pricePerDay());
        variant.setImageUrl(clean(request.imageUrl()));
    }

    private CarCompany findCompany(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));
    }

    private CarVariant findVariant(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id " + id));
    }

    private VariantResponse toResponse(CarVariant variant) {
        return new VariantResponse(
                variant.getId(),
                variant.getCompany().getId(),
                variant.getCompany().getName(),
                variant.getName(),
                variant.getFuelType(),
                variant.getTransmission(),
                variant.getSeatingCapacity(),
                variant.getPricePerDay(),
                variant.getImageUrl());
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}