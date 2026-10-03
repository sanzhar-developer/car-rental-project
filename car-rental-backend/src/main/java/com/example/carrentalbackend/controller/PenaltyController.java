package com.example.carrentalbackend.controller;

import com.example.carrentalbackend.dto.PenaltyResponse;
import com.example.carrentalbackend.service.PenaltyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/penalties")
public class PenaltyController {

    @Autowired
    private PenaltyService penaltyService;

    @Autowired
    private com.example.carrentalbackend.repository.UserRepository userRepository;

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PenaltyResponse>> getMyPenalties(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(penaltyService.getUserPenalties(userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<PenaltyResponse>> getAllPenalties() {
        return ResponseEntity.ok(penaltyService.getAllPenalties());
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PenaltyResponse> payPenalty(@PathVariable Long id) {
        return ResponseEntity.ok(penaltyService.payPenalty(id));
    }

    @PutMapping("/{id}/waive")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PenaltyResponse> waivePenalty(@PathVariable Long id) {
        return ResponseEntity.ok(penaltyService.waivePenalty(id));
    }

    @PostMapping("/bookings/{bookingId}/traffic-fine")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PenaltyResponse> applyTrafficFine(@PathVariable Long bookingId) {
        return ResponseEntity.ok(penaltyService.applyTrafficFine(bookingId));
    }

    private Long getUserIdFromAuth(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
