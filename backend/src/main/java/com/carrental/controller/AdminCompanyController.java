package com.carrental.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.CompanyRequest;
import com.carrental.dto.CompanyResponse;
import com.carrental.dto.MessageResponse;
import com.carrental.service.CarCompanyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/companies")
public class AdminCompanyController {

    private final CarCompanyService companyService;

    public AdminCompanyController(CarCompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.create(request));
    }

    @GetMapping
    public List<CompanyResponse> getAll() {
        return companyService.getAll();
    }

    @GetMapping("/{id}")
    public CompanyResponse getById(@PathVariable("id") Long id) {
        return companyService.getById(id);
    }

    @PutMapping("/{id}")
    public CompanyResponse update(@PathVariable("id") Long id,
                                  @Valid @RequestBody CompanyRequest request) {
        return companyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable("id") Long id) {
        companyService.delete(id);
        return new MessageResponse("Company deleted successfully");
    }
}