package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findByStatus(Car.CarStatus status);
    List<Car> findByCategoryId(Long categoryId);
    List<Car> findByIsPopular(Boolean isPopular);

    @Query("SELECT c FROM Car c WHERE c.status IN ('AVAILABLE', 'BOOKED') AND c.id NOT IN " +
           "(SELECT b.car.id FROM Booking b WHERE b.status IN ('CONFIRMED', 'ACTIVE') " +
           "AND ((b.startDate < :endDate AND b.endDate > :startDate)))")
    List<Car> findAvailableCars(java.time.LocalDate startDate, java.time.LocalDate endDate);

    @Query("SELECT COUNT(c) FROM Car c WHERE c.status = :status")
    Long countByStatus(Car.CarStatus status);

    @Query("SELECT c FROM Car c WHERE LOWER(c.brand) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.model) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.licensePlate) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Car> searchCars(String query);

    @Query("SELECT COUNT(c) FROM Car c WHERE c.isPopular = :isPopular")
    Long countByIsPopular(Boolean isPopular);
}
