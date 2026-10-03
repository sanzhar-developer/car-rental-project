package com.example.carrentalbackend.service;

import com.example.carrentalbackend.entity.Car;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PricingService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    @Scheduled(cron = "0 0 0 1 * ?")
    public void adjustMonthlyPrices() {
        LocalDate now = LocalDate.now();
        int lastMonth = now.minusMonths(1).getMonthValue();
        int lastYear = now.minusMonths(1).getYear();

        List<Car> allCars = carRepository.findAll();

        for (Car car : allCars) {
            Integer bookingsLastMonth = bookingRepository.countCompletedBookingsByCarInMonth(
                    car.getId(), lastYear, lastMonth);

            if (bookingsLastMonth >= 7) {
                BigDecimal newPrice = car.getOriginalPrice().multiply(BigDecimal.valueOf(1.20));
                car.setPricePerDay(newPrice);
                car.setIsPopular(true);
            } else if (bookingsLastMonth == 0) {
                BigDecimal newPrice = car.getOriginalPrice().multiply(BigDecimal.valueOf(0.80));
                car.setPricePerDay(newPrice);
                car.setIsPopular(false);
            } else {
                car.setPricePerDay(car.getOriginalPrice());
                car.setIsPopular(false);
            }

            carRepository.save(car);
        }
    }

    @Transactional
    public void adjustPriceForCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        LocalDate now = LocalDate.now();
        Integer bookingsThisMonth = bookingRepository.countCompletedBookingsByCarInMonth(
                carId, now.getYear(), now.getMonthValue());

        if (bookingsThisMonth >= 7) {
            BigDecimal newPrice = car.getOriginalPrice().multiply(BigDecimal.valueOf(1.20));
            car.setPricePerDay(newPrice);
            car.setIsPopular(true);
        } else if (bookingsThisMonth == 0 && now.getDayOfMonth() > 15) {
            BigDecimal newPrice = car.getOriginalPrice().multiply(BigDecimal.valueOf(0.80));
            car.setPricePerDay(newPrice);
            car.setIsPopular(false);
        } else {
            car.setPricePerDay(car.getOriginalPrice());
            car.setIsPopular(false);
        }

        carRepository.save(car);
    }
}
