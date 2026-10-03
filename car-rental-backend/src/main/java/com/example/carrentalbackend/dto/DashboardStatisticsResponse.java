package com.example.carrentalbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatisticsResponse {
    private Long totalCars;
    private Long availableCars;
    private Long bookedCars;
    private Long rentedCars;
    private Long totalBookings;
    private Long activeBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private BigDecimal totalRevenue;
    private BigDecimal totalPenalties;
    private BigDecimal unpaidPenalties;
    private Long totalUsers;
    private CarStatusCount carStatusCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarStatusCount {
        private Long available;
        private Long booked;
        private Long rented;
        private Long inspection;
        private Long penalty;
        private Long damaged;
        private Long popular;
    }
}
