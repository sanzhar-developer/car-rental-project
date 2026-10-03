package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.PenaltyResponse;
import com.example.carrentalbackend.entity.Booking;
import com.example.carrentalbackend.entity.Car;
import com.example.carrentalbackend.entity.Penalty;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.repository.PenaltyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PenaltyService {

    @Autowired
    private PenaltyRepository penaltyRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;

    public List<PenaltyResponse> getUserPenalties(Long userId) {
        return penaltyRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PenaltyResponse> getAllPenalties() {
        return penaltyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PenaltyResponse payPenalty(Long penaltyId) {
        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new RuntimeException("Penalty not found"));

        penalty.setStatus(Penalty.PenaltyStatus.PAID);
        penalty.setPaidAt(LocalDateTime.now());

        penalty = penaltyRepository.save(penalty);
        Car car = penalty.getBooking().getCar();
        if (car.getStatus() == Car.CarStatus.PENALTY || car.getStatus() == Car.CarStatus.DAMAGED) {
            car.setStatus(Car.CarStatus.AVAILABLE);
            carRepository.save(car);
        }
        return mapToResponse(penalty);
    }

    @Transactional
    public PenaltyResponse waivePenalty(Long penaltyId) {
        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new RuntimeException("Penalty not found"));

        penalty.setStatus(Penalty.PenaltyStatus.WAIVED);
        penalty = penaltyRepository.save(penalty);
        Car car = penalty.getBooking().getCar();
        if (car.getStatus() == Car.CarStatus.PENALTY || car.getStatus() == Car.CarStatus.DAMAGED) {
            car.setStatus(Car.CarStatus.AVAILABLE);
            carRepository.save(car);
        }
        return mapToResponse(penalty);
    }

    @Transactional
    public PenaltyResponse applyTrafficFine(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Penalty penalty = penaltyRepository.findByBookingId(bookingId).orElseGet(() -> {
            Penalty p = new Penalty();
            p.setBooking(booking);
            p.setUser(booking.getUser());
            p.setAmount(BigDecimal.ZERO);
            p.setDaysLate(0);
            p.setReason("Traffic fine");
            p.setStatus(Penalty.PenaltyStatus.UNPAID);
            return p;
        });

        penalty.setAmount(penalty.getAmount().add(BigDecimal.valueOf(100000)));
        penalty.setReason((penalty.getReason() == null ? "" : penalty.getReason() + " | ") + "Traffic radar violation +100000");
        penalty.setStatus(Penalty.PenaltyStatus.UNPAID);
        penalty = penaltyRepository.save(penalty);

        Car car = booking.getCar();
        car.setStatus(Car.CarStatus.PENALTY);
        carRepository.save(car);

        return mapToResponse(penalty);
    }

    private PenaltyResponse mapToResponse(Penalty penalty) {
        PenaltyResponse response = new PenaltyResponse();
        response.setId(penalty.getId());
        response.setBookingId(penalty.getBooking().getId());
        response.setUserId(penalty.getUser().getId());
        response.setUserFullName(penalty.getUser().getFullName());
        response.setAmount(penalty.getAmount());
        response.setDaysLate(penalty.getDaysLate());
        response.setReason(penalty.getReason());
        response.setStatus(penalty.getStatus().name());
        response.setCreatedAt(penalty.getCreatedAt());
        response.setPaidAt(penalty.getPaidAt());
        return response;
    }
}
