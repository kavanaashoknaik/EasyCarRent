package com.carrental.entity;

import com.carrental.enums.CarStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many physical cars belong to one variant
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private CarVariant variant;

    @Column(name = "registration_number", nullable = false, length = 20)
    private String registrationNumber;

    @Column(length = 30)
    private String color;

    @Column(name = "manufacturing_year")
    private Integer manufacturingYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CarStatus status = CarStatus.AVAILABLE;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CarVariant getVariant() { return variant; }
    public void setVariant(CarVariant variant) { this.variant = variant; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getManufacturingYear() { return manufacturingYear; }
    public void setManufacturingYear(Integer manufacturingYear) { this.manufacturingYear = manufacturingYear; }

    public CarStatus getStatus() { return status; }
    public void setStatus(CarStatus status) { this.status = status; }
}