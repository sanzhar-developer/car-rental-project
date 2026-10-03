package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.CarRequest;
import com.example.carrentalbackend.dto.CarResponse;
import com.example.carrentalbackend.entity.Booking;
import com.example.carrentalbackend.entity.Car;
import com.example.carrentalbackend.entity.Category;
import com.example.carrentalbackend.entity.User;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.repository.CategoryRepository;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Cacheable(value = "cars", key = "#id")
    public CarResponse getCarById(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        return mapToResponse(car);
    }

    @Cacheable(value = "cars")
    public List<CarResponse> getAllCars(String authHeader) {
        // Get all cars
        List<Car> allCars = carRepository.findAll();

        // If no auth header, return only AVAILABLE and BOOKED cars
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return allCars.stream()
                    .filter(car -> car.getStatus() == Car.CarStatus.AVAILABLE ||
                                   car.getStatus() == Car.CarStatus.BOOKED)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Extract token and get user
        String token = authHeader.substring(7);
        String email = jwtTokenProvider.getUsernameFromToken(token);
        User user = userRepository.findByEmail(email).orElse(null);

        // If user not found, return only AVAILABLE and BOOKED
        if (user == null) {
            return allCars.stream()
                    .filter(car -> car.getStatus() == Car.CarStatus.AVAILABLE ||
                                   car.getStatus() == Car.CarStatus.BOOKED)
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // If ADMIN or MANAGER, return all cars
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.MANAGER) {
            return allCars.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // For regular users: show only AVAILABLE and BOOKED (if only deposit paid)
        return allCars.stream()
                .filter(car -> {
                    if (car.getStatus() == Car.CarStatus.AVAILABLE) return true;
                    if (car.getStatus() == Car.CarStatus.BOOKED) {
                        // Check if the current booking for this car is fully paid
                        Booking activeBooking = bookingRepository.findFirstByCarIdAndStatusInOrderByCreatedAtDesc(
                                car.getId(), 
                                List.of(Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.PENDING)
                        ).orElse(null);
                        
                        if (activeBooking != null && activeBooking.getPayment() != null) {
                            // If fully paid (isDepositOnly = false), hide it from catalog
                            return activeBooking.getPayment().getIsDepositOnly();
                        }
                        return true; // Show if no payment info yet
                    }
                    return false;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CarResponse> getAllCarsForAdmin() {
        return carRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CarResponse> getAvailableCars(LocalDate startDate, LocalDate endDate) {
        return carRepository.findAvailableCars(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "cars", allEntries = true)
    public CarResponse createCar(CarRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Car car = new Car();
        car.setBrand(request.getBrand());
        car.setModel(request.getModel());
        car.setYear(request.getYear());
        car.setLicensePlate(request.getLicensePlate());
        car.setPricePerDay(request.getPricePerDay());
        car.setOriginalPrice(request.getPricePerDay());
        car.setImageUrl(request.getImageUrl());
        car.setCategory(category);
        car.setStatus(Car.CarStatus.AVAILABLE);

        car = carRepository.save(car);
        return mapToResponse(car);
    }

    @Transactional
    @CacheEvict(value = "cars", allEntries = true)
    public CarResponse updateCar(Long id, CarRequest request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        car.setBrand(request.getBrand());
        car.setModel(request.getModel());
        car.setYear(request.getYear());
        car.setLicensePlate(request.getLicensePlate());
        car.setPricePerDay(request.getPricePerDay());
        car.setImageUrl(request.getImageUrl());
        car.setCategory(category);

        car = carRepository.save(car);
        return mapToResponse(car);
    }

    @Transactional
    @CacheEvict(value = "cars", allEntries = true)
    public void deleteCar(Long id) {
        carRepository.deleteById(id);
    }

    @Transactional
    public void markAsPopular(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        if (car.getConsecutiveBookings() >= 10 && !car.getIsPopular()) {
            car.setIsPopular(true);
            BigDecimal newPrice = car.getOriginalPrice().multiply(BigDecimal.valueOf(1.10));
            car.setPricePerDay(newPrice);
            carRepository.save(car);
        }
    }

    @Transactional
    @CacheEvict(value = "cars", allEntries = true)
    public CarResponse updateCarStatus(Long carId, Car.CarStatus newStatus) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        car.setStatus(newStatus);
        car = carRepository.save(car);
        return mapToResponse(car);
    }

    private CarResponse mapToResponse(Car car) {
        CarResponse response = new CarResponse();
        response.setId(car.getId());
        response.setBrand(car.getBrand());
        response.setModel(car.getModel());
        response.setYear(car.getYear());
        response.setLicensePlate(car.getLicensePlate());
        response.setPricePerDay(car.getPricePerDay());
        response.setOriginalPrice(car.getOriginalPrice());
        response.setStatus(car.getStatus().name());
        response.setConsecutiveBookings(car.getConsecutiveBookings());
        response.setIsPopular(car.getIsPopular());
        response.setImageUrl(car.getImageUrl());
        response.setCategoryId(car.getCategory().getId());
        response.setCategoryName(car.getCategory().getName());
        return response;
    }
}
