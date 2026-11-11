package com.carrental.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.CarListingResponse;
import com.carrental.dto.CompanyResponse;
import com.carrental.enums.FuelType;
import com.carrental.enums.Transmission;
import com.carrental.service.CarCompanyService;
import com.carrental.service.CatalogService;

@RestController
@RequestMapping("/api/public")
public class PublicCatalogController {

    private final CatalogService catalogService;
    private final CarCompanyService companyService;

    public PublicCatalogController(CatalogService catalogService,
                                   CarCompanyService companyService) {
        this.catalogService = catalogService;
        this.companyService = companyService;
    }

    @GetMapping("/companies")
    public List<CompanyResponse> getCompanies() {
        return companyService.getAll();
    }

    @GetMapping("/variants")
    public List<CarListingResponse> searchCars(
            @RequestParam(name = "companyId", required = false) Long companyId,
            @RequestParam(name = "fuelType", required = false) FuelType fuelType,
            @RequestParam(name = "transmission", required = false) Transmission transmission,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "seats", required = false) Integer seats,
            @RequestParam(name = "keyword", required = false) String keyword) {

        return catalogService.search(companyId, fuelType, transmission,
                minPrice, maxPrice, seats, keyword);
    }

    @GetMapping("/variants/{id}")
    public CarListingResponse getCar(@PathVariable("id") Long id) {
        return catalogService.getById(id);
    }
}