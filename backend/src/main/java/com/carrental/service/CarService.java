package com.carrental.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.dto.CarRequest;
import com.carrental.dto.CarResponse;
import com.carrental.entity.Car;
import com.carrental.entity.CarVariant;
import com.carrental.enums.CarStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarVariantRepository;

@Service
public class CarService {

    private final CarRepository carRepository;
    private final CarVariantRepository variantRepository;
    private final BookingRepository bookingRepository;

    public CarService(CarRepository carRepository,
                      CarVariantRepository variantRepository,
                      BookingRepository bookingRepository) {
        this.carRepository = carRepository;
        this.variantRepository = variantRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public CarResponse create(CarRequest request) {
        CarVariant variant = findVariant(request.variantId());
        String registrationNumber = normalize(request.registrationNumber());

        if (carRepository.existsByRegistrationNumberIgnoreCase(registrationNumber)) {
            throw new BadRequestException(
                    "A car with registration number " + registrationNumber + " already exists");
        }

        Car car = new Car();
        car.setVariant(variant);
        car.setRegistrationNumber(registrationNumber);
        car.setColor(clean(request.color()));
        car.setManufacturingYear(request.manufacturingYear());
        car.setStatus(request.status() != null ? request.status() : CarStatus.AVAILABLE);

        return toResponse(carRepository.save(car));
    }

    @Transactional(readOnly = true)
    public List<CarResponse> getAll(Long variantId) {
        List<Car> cars = (variantId == null)
                ? carRepository.findAll(Sort.by("id"))
                : carRepository.findByVariantId(variantId);

        return cars.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CarResponse getById(Long id) {
        return toResponse(findCar(id));
    }

    @Transactional
    public CarResponse update(Long id, CarRequest request) {
        Car car = findCar(id);
        CarVariant variant = findVariant(request.variantId());
        String registrationNumber = normalize(request.registrationNumber());

        boolean changed = !car.getRegistrationNumber().equalsIgnoreCase(registrationNumber);
        if (changed && carRepository.existsByRegistrationNumberIgnoreCase(registrationNumber)) {
            throw new BadRequestException(
                    "A car with registration number " + registrationNumber + " already exists");
        }

        car.setVariant(variant);
        car.setRegistrationNumber(registrationNumber);
        car.setColor(clean(request.color()));
        car.setManufacturingYear(request.manufacturingYear());
        if (request.status() != null) {
            car.setStatus(request.status());
        }

        return toResponse(carRepository.save(car));
    }

    @Transactional
    public void delete(Long id) {
        Car car = findCar(id);

        if (bookingRepository.existsByCarId(id)) {
            throw new BadRequestException(
                    "Cannot delete this car because it has bookings. Set its status to MAINTENANCE instead.");
        }

        carRepository.delete(car);
    }

    private Car findCar(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id " + id));
    }

    private CarVariant findVariant(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id " + id));
    }

    private CarResponse toResponse(Car car) {
        CarVariant variant = car.getVariant();
        return new CarResponse(
                car.getId(),
                variant.getId(),
                variant.getName(),
                variant.getCompany().getName(),
                car.getRegistrationNumber(),
                car.getColor(),
                car.getManufacturingYear(),
                car.getStatus());
    }

    private static String normalize(String registrationNumber) {
        return registrationNumber.trim().toUpperCase();
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}