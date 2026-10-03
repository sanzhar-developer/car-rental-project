package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByCarId(Long carId);
    List<Booking> findByStatus(Booking.BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'COMPLETED' AND b.isLateReturn = false")
    Integer countCompletedBookingsWithoutLateReturns(Long userId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'COMPLETED' " +
           "AND YEAR(b.createdAt) = :year AND MONTH(b.createdAt) = :month")
    Integer countCompletedBookingsInMonth(Long userId, int year, int month);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.car.id = :carId AND b.status = 'COMPLETED'")
    Integer countCompletedBookingsByCar(Long carId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.car.id = :carId AND b.status = 'COMPLETED' " +
           "AND YEAR(b.createdAt) = :year AND MONTH(b.createdAt) = :month")
    Integer countCompletedBookingsByCarInMonth(Long carId, int year, int month);

    @Query("SELECT b FROM Booking b WHERE b.car.id = :carId AND b.status IN ('CONFIRMED', 'ACTIVE') " +
           "AND ((b.startDate < :endDate AND b.endDate > :startDate))")
    List<Booking> findConflictingBookings(Long carId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.car.id = :carId AND b.status IN ('CONFIRMED', 'ACTIVE') AND b.startDate > :afterDate ORDER BY b.startDate ASC")
    List<Booking> findFutureBookingsForCar(Long carId, LocalDate afterDate);

    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.startDate <= :today")
    List<Booking> findConfirmedBookingsToActivate(LocalDate today);

    Optional<Booking> findFirstByCarIdAndStatusOrderByCreatedAtDesc(Long carId, Booking.BookingStatus status);
    Optional<Booking> findFirstByCarIdAndStatusInOrderByCreatedAtDesc(Long carId, List<Booking.BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    Long countByStatus(Booking.BookingStatus status);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = 'COMPLETED'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = 'COMPLETED' AND b.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT SUM(b.discountApplied) FROM Booking b WHERE b.status = 'COMPLETED' AND b.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumDiscountsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :startDate AND :endDate")
    Long countBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
}
