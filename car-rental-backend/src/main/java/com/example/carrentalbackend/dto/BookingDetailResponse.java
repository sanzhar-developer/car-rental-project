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
public class BookingDetailResponse {
    // Booking info
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate actualReturnDate;
    private BigDecimal totalPrice;
    private BigDecimal discountApplied;
    private String status;
    private Boolean isLateReturn;
    private LocalDateTime createdAt;

    // User info
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String userPhoneNumber;
    private String userRole;
    private Integer userCompletedBookings;
    private Boolean userHasLateReturns;

    // Car info
    private Long carId;
    private String carBrand;
    private String carModel;
    private Integer carYear;
    private String carLicensePlate;
    private BigDecimal carPricePerDay;
    private String carStatus;
    private String carImageUrl;
    private String carCategoryName;

    // Payment info
    private Long paymentId;
    private BigDecimal paymentAmount;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private String paymentStatus;
    private Boolean isDepositOnly;

    // Penalty info (if exists)
    private Long penaltyId;
    private BigDecimal penaltyAmount;
    private Integer penaltyDaysLate;
    private String penaltyReason;
    private String penaltyStatus;
}
