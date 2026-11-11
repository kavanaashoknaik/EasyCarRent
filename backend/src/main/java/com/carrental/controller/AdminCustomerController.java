package com.carrental.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.CustomerResponse;
import com.carrental.dto.LicenseReviewRequest;
import com.carrental.enums.LicenseStatus;
import com.carrental.service.CustomerService;
import com.carrental.service.FileStorageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/customers")
public class AdminCustomerController {

    private final CustomerService customerService;
    private final FileStorageService fileStorageService;

    public AdminCustomerController(CustomerService customerService,
                                   FileStorageService fileStorageService) {
        this.customerService = customerService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public List<CustomerResponse> getAll(
            @RequestParam(name = "licenseStatus", required = false) LicenseStatus licenseStatus) {
        return customerService.getAllCustomers(licenseStatus);
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable("id") Long id) {
        return customerService.getCustomer(id);
    }

    @PutMapping("/{id}/license")
    public CustomerResponse reviewLicense(@PathVariable("id") Long id,
                                          @Valid @RequestBody LicenseReviewRequest request) {
        return customerService.reviewLicense(id, request);
    }

    @GetMapping("/{id}/license-file")
    public ResponseEntity<Resource> getLicenseFile(@PathVariable("id") Long id) {
        String fileName = customerService.getLicenseFileName(id);
        Resource resource = fileStorageService.loadAsResource(fileName);

        return ResponseEntity.ok()
                .contentType(fileStorageService.detectMediaType(fileName))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }
}