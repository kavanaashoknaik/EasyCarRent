package com.carrental.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.PaymentRequest;
import com.carrental.dto.PaymentResponse;
import com.carrental.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customer/payments")
public class CustomerPaymentController {

    private final PaymentService paymentService;

    public CustomerPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> pay(Principal principal,
                                               @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.pay(principal.getName(), request));
    }

    @GetMapping
    public List<PaymentResponse> getMyPayments(Principal principal) {
        return paymentService.getMyPayments(principal.getName());
    }

    @GetMapping("/booking/{bookingId}")
    public PaymentResponse getReceipt(Principal principal,
                                      @PathVariable("bookingId") Long bookingId) {
        return paymentService.getMyReceipt(principal.getName(), bookingId);
    }
}