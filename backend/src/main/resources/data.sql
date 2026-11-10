-- ====================================================================
-- VoltSpot EV Charging Platform - MySQL 8 Initial Seed Data
-- ====================================================================

-- 1. Insert Initial Users (Driver, Operator, Admin, Pending Operator)
-- Passwords hashed via BCrypt for 'password123': $2a$10$wO0I7JqXzZ6C/hUo1L0MueJ7/7D...
INSERT INTO users (id, name, email, password, phone, role, is_approved_operator) VALUES
(1, 'Alex Rivera', 'driver@voltspot.io', '$2a$10$e8R17z1u/1zFkO0sI4H5uODW5Z6Bv3Fp.7r9F1J2m5o6v7a8b9c0d', '+1 (555) 234-5678', 'DRIVER', TRUE),
(2, 'Marcus Vance', 'operator@voltspot.io', '$2a$10$e8R17z1u/1zFkO0sI4H5uODW5Z6Bv3Fp.7r9F1J2m5o6v7a8b9c0d', '+1 (555) 876-5432', 'OPERATOR', TRUE),
(3, 'Sarah Chen', 'admin@voltspot.io', '$2a$10$e8R17z1u/1zFkO0sI4H5uODW5Z6Bv3Fp.7r9F1J2m5o6v7a8b9c0d', '+1 (555) 999-0000', 'ADMIN', TRUE),
(4, 'Elena Rostova', 'elena@greencharge.com', '$2a$10$e8R17z1u/1zFkO0sI4H5uODW5Z6Bv3Fp.7r9F1J2m5o6v7a8b9c0d', '+1 (555) 345-6789', 'OPERATOR', FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Stations
INSERT INTO charging_stations (id, operator_id, name, address, city, latitude, longitude, opening_time, closing_time, is_verified) VALUES
(1, 2, 'VoltSpot UltraHub - Downtown Financial District', '450 Mission St', 'San Francisco', 37.79050000, -122.39950000, '00:00:00', '23:59:00', TRUE),
(2, 2, 'GreenMotion Plaza Charging Hub', '888 Brannan St', 'San Francisco', 37.77120000, -122.40480000, '06:00:00', '23:00:00', TRUE),
(3, 2, 'Presidio EcoCharge Gateway', '103 Montgomery St', 'San Francisco', 37.79890000, -122.45560000, '07:00:00', '21:00:00', TRUE),
(4, 4, 'Sunset District FastCharge Express', '1900 Irving St', 'San Francisco', 37.76340000, -122.47890000, '06:00:00', '22:00:00', FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Ports
INSERT INTO charging_ports (id, station_id, port_number, connector_type, power_output_kw, price_per_kwh, status) VALUES
(1, 1, 'Port A1', 'CCS2', 350.00, 0.42, 'AVAILABLE'),
(2, 1, 'Port A2', 'CCS2', 150.00, 0.38, 'AVAILABLE'),
(3, 1, 'Port B1', 'CHADEMO', 50.00, 0.32, 'AVAILABLE'),
(4, 1, 'Port B2', 'TYPE2', 22.00, 0.25, 'AVAILABLE'),
(5, 2, 'Dispenser 1', 'CCS2', 150.00, 0.36, 'AVAILABLE'),
(6, 2, 'Dispenser 2', 'CCS2', 150.00, 0.36, 'IN_USE'),
(7, 2, 'Dispenser 3', 'TYPE2', 22.00, 0.24, 'AVAILABLE'),
(8, 3, 'Solar Stall 1', 'CCS2', 100.00, 0.34, 'AVAILABLE'),
(9, 3, 'Solar Stall 2', 'TYPE2', 22.00, 0.22, 'MAINTENANCE'),
(10, 4, 'Bay 1', 'CCS2', 120.00, 0.33, 'AVAILABLE')
ON DUPLICATE KEY UPDATE port_number=VALUES(port_number);

-- 4. Insert Vehicles for Driver Alex
INSERT INTO vehicles (id, user_id, make, model, battery_capacity_kwh, connector_type, license_plate) VALUES
(1, 1, 'Hyundai', 'Ioniq 5 AWD', 77.40, 'CCS2', 'EV-892-CA'),
(2, 1, 'Tesla', 'Model Y Long Range', 75.00, 'CCS2', 'VOLT-770')
ON DUPLICATE KEY UPDATE model=VALUES(model);

-- 5. Insert Sample Bookings
INSERT INTO slot_bookings (id, user_id, port_id, start_time, end_time, duration_hours, energy_kwh, estimated_cost, booking_status) VALUES
(1, 1, 6, '2026-10-30 14:00:00', '2026-10-30 15:00:00', 1.00, 55.00, 19.80, 'CONFIRMED'),
(2, 1, 1, '2026-10-30 16:30:00', '2026-10-30 17:15:00', 0.75, 45.00, 18.90, 'CONFIRMED')
ON DUPLICATE KEY UPDATE booking_status=VALUES(booking_status);
