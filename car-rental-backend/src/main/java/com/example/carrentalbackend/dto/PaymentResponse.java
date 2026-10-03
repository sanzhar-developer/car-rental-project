package com.example.carrentalbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private Boolean isDepositOnly;
    private String status;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime paidAt;
}
