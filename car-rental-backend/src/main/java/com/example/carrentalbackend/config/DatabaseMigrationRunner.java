package com.example.carrentalbackend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // Ensure role check constraint supports MANAGER role in existing databases.
        jdbcTemplate.execute("""
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
            """);

        jdbcTemplate.execute("""
            ALTER TABLE users
            ADD CONSTRAINT users_role_check
            CHECK (role IN ('USER', 'MANAGER', 'ADMIN'))
            """);
    }
}
