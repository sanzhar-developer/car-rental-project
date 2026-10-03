package com.example.carrentalbackend.controller;

import com.example.carrentalbackend.dto.PaymentRequest;
import com.example.carrentalbackend.dto.PaymentResponse;
import com.example.carrentalbackend.entity.User;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/bookings/{bookingId}/pay")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentResponse> payBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody PaymentRequest request,
            Authentication auth) {
        User currentUser = getCurrentUser(auth);
        return ResponseEntity.ok(paymentService.payBooking(bookingId, request, currentUser.getId()));
    }

    @PutMapping("/bookings/{bookingId}/pay-remaining")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PaymentResponse> payRemaining(
            @PathVariable Long bookingId,
            @Valid @RequestBody PaymentRequest request,
            Authentication auth) {
        User currentUser = getCurrentUser(auth);
        return ResponseEntity.ok(paymentService.payRemainingAmount(bookingId, request, currentUser.getId()));
    }

    @GetMapping("/bookings/{bookingId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<PaymentResponse> getBookingPayment(@PathVariable Long bookingId, Authentication auth) {
        User currentUser = getCurrentUser(auth);
        return ResponseEntity.ok(paymentService.getBookingPayment(bookingId, currentUser.getId(), currentUser.getRole()));
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
