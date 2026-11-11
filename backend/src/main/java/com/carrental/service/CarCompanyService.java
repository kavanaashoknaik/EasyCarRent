package com.carrental.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.CompanyRequest;
import com.carrental.dto.CompanyResponse;
import com.carrental.entity.CarCompany;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.CarCompanyRepository;
import com.carrental.repository.CarVariantRepository;

@Service
public class CarCompanyService {

    private final CarCompanyRepository companyRepository;
    private final CarVariantRepository variantRepository;

    public CarCompanyService(CarCompanyRepository companyRepository,
                             CarVariantRepository variantRepository) {
        this.companyRepository = companyRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional
    public CompanyResponse create(CompanyRequest request) {
        String name = request.name().trim();

        if (companyRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Company already exists: " + name);
        }

        CarCompany company = new CarCompany();
        company.setName(name);
        company.setDescription(clean(request.description()));
        company.setLogoUrl(clean(request.logoUrl()));

        return toResponse(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAll() {
        return companyRepository.findAll(Sort.by("name"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getById(Long id) {
        return toResponse(findCompany(id));
    }

    @Transactional
    public CompanyResponse update(Long id, CompanyRequest request) {
        CarCompany company = findCompany(id);
        String name = request.name().trim();

        boolean nameChanged = !company.getName().equalsIgnoreCase(name);
        if (nameChanged && companyRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Company already exists: " + name);
        }

        company.setName(name);
        company.setDescription(clean(request.description()));
        company.setLogoUrl(clean(request.logoUrl()));

        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public void delete(Long id) {
        CarCompany company = findCompany(id);

        if (variantRepository.existsByCompanyId(id)) {
            throw new BadRequestException(
                    "Cannot delete this company because it has car variants. Delete its variants first.");
        }

        companyRepository.delete(company);
    }

    private CarCompany findCompany(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));
    }

    private CompanyResponse toResponse(CarCompany company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getDescription(),
                company.getLogoUrl());
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}