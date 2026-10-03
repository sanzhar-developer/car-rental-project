package com.example.carrentalbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarRequest {

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotNull(message = "Price per day is required")
    @Positive(message = "Price must be positive")
    private BigDecimal pricePerDay;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String imageUrl;
}
