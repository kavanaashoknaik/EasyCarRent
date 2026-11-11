package com.carrental.controller;

import java.security.Principal;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.carrental.dto.ProfileResponse;
import com.carrental.dto.UpdateProfileRequest;
import com.carrental.service.CustomerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customer")
public class CustomerProfileController {

    private final CustomerService customerService;

    public CustomerProfileController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile(Principal principal) {
        return customerService.getProfile(principal.getName());
    }

    @PutMapping("/profile")
    public ProfileResponse updateProfile(Principal principal,
                                         @Valid @RequestBody UpdateProfileRequest request) {
        return customerService.updateProfile(principal.getName(), request);
    }

    @PostMapping(value = "/license", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfileResponse uploadLicense(Principal principal,
                                         @RequestParam("licenseNumber") String licenseNumber,
                                         @RequestParam("file") MultipartFile file) {
        return customerService.uploadLicense(principal.getName(), licenseNumber, file);
    }
}