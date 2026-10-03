package com.example.carrentalbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long carId;
    private String carBrand;
    private String carModel;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate actualReturnDate;
    private BigDecimal totalPrice;
    private BigDecimal discountApplied;
    private String status;
    private Boolean isDepositOnly;
    private Boolean isLateReturn;
    private String discountMessage;
    private LocalDateTime createdAt;
}
