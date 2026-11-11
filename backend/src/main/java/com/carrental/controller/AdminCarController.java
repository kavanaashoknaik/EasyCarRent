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

import com.carrental.dto.CarRequest;
import com.carrental.dto.CarResponse;
import com.carrental.dto.MessageResponse;
import com.carrental.service.CarService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/cars")
public class AdminCarController {

    private final CarService carService;

    public AdminCarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping
    public ResponseEntity<CarResponse> create(@Valid @RequestBody CarRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(carService.create(request));
    }

    @GetMapping
    public List<CarResponse> getAll(
            @RequestParam(name = "variantId", required = false) Long variantId) {
        return carService.getAll(variantId);
    }

    @GetMapping("/{id}")
    public CarResponse getById(@PathVariable("id") Long id) {
        return carService.getById(id);
    }

    @PutMapping("/{id}")
    public CarResponse update(@PathVariable("id") Long id,
                              @Valid @RequestBody CarRequest request) {
        return carService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable("id") Long id) {
        carService.delete(id);
        return new MessageResponse("Car deleted successfully");
    }
}