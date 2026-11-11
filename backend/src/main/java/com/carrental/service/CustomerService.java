package com.carrental.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.carrental.dto.CustomerResponse;
import com.carrental.dto.LicenseReviewRequest;
import com.carrental.dto.ProfileResponse;
import com.carrental.dto.UpdateProfileRequest;
import com.carrental.entity.Customer;
import com.carrental.enums.LicenseStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final FileStorageService fileStorageService;

    public CustomerService(CustomerRepository customerRepository,
                           FileStorageService fileStorageService) {
        this.customerRepository = customerRepository;
        this.fileStorageService = fileStorageService;
    }

    // ---------------- Customer side ----------------

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        return toProfile(findByEmail(email));
    }

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        Customer customer = findByEmail(email);

        customer.setFullName(request.fullName().trim());
        customer.setPhone(request.phone());
        customer.setAddress(clean(request.address()));

        return toProfile(customerRepository.save(customer));
    }

    @Transactional
    public ProfileResponse uploadLicense(String email, String licenseNumber, MultipartFile file) {
        Customer customer = findByEmail(email);

        String number = (licenseNumber == null) ? "" : licenseNumber.trim();
        if (number.isEmpty()) {
            throw new BadRequestException("License number is required");
        }
        if (number.length() > 50) {
            throw new BadRequestException("License number must be at most 50 characters");
        }

        String oldFile = customer.getLicenseImagePath();
        String storedName = fileStorageService.storeLicense(file);

        customer.setLicenseNumber(number);
        customer.setLicenseImagePath(storedName);
        customer.setLicenseStatus(LicenseStatus.PENDING);
        customerRepository.save(customer);

        if (oldFile != null) {
            fileStorageService.deleteQuietly(oldFile);
        }

        return toProfile(customer);
    }

    // ---------------- Admin side ----------------

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers(LicenseStatus status) {
        List<Customer> customers = (status == null)
                ? customerRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                : customerRepository.findByLicenseStatus(status);

        return customers.stream().map(this::toCustomerResponse).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomer(Long id) {
        return toCustomerResponse(findById(id));
    }

    @Transactional
    public CustomerResponse reviewLicense(Long id, LicenseReviewRequest request) {
        LicenseStatus status = request.status();
        if (status != LicenseStatus.VERIFIED && status != LicenseStatus.REJECTED) {
            throw new BadRequestException("Status must be VERIFIED or REJECTED");
        }

        Customer customer = findById(id);
        if (customer.getLicenseImagePath() == null) {
            throw new BadRequestException("This customer has not uploaded a license yet");
        }

        customer.setLicenseStatus(status);
        return toCustomerResponse(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public String getLicenseFileName(Long id) {
        Customer customer = findById(id);
        if (customer.getLicenseImagePath() == null) {
            throw new ResourceNotFoundException("This customer has not uploaded a license yet");
        }
        return customer.getLicenseImagePath();
    }

    // ---------------- Helpers ----------------

    private Customer findByEmail(String email) {
        return customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
    }

    private Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
    }

    private ProfileResponse toProfile(Customer customer) {
        return new ProfileResponse(
                customer.getUser().getEmail(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getLicenseNumber(),
                customer.getLicenseStatus(),
                customer.getLicenseImagePath() != null);
    }

    private CustomerResponse toCustomerResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getUser().getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getLicenseNumber(),
                customer.getLicenseStatus(),
                customer.getLicenseImagePath() != null,
                customer.getCreatedAt());
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
