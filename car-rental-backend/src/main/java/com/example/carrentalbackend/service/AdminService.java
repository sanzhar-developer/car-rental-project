package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.CreateStaffRequest;
import com.example.carrentalbackend.dto.DashboardStatisticsResponse;
import com.example.carrentalbackend.dto.RevenueStatisticsResponse;
import com.example.carrentalbackend.dto.UserResponse;
import com.example.carrentalbackend.entity.Booking;
import com.example.carrentalbackend.entity.Car;
import com.example.carrentalbackend.entity.User;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.repository.PenaltyRepository;
import com.example.carrentalbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PenaltyRepository penaltyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public DashboardStatisticsResponse getDashboardStatistics() {
        DashboardStatisticsResponse response = new DashboardStatisticsResponse();

        response.setTotalCars(carRepository.count());
        response.setAvailableCars(carRepository.countByStatus(Car.CarStatus.AVAILABLE));
        response.setBookedCars(carRepository.countByStatus(Car.CarStatus.BOOKED));
        response.setRentedCars(carRepository.countByStatus(Car.CarStatus.RENTED));

        response.setTotalBookings(bookingRepository.count());
        response.setActiveBookings(bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED));
        response.setCompletedBookings(bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED));
        response.setCancelledBookings(bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED));

        BigDecimal totalRevenue = bookingRepository.sumTotalRevenue();
        response.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        BigDecimal totalPenalties = penaltyRepository.sumTotalPenalties();
        response.setTotalPenalties(totalPenalties != null ? totalPenalties : BigDecimal.ZERO);

        BigDecimal unpaidPenalties = penaltyRepository.sumUnpaidPenalties();
        response.setUnpaidPenalties(unpaidPenalties != null ? unpaidPenalties : BigDecimal.ZERO);

        response.setTotalUsers(userRepository.count());

        DashboardStatisticsResponse.CarStatusCount carStatusCount = new DashboardStatisticsResponse.CarStatusCount();
        carStatusCount.setAvailable(carRepository.countByStatus(Car.CarStatus.AVAILABLE));
        carStatusCount.setBooked(carRepository.countByStatus(Car.CarStatus.BOOKED));
        carStatusCount.setRented(carRepository.countByStatus(Car.CarStatus.RENTED));
        carStatusCount.setInspection(carRepository.countByStatus(Car.CarStatus.INSPECTION));
        carStatusCount.setPenalty(carRepository.countByStatus(Car.CarStatus.PENALTY));
        carStatusCount.setDamaged(carRepository.countByStatus(Car.CarStatus.DAMAGED));
        carStatusCount.setPopular(carRepository.countByIsPopular(true));
        response.setCarStatusCount(carStatusCount);

        return response;
    }

    public RevenueStatisticsResponse getRevenueStatistics(LocalDate startDate, LocalDate endDate) {
        RevenueStatisticsResponse response = new RevenueStatisticsResponse();
        response.setStartDate(startDate);
        response.setEndDate(endDate);

        java.time.LocalDateTime startDateTime = startDate.atStartOfDay();
        java.time.LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        BigDecimal revenue = bookingRepository.sumRevenueByDateRange(startDateTime, endDateTime);
        response.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        BigDecimal discounts = bookingRepository.sumDiscountsByDateRange(startDateTime, endDateTime);
        response.setTotalDiscounts(discounts != null ? discounts : BigDecimal.ZERO);

        BigDecimal penalties = penaltyRepository.sumPenaltiesByDateRange(startDateTime, endDateTime);
        response.setTotalPenalties(penalties != null ? penalties : BigDecimal.ZERO);

        BigDecimal netRevenue = response.getTotalRevenue().add(response.getTotalPenalties());
        response.setNetRevenue(netRevenue);

        response.setTotalBookings(bookingRepository.countBookingsByDateRange(startDateTime, endDateTime));
        response.setCompletedBookings(bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED));

        return response;
    }

    public UserResponse createManager(CreateStaffRequest request) {
        return createStaff(request, User.Role.MANAGER);
    }

    public List<UserResponse> getManagers() {
        return userRepository.findByRole(User.Role.MANAGER)
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getPhoneNumber(),
                        user.getRole().name()
                ))
                .collect(Collectors.toList());
    }

    private UserResponse createStaff(CreateStaffRequest request, User.Role role) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(role);
        user.setCompletedBookings(0);
        user.setHasLateReturns(false);

        user = userRepository.save(user);
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRole().name()
        );
    }
}
