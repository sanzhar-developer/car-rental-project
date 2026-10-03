package com.example.carrentalbackend.controller;

import com.example.carrentalbackend.dto.BookingDetailResponse;
import com.example.carrentalbackend.dto.BookingRequest;
import com.example.carrentalbackend.dto.BookingResponse;
import com.example.carrentalbackend.entity.Car;
import com.example.carrentalbackend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private com.example.carrentalbackend.repository.UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request, Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(bookingService.createBooking(request, userId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/{id}/detail")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BookingDetailResponse> getBookingDetailById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingDetailById(id));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BookingResponse> completeBooking(@PathVariable Long id, @RequestParam LocalDate actualReturnDate) {
        return ResponseEntity.ok(bookingService.completeBooking(id, actualReturnDate));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BookingResponse> startRental(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.startRental(id));
    }

    @PutMapping("/cars/{carId}/inspection")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> completeInspection(
            @PathVariable Long carId,
            @RequestParam String status,
            @RequestParam(required = false) BigDecimal damageFine) {
        Car.CarStatus newStatus = Car.CarStatus.valueOf(status.toUpperCase());
        bookingService.completeInspection(carId, newStatus, damageFine);
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
