package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.PaymentRequest;
import com.example.carrentalbackend.dto.PaymentResponse;
import com.example.carrentalbackend.entity.Booking;
import com.example.carrentalbackend.entity.Payment;
import com.example.carrentalbackend.entity.User;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @Transactional
    public PaymentResponse payBooking(Long bookingId, PaymentRequest request, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can pay only your own booking");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        String transactionId = "MOCK-" + java.util.UUID.randomUUID();
        bookingService.confirmBookingAfterPayment(bookingId, transactionId, method);

        payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse payRemainingAmount(Long bookingId, PaymentRequest request, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can pay only your own booking");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getIsDepositOnly()) {
            throw new RuntimeException("Payment is already fully completed");
        }

        Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        String transactionId = "MOCK-FULL-" + java.util.UUID.randomUUID();
        
        bookingService.confirmFullPaymentAfterRemaining(bookingId, transactionId, method);

        payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

    public PaymentResponse getBookingPayment(Long bookingId, Long userId, User.Role requesterRole) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isOwner = booking.getUser().getId().equals(userId);
        boolean isManagerOrAdmin = requesterRole == User.Role.ADMIN || requesterRole == User.Role.MANAGER;
        if (!isOwner && !isManagerOrAdmin) {
            throw new RuntimeException("Access denied");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setBookingId(payment.getBooking().getId());
        response.setAmount(payment.getAmount());
        response.setDepositAmount(payment.getDepositAmount());
        response.setRemainingAmount(payment.getRemainingAmount());
        response.setIsDepositOnly(payment.getIsDepositOnly());
        response.setStatus(payment.getStatus().name());
        response.setPaymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null);
        response.setTransactionId(payment.getTransactionId());
        response.setPaidAt(payment.getPaidAt());
        return response;
    }
}
