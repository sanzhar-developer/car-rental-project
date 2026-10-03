package com.example.carrentalbackend.controller;

import com.example.carrentalbackend.dto.BookingResponse;
import com.example.carrentalbackend.dto.CarResponse;
import com.example.carrentalbackend.dto.CreateStaffRequest;
import com.example.carrentalbackend.dto.DashboardStatisticsResponse;
import com.example.carrentalbackend.dto.RevenueStatisticsResponse;
import com.example.carrentalbackend.dto.UserResponse;
import com.example.carrentalbackend.entity.Booking;
import com.example.carrentalbackend.entity.Car;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.service.AdminService;
import com.example.carrentalbackend.service.BookingService;
import com.example.carrentalbackend.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private CarService carService;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/cars")
    public ResponseEntity<List<CarResponse>> getAllCars() {
        return ResponseEntity.ok(carService.getAllCarsForAdmin());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/statistics/dashboard")
    public ResponseEntity<DashboardStatisticsResponse> getDashboardStatistics() {
        try {
            System.out.println("=== Starting getDashboardStatistics ===");
            DashboardStatisticsResponse response = adminService.getDashboardStatistics();
            System.out.println("=== Successfully got dashboard statistics ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("=== ERROR in getDashboardStatistics ===");
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/statistics/revenue")
    public ResponseEntity<RevenueStatisticsResponse> getRevenueStatistics(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(adminService.getRevenueStatistics(start, end));
    }

    @GetMapping("/cars/filter")
    public ResponseEntity<List<CarResponse>> filterCarsByStatus(@RequestParam String status) {
        Car.CarStatus carStatus = Car.CarStatus.valueOf(status.toUpperCase());
        List<Car> cars = carRepository.findByStatus(carStatus);
        List<CarResponse> responses = cars.stream()
                .map(car -> {
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
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/cars/search")
    public ResponseEntity<List<CarResponse>> searchCars(@RequestParam String query) {
        List<Car> cars = carRepository.searchCars(query);
        List<CarResponse> responses = cars.stream()
                .map(car -> {
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
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/bookings/filter")
    public ResponseEntity<List<BookingResponse>> filterBookingsByStatus(@RequestParam String status) {
        Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
        List<Booking> bookings = bookingRepository.findByStatus(bookingStatus);
        List<BookingResponse> responses = bookings.stream()
                .map(booking -> {
                    BookingResponse response = new BookingResponse();
                    response.setId(booking.getId());
                    response.setUserId(booking.getUser().getId());
                    response.setUserFullName(booking.getUser().getFullName());
                    response.setUserEmail(booking.getUser().getEmail());
                    response.setCarId(booking.getCar().getId());
                    response.setCarBrand(booking.getCar().getBrand());
                    response.setCarModel(booking.getCar().getModel());
                    response.setStartDate(booking.getStartDate());
                    response.setEndDate(booking.getEndDate());
                    response.setActualReturnDate(booking.getActualReturnDate());
                    response.setTotalPrice(booking.getTotalPrice());
                    response.setDiscountApplied(booking.getDiscountApplied());
                    response.setStatus(booking.getStatus().name());
                    response.setIsLateReturn(booking.getIsLateReturn());
                    response.setCreatedAt(booking.getCreatedAt());
                    return response;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/cars/{id}/status")
    public ResponseEntity<CarResponse> updateCarStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth) {
        Car.CarStatus carStatus = Car.CarStatus.valueOf(status.toUpperCase());
        
        boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
        
        if (isManager && (carStatus == Car.CarStatus.RENTED || carStatus == Car.CarStatus.BOOKED)) {
            throw new RuntimeException("Managers cannot manually set car status to RENTED or BOOKED. These are automated.");
        }
        
        return ResponseEntity.ok(carService.updateCarStatus(id, carStatus));
    }

    @PostMapping("/users/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createManager(@RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(adminService.createManager(request));
    }

    @GetMapping("/users/managers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<UserResponse>> getManagers() {
        return ResponseEntity.ok(adminService.getManagers());
    }

}
