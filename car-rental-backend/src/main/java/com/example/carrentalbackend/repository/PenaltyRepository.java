package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    List<Penalty> findByUserId(Long userId);
    Optional<Penalty> findByBookingId(Long bookingId);
    List<Penalty> findByStatus(Penalty.PenaltyStatus status);

    @Query("SELECT SUM(p.amount) FROM Penalty p")
    BigDecimal sumTotalPenalties();

    @Query("SELECT SUM(p.amount) FROM Penalty p WHERE p.status = 'UNPAID'")
    BigDecimal sumUnpaidPenalties();

    @Query("SELECT SUM(p.amount) FROM Penalty p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumPenaltiesByDateRange(LocalDateTime startDate, LocalDateTime endDate);
}
