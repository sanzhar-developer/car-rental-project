package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.*;
import com.example.carrentalbackend.entity.RefreshToken;
import com.example.carrentalbackend.entity.User;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private RateLimitService rateLimitService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(User.Role.USER);

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResponse(accessToken, refreshToken.getToken(), user.getId(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        String key = "login:" + ipAddress + ":" + request.getEmail();

        if (rateLimitService.isBlocked(key)) {
            throw new RuntimeException("Too many failed login attempts. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            rateLimitService.resetAttempts(key);

            String accessToken = tokenProvider.generateToken(authentication);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            return new AuthResponse(accessToken, refreshToken.getToken(), user.getId(), user.getEmail(), user.getRole().name());
        } catch (Exception e) {
            rateLimitService.recordFailedAttempt(key);
            throw new RuntimeException("Invalid email or password");
        }
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());

        User user = refreshToken.getUser();

        // Load user details for authentication
        org.springframework.security.core.userdetails.User userDetails =
            new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                java.util.Collections.emptyList()
            );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );

        String newAccessToken = tokenProvider.generateToken(authentication);

        return new AuthResponse(newAccessToken, refreshToken.getToken(), user.getId(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenService.revokeRefreshToken(refreshToken);
        }
    }
}
