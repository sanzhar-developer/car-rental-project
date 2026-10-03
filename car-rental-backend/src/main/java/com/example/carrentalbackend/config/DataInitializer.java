package com.example.carrentalbackend.config;

import com.example.carrentalbackend.entity.User;
import com.example.carrentalbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if not exists
        if (!userRepository.existsByEmail("admin@admin.com")) {
            User admin = new User();
            admin.setEmail("admin@admin.com");
            admin.setPassword(passwordEncoder.encode("Admin@123456"));
            admin.setFullName("System Administrator");
            admin.setPhoneNumber("+998900000000");
            admin.setRole(User.Role.ADMIN);
            admin.setCompletedBookings(0);
            admin.setHasLateReturns(false);

            userRepository.save(admin);
            System.out.println("✓ Default admin user created: admin@admin.com / Admin@123456");
        } else {
            System.out.println("✓ Admin user already exists");
        }

        // Create default manager user if not exists
        if (!userRepository.existsByEmail("manager@manager.com")) {
            User manager = new User();
            manager.setEmail("manager@manager.com");
            manager.setPassword(passwordEncoder.encode("Manager@123456"));
            manager.setFullName("System Manager");
            manager.setPhoneNumber("+998900000001");
            manager.setRole(User.Role.MANAGER);
            manager.setCompletedBookings(0);
            manager.setHasLateReturns(false);

            userRepository.save(manager);
            System.out.println("✓ Default manager user created: manager@manager.com / Manager@123456");
        } else {
            System.out.println("✓ Manager user already exists");
        }
    }
}
