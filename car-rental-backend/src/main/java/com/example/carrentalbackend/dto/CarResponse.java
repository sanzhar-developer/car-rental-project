package com.example.carrentalbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarResponse {
    private Long id;
    private String brand;
    private String model;
    private Integer year;
    private String licensePlate;
    private BigDecimal pricePerDay;
    private BigDecimal originalPrice;
    private String status;
    private Integer consecutiveBookings;
    private Boolean isPopular;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
}
