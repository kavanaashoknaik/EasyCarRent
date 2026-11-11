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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.MessageResponse;
import com.carrental.dto.VariantRequest;
import com.carrental.dto.VariantResponse;
import com.carrental.service.CarVariantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/variants")
public class AdminVariantController {

    private final CarVariantService variantService;

    public AdminVariantController(CarVariantService variantService) {
        this.variantService = variantService;
    }

    @PostMapping
    public ResponseEntity<VariantResponse> create(@Valid @RequestBody VariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(variantService.create(request));
    }

    @GetMapping
    public List<VariantResponse> getAll(
            @RequestParam(name = "companyId", required = false) Long companyId) {
        return variantService.getAll(companyId);
    }

    @GetMapping("/{id}")
    public VariantResponse getById(@PathVariable("id") Long id) {
        return variantService.getById(id);
    }

    @PutMapping("/{id}")
    public VariantResponse update(@PathVariable("id") Long id,
                                  @Valid @RequestBody VariantRequest request) {
        return variantService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable("id") Long id) {
        variantService.delete(id);
        return new MessageResponse("Variant deleted successfully");
    }
}
