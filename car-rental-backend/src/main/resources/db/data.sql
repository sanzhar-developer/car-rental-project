-- Sample data for testing

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Sedan', 'Comfortable sedans for city driving'),
('SUV', 'Spacious SUVs for family trips'),
('Sports', 'High-performance sports cars'),
('Economy', 'Budget-friendly economy cars');

-- Insert Admin User (password: admin123)
INSERT INTO users (email, password, full_name, phone_number, role, completed_bookings, has_late_returns, created_at) VALUES
('admin@example.com', '$2a$10$xqZ8jK9X8Y9Z8Y9Z8Y9Z8O', 'Admin User', '+998901234567', 'ADMIN', 0, false, NOW());

-- Insert Sample Cars
INSERT INTO cars (brand, model, year, license_plate, price_per_day, original_price, status, consecutive_bookings, is_popular, category_id) VALUES
('Toyota', 'Camry', 2023, '01A123BC', 50.00, 50.00, 'AVAILABLE', 0, false, 1),
('Honda', 'CR-V', 2023, '01B456DE', 70.00, 70.00, 'AVAILABLE', 0, false, 2),
('BMW', 'M3', 2024, '01C789FG', 150.00, 150.00, 'AVAILABLE', 0, false, 3),
('Chevrolet', 'Spark', 2022, '01D012HI', 30.00, 30.00, 'AVAILABLE', 0, false, 4);
