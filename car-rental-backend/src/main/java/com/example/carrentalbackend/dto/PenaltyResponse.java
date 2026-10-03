package com.example.carrentalbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PenaltyResponse {
    private Long id;
    private Long bookingId;
    private Long userId;
    private String userFullName;
    private BigDecimal amount;
    private Integer daysLate;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
