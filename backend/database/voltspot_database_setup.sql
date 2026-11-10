-- ====================================================================================
-- EV Charging Station Finder and Slot Booking System
-- Database Setup Script for MySQL 8.0 & MySQL Workbench
-- Project: VoltSpot EV
-- Target Server: MySQL Server 8.0 / Apache Tomcat 9.0.84
-- ====================================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS voltspot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voltspot_db;

-- 2. Drop existing tables in reverse foreign key order (clean setup)
DROP TABLE IF EXISTS station_feedback;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS slot_bookings;
DROP TABLE IF EXISTS station_charging_types;
DROP TABLE IF EXISTS charging_stations;
DROP TABLE IF EXISTS users;

-- ====================================================================================
-- Table 1: USERS (EV Users, Station Operators, and System Administrators)
-- ====================================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role ENUM('USER', 'OPERATOR', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================================
-- Table 2: CHARGING STATIONS (Registered by Operators, Verified by Admin)
-- ====================================================================================
CREATE TABLE charging_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operator_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    opening_time VARCHAR(10) NOT NULL DEFAULT '06:00',
    closing_time VARCHAR(10) NOT NULL DEFAULT '23:00',
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_operator FOREIGN KEY (operator_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_station_city (city),
    INDEX idx_station_status (status),
    INDEX idx_station_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================================
-- Table 3: STATION CHARGING TYPES (Capacity and Pricing for FAST and NORMAL)
-- ====================================================================================
CREATE TABLE station_charging_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    charging_type ENUM('FAST', 'NORMAL') NOT NULL,
    total_capacity INT NOT NULL DEFAULT 4,
    power_kw DECIMAL(6, 2) NOT NULL DEFAULT 50.00,
    price_per_slot DECIMAL(8, 2) NOT NULL,
    CONSTRAINT fk_type_station FOREIGN KEY (station_id) REFERENCES charging_stations (id) ON DELETE CASCADE,
    UNIQUE KEY uk_station_type (station_id, charging_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================================
-- Table 4: SLOT BOOKINGS (EV User Slot Reservations with Real-time Capacity Check)
-- ====================================================================================
CREATE TABLE slot_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    charging_type ENUM('FAST', 'NORMAL') NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'BOOKED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_station FOREIGN KEY (station_id) REFERENCES charging_stations (id) ON DELETE CASCADE,
    INDEX idx_slot_lookup (station_id, charging_type, booking_date, time_slot, status),
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================================
-- Table 5: PAYMENTS (Integrated Payment Tracking)
-- ====================================================================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CARD', 'UPI', 'NET_BANKING', 'WALLET') NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    payment_status ENUM('PAID', 'PENDING', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PAID',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES slot_bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================================
-- Table 6: INVOICES (Generated Tax Invoices with Breakdown)
-- ====================================================================================
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    booking_id INT NOT NULL UNIQUE,
    payment_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    base_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_booking FOREIGN KEY (booking_id) REFERENCES slot_bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================================
-- Table 7: STATION FEEDBACK & RATINGS (1-5 Star Ratings and User Reviews)
-- ====================================================================================
CREATE TABLE station_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_id INT DEFAULT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_station FOREIGN KEY (station_id) REFERENCES charging_stations (id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================================
-- SEED DATA (Default Admin, Operators, EV Users, Stations, Slots, Bookings & Reviews)
-- ====================================================================================

-- 1. Insert Users (Indian EV Network)
INSERT INTO users (id, name, email, password, phone, role, status) VALUES
(1, 'System Administrator (India)', 'admin@voltspot.in', 'admin123', '+91-98000-12345', 'ADMIN', 'ACTIVE'),
(2, 'VoltPower India Operators Pvt Ltd', 'operator@voltspot.in', 'operator123', '+91-98450-67890', 'OPERATOR', 'ACTIVE'),
(3, 'EcoCharge India Network Ltd', 'ecocharge@operator.in', 'operator123', '+91-98220-54321', 'OPERATOR', 'ACTIVE'),
(4, 'EV Driver', 'user@voltspot.in', 'user123', '+91-98765-43210', 'USER', 'ACTIVE'),
(5, 'Priya Sharma', 'priya@example.com', 'user123', '+91-98450-12345', 'USER', 'ACTIVE'),
(6, 'Arun Verma', 'arun@example.com', 'user123', '+91-97110-56789', 'USER', 'ACTIVE');

-- 2. Insert Charging Stations (Top Indian Metropolitan EV Hubs)
INSERT INTO charging_stations (id, operator_id, name, address, city, contact_number, latitude, longitude, opening_time, closing_time, status) VALUES
(1, 2, 'VoltSpot MG Road Supercharger Hub', '45 MG Road, Brigade Junction', 'Bengaluru', '+91-80-4123-5678', 12.97160000, 77.59460000, '06:00', '23:30', 'APPROVED'),
(2, 2, 'VoltSpot Cyber Towers Station', 'Hitec City, Madhapur', 'Hyderabad', '+91-40-6789-1234', 17.45040000, 78.38110000, '00:00', '23:59', 'APPROVED'),
(3, 3, 'VoltSpot BKC Platinum Hub', 'G-Block, Bandra Kurla Complex', 'Mumbai', '+91-22-2654-9876', 19.06570000, 72.86870000, '06:00', '23:00', 'APPROVED'),
(4, 3, 'VoltSpot Connaught Place Central', 'Outer Circle, Block F, Connaught Place', 'Delhi', '+91-11-4321-8765', 28.63150000, 77.21670000, '05:00', '23:00', 'APPROVED'),
(5, 2, 'EcoCharge OMR Tech Corridor Hub', 'Rajiv Gandhi Salai, Thoraipakkam', 'Chennai', '+91-44-2456-7890', 12.93450000, 80.23120000, '06:00', '23:00', 'APPROVED'),
(6, 2, 'EcoCharge Hinjewadi IT Park Hub', 'Phase 1, Near Infosys Circle, Hinjewadi', 'Pune', '+91-20-6677-8899', 18.59130000, 73.73890000, '06:00', '22:00', 'APPROVED'),
(7, 3, 'VoltSpot Whitefield ITPL Hub (Pending Review)', 'ITPL Main Road, Whitefield', 'Bengaluru', '+91-80-2841-9999', 12.98630000, 77.73080000, '07:00', '21:00', 'PENDING');

-- 3. Insert Station Charging Types (Capacity & Indian Rupee ₹ Pricing)
-- Station 1: Bengaluru MG Road
INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) VALUES
(1, 'FAST', 6, 150.00, 280.00),
(1, 'NORMAL', 10, 22.00, 95.00);

-- Station 2: Hyderabad Hitec City
INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) VALUES
(2, 'FAST', 8, 120.00, 260.00),
(2, 'NORMAL', 12, 22.00, 90.00);

-- Station 3: Mumbai BKC
INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) VALUES
(3, 'FAST', 10, 180.00, 320.00),
(3, 'NORMAL', 14, 50.00, 120.00);

-- Station 4: Delhi Connaught Place
INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) VALUES
(4, 'FAST', 6, 150.00, 290.00),
(4, 'NORMAL', 8, 22.00, 95.00);

-- Station 5: Chennai OMR
INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) VALUES
(5, 'FAST', 6, 120.00, 250.00),
(5, 'NORMAL', 8, 22.00, 90.00);

-- Station 6: Pune Hinjewadi
INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) VALUES
(6, 'FAST', 4, 120.00, 240.00),
(6, 'NORMAL', 6, 22.00, 85.00);

-- Station 7: Bengaluru Whitefield (Pending)
INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) VALUES
(7, 'FAST', 4, 60.00, 200.00),
(7, 'NORMAL', 4, 22.00, 80.00);

-- 4. Insert Sample Bookings (Indian EVs & Plates)
INSERT INTO slot_bookings (id, booking_number, user_id, station_id, charging_type, booking_date, time_slot, vehicle_number, vehicle_model, amount, status) VALUES
(1, 'VS-BK-2026-1001', 4, 1, 'FAST', CURDATE(), '10:00 - 11:00', 'KA-01-EV-2024', 'Tata Nexon EV', 280.00, 'COMPLETED'),
(2, 'VS-BK-2026-1002', 4, 1, 'FAST', CURDATE(), '14:00 - 15:00', 'KA-01-EV-2024', 'Tata Nexon EV', 280.00, 'BOOKED'),
(3, 'VS-BK-2026-1003', 5, 2, 'NORMAL', CURDATE(), '11:00 - 12:00', 'TS-09-EV-5544', 'MG ZS EV', 90.00, 'BOOKED'),
(4, 'VS-BK-2026-1004', 6, 3, 'FAST', CURDATE(), '09:00 - 10:00', 'MH-02-EV-7890', 'Mahindra XUV400', 320.00, 'COMPLETED');

-- 5. Insert Sample Payments (INR ₹ with UPI & RuPay)
INSERT INTO payments (id, booking_id, user_id, amount, payment_method, transaction_id, payment_status) VALUES
(1, 1, 4, 330.40, 'UPI', 'TXN-902348102', 'PAID'),
(2, 2, 4, 330.40, 'UPI', 'TXN-902348103', 'PAID'),
(3, 3, 5, 106.20, 'CARD', 'TXN-902348104', 'PAID'),
(4, 4, 6, 377.60, 'NET_BANKING', 'TXN-902348105', 'PAID');

-- 6. Insert Sample Invoices (18% GST = 9% CGST + 9% SGST)
INSERT INTO invoices (id, invoice_number, booking_id, payment_id, user_id, base_amount, tax_amount, total_amount) VALUES
(1, 'INV-2026-0001', 1, 1, 4, 280.00, 50.40, 330.40),
(2, 'INV-2026-0002', 2, 2, 4, 280.00, 50.40, 330.40),
(3, 'INV-2026-0003', 3, 3, 5, 90.00, 16.20, 106.20),
(4, 'INV-2026-0004', 4, 4, 6, 320.00, 57.60, 377.60);

-- 7. Insert Customer Feedback & Ratings
INSERT INTO station_feedback (id, station_id, user_id, booking_id, rating, comments) VALUES
(1, 1, 4, 1, 5, 'Super fast 150kW CCS2 charger! Charged my Tata Nexon EV from 20% to 80% in 28 mins. Great cafe nearby on MG Road.'),
(2, 1, 5, NULL, 4, 'Very clean facility and easy parking slots. Security guards assisted with parking.'),
(3, 2, 5, 3, 5, 'Perfect location near Cyber Towers in Hitec City. UPI payment was instantaneous and seamless slot check-in.'),
(4, 3, 6, 4, 5, 'High-power 180kW charger in BKC Mumbai. Seamless slot reservation and fast billing!');

