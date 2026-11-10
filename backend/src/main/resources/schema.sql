-- ====================================================================
-- VoltSpot EV Charging Platform - MySQL 8 Relational Schema
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role ENUM('DRIVER', 'OPERATOR', 'ADMIN') NOT NULL DEFAULT 'DRIVER',
    is_approved_operator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS charging_stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operator_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    opening_time TIME NOT NULL DEFAULT '06:00:00',
    closing_time TIME NOT NULL DEFAULT '23:00:00',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_operator FOREIGN KEY (operator_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_station_coords (latitude, longitude),
    INDEX idx_station_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS charging_ports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    port_number VARCHAR(50) NOT NULL,
    connector_type ENUM('CCS2', 'TYPE2', 'CHADEMO', 'GBT') NOT NULL,
    power_output_kw DECIMAL(6, 2) NOT NULL,
    price_per_kwh DECIMAL(6, 2) NOT NULL,
    status ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT fk_port_station FOREIGN KEY (station_id) REFERENCES charging_stations (id) ON DELETE CASCADE,
    INDEX idx_port_status (status),
    INDEX idx_port_connector (connector_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS slot_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    port_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL,
    energy_kwh DECIMAL(6, 2) NOT NULL,
    estimated_cost DECIMAL(8, 2) NOT NULL,
    booking_status ENUM('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    cancellation_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_port FOREIGN KEY (port_id) REFERENCES charging_ports (id) ON DELETE CASCADE,
    INDEX idx_booking_time_conflict (port_id, start_time, end_time, booking_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    battery_capacity_kwh DECIMAL(5, 2) NOT NULL,
    connector_type ENUM('CCS2', 'TYPE2', 'CHADEMO', 'GBT') NOT NULL,
    license_plate VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
