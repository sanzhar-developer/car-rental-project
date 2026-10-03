package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.BookingDetailResponse;
import com.example.carrentalbackend.dto.BookingRequest;
import com.example.carrentalbackend.dto.BookingResponse;
import com.example.carrentalbackend.entity.*;
import com.example.carrentalbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PenaltyRepository penaltyRepository;

    @Autowired
    private CarService carService;

    @Autowired
    private PricingService pricingService;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!request.getPrivacyPolicyAccepted()) {
            throw new RuntimeException("You must accept the privacy policy to proceed");
        }

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));


        if (car.getStatus() != Car.CarStatus.AVAILABLE &&
            car.getStatus() != Car.CarStatus.BOOKED) {
            throw new RuntimeException("Car is not available for booking");
        }


        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                car.getId(), request.getStartDate(), request.getEndDate());

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Car is already booked for these dates");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (days <= 0) {
            throw new RuntimeException("Invalid booking dates");
        }

        if (Boolean.TRUE.equals(request.getInstantRent()) && !request.getStartDate().equals(LocalDate.now())) {
            throw new RuntimeException("Instant rent requires startDate as today");
        }

        BigDecimal totalPrice = car.getPricePerDay().multiply(BigDecimal.valueOf(days));
        BigDecimal discount = BigDecimal.ZERO;

        // Discount 1: 7+ days = 20% discount
        if (days > 7) {
            BigDecimal discountAmount = totalPrice.multiply(BigDecimal.valueOf(0.20));
            discount = discount.add(discountAmount);
            totalPrice = totalPrice.subtract(discountAmount);
        }

        // Discount 2: 5+ bookings in current month = 20% discount on 6th booking
        LocalDate now = LocalDate.now();
        Integer bookingsThisMonth = bookingRepository.countCompletedBookingsInMonth(
                userId, now.getYear(), now.getMonthValue());

        if (bookingsThisMonth >= 5) {
            BigDecimal monthlyDiscount = totalPrice.multiply(BigDecimal.valueOf(0.20));
            discount = discount.add(monthlyDiscount);
            totalPrice = totalPrice.subtract(monthlyDiscount);
        }

        Booking booking = new Booking();
        if (bookingsThisMonth >= 5) {
            booking.setDiscountMessage("Так как вы арендовали 6-й автомобиль, мы предоставляем вам скидку 20%!");
        }
        booking.setUser(user);
        booking.setCar(car);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalPrice(totalPrice);
        booking.setDiscountApplied(discount);
        booking.setStatus(Booking.BookingStatus.PENDING);

        booking = bookingRepository.save(booking);

        Payment payment = new Payment();
        payment.setBooking(booking);

        // Calculate 20% deposit
        BigDecimal depositAmount = totalPrice.multiply(BigDecimal.valueOf(0.20));
        BigDecimal remainingAmount = totalPrice.multiply(BigDecimal.valueOf(0.80));

        payment.setAmount(depositAmount);
        payment.setDepositAmount(depositAmount);
        payment.setRemainingAmount(remainingAmount);
        payment.setIsDepositOnly(true);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse completeBooking(Long bookingId, LocalDate actualReturnDate) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setActualReturnDate(actualReturnDate);
        booking.setStatus(Booking.BookingStatus.COMPLETED);

        if (actualReturnDate.isAfter(booking.getEndDate())) {
            booking.setIsLateReturn(true);
            long daysLate = ChronoUnit.DAYS.between(booking.getEndDate(), actualReturnDate);

            User user = booking.getUser();
            user.setHasLateReturns(true);
            userRepository.save(user);

            // Penalty: (Daily rental price + 30,000 fine) * days late
            BigDecimal dailyRentalPrice = booking.getCar().getPricePerDay();
            BigDecimal finePerDay = BigDecimal.valueOf(30000);
            BigDecimal penaltyAmount = dailyRentalPrice.add(finePerDay)
                    .multiply(BigDecimal.valueOf(daysLate));
            createOrAccumulatePenalty(
                    booking,
                    penaltyAmount,
                    "Late return: " + daysLate + " day(s) late",
                    (int) daysLate
            );

            // Shift future bookings by the number of days late
            List<Booking> futureBookings = bookingRepository.findFutureBookingsForCar(
                    booking.getCar().getId(), booking.getEndDate());

            for (Booking future : futureBookings) {
                future.setStartDate(future.getStartDate().plusDays(daysLate));
                future.setEndDate(future.getEndDate().plusDays(daysLate));
                bookingRepository.save(future);
            }
        } else {
            User user = booking.getUser();
            user.setCompletedBookings(user.getCompletedBookings() + 1);
            userRepository.save(user);
        }

        Car car = booking.getCar();
        car.setStatus(Car.CarStatus.INSPECTION);
        carRepository.save(car);

        // Adjust car price based on monthly bookings
        pricingService.adjustPriceForCar(car.getId());

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking);
    }

    public BookingDetailResponse getBookingDetailById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToDetailResponse(booking);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        if (booking.getCar().getStatus() == Car.CarStatus.BOOKED) {
            Car car = booking.getCar();
            car.setStatus(Car.CarStatus.AVAILABLE);
            car.setConsecutiveBookings(Math.max(0, car.getConsecutiveBookings() - 1));
            carRepository.save(car);
        }
    }

    @Transactional
    public BookingResponse startRental(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStatus().equals(Booking.BookingStatus.CONFIRMED)) {
            throw new RuntimeException("Booking must be CONFIRMED to start rental");
        }

        booking.setStatus(Booking.BookingStatus.ACTIVE);
        Car car = booking.getCar();
        car.setStatus(Car.CarStatus.RENTED);
        carRepository.save(car);

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public void completeInspection(Long carId, Car.CarStatus newStatus, BigDecimal damageFine) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        if (!car.getStatus().equals(Car.CarStatus.INSPECTION)) {
            throw new RuntimeException("Car must be in INSPECTION status");
        }

        if (newStatus != Car.CarStatus.AVAILABLE &&
            newStatus != Car.CarStatus.DAMAGED &&
            newStatus != Car.CarStatus.PENALTY) {
            throw new RuntimeException("Invalid status transition from INSPECTION");
        }

        if (newStatus == Car.CarStatus.DAMAGED || newStatus == Car.CarStatus.PENALTY) {
            Booking lastBooking = bookingRepository.findFirstByCarIdAndStatusOrderByCreatedAtDesc(
                    carId,
                    Booking.BookingStatus.COMPLETED
            ).orElseThrow(() -> new RuntimeException("Completed booking not found for this car"));

            BigDecimal finalFine = (damageFine != null && damageFine.compareTo(BigDecimal.ZERO) > 0) 
                    ? damageFine 
                    : lastBooking.getCar().getPricePerDay().multiply(BigDecimal.valueOf(0.40));
            
            createOrAccumulatePenalty(lastBooking, finalFine, "Inspection: " + newStatus.name().toLowerCase() + " detected", 0);
        }

        car.setStatus(newStatus);
        carRepository.save(car);
    }

    @Transactional
    @Scheduled(cron = "0 */5 * * * ?")
    public void autoActivateConfirmedBookings() {
        LocalDate today = LocalDate.now();
        List<Booking> bookingsToActivate = bookingRepository.findConfirmedBookingsToActivate(today);
        for (Booking booking : bookingsToActivate) {
            booking.setStatus(Booking.BookingStatus.ACTIVE);
            bookingRepository.save(booking);

            Car car = booking.getCar();
            car.setStatus(Car.CarStatus.RENTED);
            carRepository.save(car);
        }
    }

    @Transactional
    public BookingResponse confirmBookingAfterPayment(Long bookingId, String transactionId, Payment.PaymentMethod method) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be paid");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentMethod(method);
        payment.setTransactionId(transactionId);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaidAt(java.time.LocalDateTime.now());
        paymentRepository.save(payment);

        Car car = booking.getCar();
        boolean instantRent = booking.getStartDate().equals(LocalDate.now());
        if (instantRent) {
            booking.setStatus(Booking.BookingStatus.ACTIVE);
            car.setStatus(Car.CarStatus.RENTED);
        } else {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            car.setStatus(Car.CarStatus.BOOKED);
        }

        car.setConsecutiveBookings(car.getConsecutiveBookings() + 1);
        carRepository.save(car);
        carService.markAsPopular(car.getId());

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse confirmFullPaymentAfterRemaining(Long bookingId, String transactionId, Payment.PaymentMethod method) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentMethod(method);
        payment.setTransactionId(transactionId);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaidAt(java.time.LocalDateTime.now());
        payment.setIsDepositOnly(false);
        payment.setAmount(booking.getTotalPrice());
        paymentRepository.save(payment);

        // Transition booking to ACTIVE and car to RENTED after full payment
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        Car car = booking.getCar();
        car.setStatus(Car.CarStatus.RENTED);
        carRepository.save(car);
        bookingRepository.save(booking);

        return mapToResponse(booking);
    }

    @Transactional
    public Penalty createOrAccumulatePenalty(Booking booking, BigDecimal amount, String reason, Integer daysLate) {
        Penalty penalty = penaltyRepository.findByBookingId(booking.getId()).orElse(null);
        if (penalty == null) {
            penalty = new Penalty();
            penalty.setBooking(booking);
            penalty.setUser(booking.getUser());
            penalty.setAmount(amount);
            penalty.setDaysLate(daysLate);
            penalty.setReason(reason);
            penalty.setStatus(Penalty.PenaltyStatus.UNPAID);
            return penaltyRepository.save(penalty);
        }

        penalty.setAmount(penalty.getAmount().add(amount));
        penalty.setReason(penalty.getReason() + " | " + reason);
        penalty.setStatus(Penalty.PenaltyStatus.UNPAID);
        if (daysLate != null && daysLate > 0) {
            penalty.setDaysLate(daysLate);
        }
        return penaltyRepository.save(penalty);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUser().getId());
        response.setUserFullName(booking.getUser().getFullName());
        response.setUserEmail(booking.getUser().getEmail());
        response.setCarId(booking.getCar().getId());
        response.setCarBrand(booking.getCar().getBrand());
        response.setCarModel(booking.getCar().getModel());
        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setActualReturnDate(booking.getActualReturnDate());
        response.setTotalPrice(booking.getTotalPrice());
        response.setDiscountApplied(booking.getDiscountApplied());
        response.setStatus(booking.getStatus().name());
        if (booking.getPayment() != null) {
            response.setIsDepositOnly(booking.getPayment().getIsDepositOnly());
        }
        
        // Dynamic fallback for discount message
        String message = booking.getDiscountMessage();
        if (message == null && booking.getDiscountApplied() != null && booking.getDiscountApplied().compareTo(java.math.BigDecimal.ZERO) > 0) {
            message = "Так как вы арендовали более 5 автомобилей, мы предоставили вам скидку 20%!";
        }
        response.setDiscountMessage(message);
        
        response.setIsLateReturn(booking.getIsLateReturn());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }

    private BookingDetailResponse mapToDetailResponse(Booking booking) {
        BookingDetailResponse response = new BookingDetailResponse();

        // Booking info
        response.setId(booking.getId());
        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setActualReturnDate(booking.getActualReturnDate());
        response.setTotalPrice(booking.getTotalPrice());
        response.setDiscountApplied(booking.getDiscountApplied());
        response.setStatus(booking.getStatus().name());
        response.setIsLateReturn(booking.getIsLateReturn());
        response.setCreatedAt(booking.getCreatedAt());

        // User info
        User user = booking.getUser();
        response.setUserId(user.getId());
        response.setUserFullName(user.getFullName());
        response.setUserEmail(user.getEmail());
        response.setUserPhoneNumber(user.getPhoneNumber());
        response.setUserRole(user.getRole().name());
        response.setUserCompletedBookings(user.getCompletedBookings());
        response.setUserHasLateReturns(user.getHasLateReturns());

        // Car info
        Car car = booking.getCar();
        response.setCarId(car.getId());
        response.setCarBrand(car.getBrand());
        response.setCarModel(car.getModel());
        response.setCarYear(car.getYear());
        response.setCarLicensePlate(car.getLicensePlate());
        response.setCarPricePerDay(car.getPricePerDay());
        response.setCarStatus(car.getStatus().name());
        response.setCarImageUrl(car.getImageUrl());
        response.setCarCategoryName(car.getCategory().getName());

        // Payment info
        if (booking.getPayment() != null) {
            Payment payment = booking.getPayment();
            response.setPaymentId(payment.getId());
            response.setPaymentAmount(payment.getAmount());
            response.setDepositAmount(payment.getDepositAmount());
            response.setRemainingAmount(payment.getRemainingAmount());
            response.setPaymentStatus(payment.getStatus().name());
            response.setIsDepositOnly(payment.getIsDepositOnly());
        }

        // Penalty info
        if (booking.getPenalty() != null) {
            Penalty penalty = booking.getPenalty();
            response.setPenaltyId(penalty.getId());
            response.setPenaltyAmount(penalty.getAmount());
            response.setPenaltyDaysLate(penalty.getDaysLate());
            response.setPenaltyReason(penalty.getReason());
            response.setPenaltyStatus(penalty.getStatus().name());
        }

        return response;
    }
}
