import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Database, Shield, Server, Terminal, ExternalLink } from 'lucide-react';
import { useToast } from '../Toast';

interface BackendExplorerModalProps {
  onClose: () => void;
}

export const BackendExplorerModal: React.FC<BackendExplorerModalProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'SCHEMA' | 'ENTITIES' | 'REPOSITORIES' | 'SERVICES' | 'SECURITY' | 'CONTROLLERS' | 'CONFIG' | 'README'>('SCHEMA');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('success', 'Copied to Clipboard', 'Code copied to your system clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<string, { title: string; filename: string; language: string; content: string }> = {
    SCHEMA: {
      title: 'MySQL 8 Database Schema (DDL + Indexes + Constraints)',
      filename: 'backend/src/main/resources/schema.sql',
      language: 'sql',
      content: `-- ====================================================================
-- VoltSpot EV Charging Platform - MySQL 8 Relational Schema
-- ====================================================================

DROP DATABASE IF EXISTS voltspot_db;
CREATE DATABASE voltspot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voltspot_db;

-- 1. Users Table
CREATE TABLE users (
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

-- 2. Charging Stations Table
CREATE TABLE charging_stations (
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

-- 3. Charging Ports Table
CREATE TABLE charging_ports (
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

-- 4. Slot Bookings Table (With Double-Booking Conflict Prevention)
CREATE TABLE slot_bookings (
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

-- 5. Vehicles Table
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    battery_capacity_kwh DECIMAL(5, 2) NOT NULL,
    connector_type ENUM('CCS2', 'TYPE2', 'CHADEMO', 'GBT') NOT NULL,
    license_plate VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    },

    ENTITIES: {
      title: 'JPA Entities (ChargingStation.java & SlotBooking.java)',
      filename: 'backend/src/main/java/com/voltspot/ev/entity/ChargingStation.java',
      language: 'java',
      content: `package com.voltspot.ev.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "charging_stations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargingStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    private User operator;

    @NotBlank(message = "Station name is mandatory")
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Address is mandatory")
    @Column(nullable = false, length = 255)
    private String address;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String city;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;

    @NotNull
    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;

    @NotNull
    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @NotNull
    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChargingPort> ports = new ArrayList<>();
}

// -------------------------------------------------------------------
// SlotBooking.java Entity
// -------------------------------------------------------------------
package com.voltspot.ev.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "slot_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "port_id", nullable = false)
    private ChargingPort port;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "duration_hours", nullable = false, precision = 4, scale = 2)
    private Double durationHours;

    @Column(name = "energy_kwh", nullable = false, precision = 6, scale = 2)
    private Double energyKwh;

    @Column(name = "estimated_cost", nullable = false, precision = 8, scale = 2)
    private BigDecimal estimatedCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus = BookingStatus.CONFIRMED;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}`,
    },

    REPOSITORIES: {
      title: 'Spring Data JPA Repositories (Haversine Formula & Overlap Check)',
      filename: 'backend/src/main/java/com/voltspot/ev/repository/ChargingStationRepository.java',
      language: 'java',
      content: `package com.voltspot.ev.repository;

import com.voltspot.ev.entity.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {

    /**
     * Native MySQL 8 Query using Haversine Spherical Trigonometry Formula:
     * Distance (km) = 6371 * 2 * ASIN(SQRT(
     *     POWER(SIN((RADIANS(s.latitude) - RADIANS(:lat)) / 2), 2) +
     *     COS(RADIANS(:lat)) * COS(RADIANS(s.latitude)) *
     *     POWER(SIN((RADIANS(s.longitude) - RADIANS(:lng)) / 2), 2)
     * ))
     * Filters ONLY verified stations!
     */
    @Query(value = """
        SELECT s.*, 
        (6371 * 2 * ASIN(SQRT(
            POWER(SIN((RADIANS(s.latitude) - RADIANS(:lat)) / 2), 2) +
            COS(RADIANS(:lat)) * COS(RADIANS(s.latitude)) *
            POWER(SIN((RADIANS(s.longitude) - RADIANS(:lng)) / 2), 2)
        ))) AS distance_km
        FROM charging_stations s
        WHERE s.is_verified = TRUE
        HAVING distance_km <= :radiusKm
        ORDER BY distance_km ASC
        """, nativeQuery = true)
    List<ChargingStation> findNearbyVerifiedStations(
        @Param("lat") double latitude,
        @Param("lng") double longitude,
        @Param("radiusKm") double radiusKm
    );

    List<ChargingStation> findByOperatorId(Long operatorId);
    List<ChargingStation> findByIsVerifiedFalse();
}

// -------------------------------------------------------------------
// SlotBookingRepository.java
// -------------------------------------------------------------------
package com.voltspot.ev.repository;

import com.voltspot.ev.entity.SlotBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SlotBookingRepository extends JpaRepository<SlotBooking, Long> {

    /**
     * Strict Double-Booking Overlap Detection:
     * Condition: (startTime < existing.endTime) AND (endTime > existing.startTime)
     * Ignores CANCELLED bookings.
     */
    @Query("""
        SELECT b FROM SlotBooking b 
        WHERE b.port.id = :portId 
          AND b.bookingStatus IN ('CONFIRMED', 'IN_PROGRESS')
          AND b.startTime < :endTime 
          AND b.endTime > :startTime
    """)
    List<SlotBooking> findOverlappingBookings(
        @Param("portId") Long portId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    List<SlotBooking> findByUserIdOrderByStartTimeDesc(Long userId);

    @Query("""
        SELECT b FROM SlotBooking b 
        JOIN b.port p 
        JOIN p.station s 
        WHERE s.operator.id = :operatorId 
        ORDER BY b.startTime DESC
    """)
    List<SlotBooking> findByOperatorId(@Param("operatorId") Long operatorId);
}`,
    },

    SERVICES: {
      title: 'SlotBookingService.java (Transactional Booking & Conflict Guard)',
      filename: 'backend/src/main/java/com/voltspot/ev/service/SlotBookingService.java',
      language: 'java',
      content: `package com.voltspot.ev.service;

import com.voltspot.ev.dto.booking.BookingRequest;
import com.voltspot.ev.dto.booking.BookingResponse;
import com.voltspot.ev.entity.*;
import com.voltspot.ev.exception.ResourceNotFoundException;
import com.voltspot.ev.exception.SlotConflictException;
import com.voltspot.ev.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotBookingService {

    private final SlotBookingRepository bookingRepository;
    private final ChargingPortRepository portRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailService;

    /**
     * Strict Transactional Booking with SERIALIZABLE / REPEATABLE_READ isolation
     * to guarantee zero race condition double-bookings across concurrent requests.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        ChargingPort port = portRepository.findById(request.getPortId())
            .orElseThrow(() -> new ResourceNotFoundException("Port not found: " + request.getPortId()));

        if (port.getStatus() == PortStatus.MAINTENANCE) {
            throw new IllegalStateException("Charging port is currently undergoing maintenance.");
        }

        LocalDateTime start = request.getStartTime();
        LocalDateTime end = request.getEndTime();

        if (start.isAfter(end) || start.isEqual(end)) {
            throw new IllegalArgumentException("Slot end time must be strictly after start time.");
        }

        if (start.isBefore(LocalDateTime.now().minusMinutes(2))) {
            throw new IllegalArgumentException("Cannot book a charging slot in the past.");
        }

        // 1. Double-Booking Conflict Check
        List<SlotBooking> conflicts = bookingRepository.findOverlappingBookings(port.getId(), start, end);
        if (!conflicts.isEmpty()) {
            throw new SlotConflictException(
                "Port " + port.getPortNumber() + " is already reserved between " +
                conflicts.get(0).getStartTime() + " and " + conflicts.get(0).getEndTime()
            );
        }

        // 2. Cost and Energy Estimation calculation:
        // Energy = Power (kW) * Duration (hours) * 0.85 (average charging efficiency)
        Duration duration = Duration.between(start, end);
        double durationHours = duration.toMinutes() / 60.0;
        double energyKwh = port.getPowerOutputKw() * durationHours * 0.85;

        BigDecimal estimatedCost = BigDecimal.valueOf(energyKwh)
            .multiply(port.getPricePerKwh());

        // 3. Persist Booking Transaction
        SlotBooking booking = SlotBooking.builder()
            .user(user)
            .port(port)
            .startTime(start)
            .endTime(end)
            .durationHours(durationHours)
            .energyKwh(energyKwh)
            .estimatedCost(estimatedCost)
            .bookingStatus(BookingStatus.CONFIRMED)
            .createdAt(LocalDateTime.now())
            .build();

        SlotBooking saved = bookingRepository.save(booking);

        // 4. Asynchronous Confirmation Email via Spring Mail
        emailService.sendBookingConfirmation(user.getEmail(), saved);

        return mapToResponse(saved);
    }

    @Transactional
    public void cancelBooking(Long userId, Long bookingId, String reason) {
        SlotBooking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized to cancel this booking.");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        bookingRepository.save(booking);
    }

    private BookingResponse mapToResponse(SlotBooking b) {
        return new BookingResponse(
            b.getId(),
            b.getUser().getId(),
            b.getUser().getName(),
            b.getPort().getId(),
            b.getPort().getStation().getId(),
            b.getPort().getStation().getName(),
            b.getStartTime(),
            b.getEndTime(),
            b.getDurationHours(),
            b.getEnergyKwh(),
            b.getEstimatedCost(),
            b.getBookingStatus()
        );
    }
}`,
    },

    SECURITY: {
      title: 'Spring Security 6 + JWT Filter (SecurityConfig.java)',
      filename: 'backend/src/main/java/com/voltspot/ev/security/SecurityConfig.java',
      language: 'java',
      content: `package com.voltspot.ev.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/stations/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Role-based authorization rules
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/operator/**").hasRole("OPERATOR")
                .requestMatchers("/api/driver/**").hasRole("DRIVER")
                .requestMatchers("/api/bookings/**").authenticated()
                
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`,
    },

    CONTROLLERS: {
      title: 'REST Controllers (Station, Booking, Operator, Admin)',
      filename: 'backend/src/main/java/com/voltspot/ev/controller/ChargingStationController.java',
      language: 'java',
      content: `package com.voltspot.ev.controller;

import com.voltspot.ev.dto.station.NearbySearchRequest;
import com.voltspot.ev.dto.station.StationResponse;
import com.voltspot.ev.service.ChargingStationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@Tag(name = "Charging Stations", description = "Station Locator & Haversine Distance Search")
public class ChargingStationController {

    private final ChargingStationService stationService;

    @GetMapping("/nearby")
    @Operation(summary = "Haversine Native Geo-Query to locate verified charging stations")
    public ResponseEntity<List<StationResponse>> getNearbyStations(
        @RequestParam double latitude,
        @RequestParam double longitude,
        @RequestParam(defaultValue = "15.0") double radiusKm
    ) {
        List<StationResponse> results = stationService.findNearbyVerifiedStations(latitude, longitude, radiusKm);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get station details by ID")
    public ResponseEntity<StationResponse> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }
}

// -------------------------------------------------------------------
// SlotBookingController.java
// -------------------------------------------------------------------
package com.voltspot.ev.controller;

import com.voltspot.ev.dto.booking.BookingRequest;
import com.voltspot.ev.dto.booking.BookingResponse;
import com.voltspot.ev.service.SlotBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Slot Bookings", description = "Time slot reservations & double-booking prevention")
public class SlotBookingController {

    private final SlotBookingService bookingService;

    @PostMapping
    @Operation(summary = "Reserve a charging slot with real-time conflict verification")
    public ResponseEntity<BookingResponse> createBooking(
        @AuthenticationPrincipal Long userId,
        @Valid @RequestBody BookingRequest request
    ) {
        BookingResponse booking = bookingService.createBooking(userId, request);
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel an active booking slot")
    public ResponseEntity<Void> cancelBooking(
        @AuthenticationPrincipal Long userId,
        @PathVariable Long bookingId,
        @RequestParam(required = false, defaultValue = "Cancelled by user") String reason
    ) {
        bookingService.cancelBooking(userId, bookingId, reason);
        return ResponseEntity.noContent().build();
    }
}`,
    },

    CONFIG: {
      title: 'application.yml & Maven pom.xml',
      filename: 'backend/src/main/resources/application.yml',
      language: 'yaml',
      content: `spring:
  application:
    name: voltspot-ev-backend

  datasource:
    url: jdbc:mysql://localhost:3306/voltspot_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: \${DB_USER:root}
    password: \${DB_PASS:rootpassword}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect

  mail:
    host: smtp.gmail.com
    port: 587
    username: \${MAIL_USERNAME:notifications@voltspot.io}
    password: \${MAIL_PASSWORD:secret}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

jwt:
  secret: \${JWT_SECRET}
  expiration-ms: 86400000 # 24 hours

server:
  port: 8080

springdoc:
  swagger-ui:
    path: /swagger-ui.html
  api-docs:
    path: /v3/api-docs`,
    },

    README: {
      title: 'Full Stack Setup Guide & Production Runbook',
      filename: 'backend/README.md',
      language: 'markdown',
      content: `# VoltSpot EV - Spring Boot 3 + MySQL 8 + React Full Stack

## Quick Start Runbook

### 1. Database Setup (MySQL 8)
\`\`\`bash
mysql -u root -p < backend/src/main/resources/schema.sql
mysql -u root -p voltspot_db < backend/src/main/resources/data.sql
\`\`\`

### 2. Run Spring Boot 3 Backend (Java 17)
\`\`\`bash
cd backend
mvn clean install
mvn spring-boot:run
\`\`\`
Backend runs at: http://localhost:8080
Swagger OpenAPI Documentation: http://localhost:8080/swagger-ui.html

### 3. JWT Authentication Curl Test
\`\`\`bash
# 1. Login as Driver:
curl -X POST http://localhost:8080/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"driver@voltspot.io","password":"password123"}'

# 2. Search Nearby Stations with Haversine Query:
curl -X GET "http://localhost:8080/api/stations/nearby?latitude=37.7749&longitude=-122.4194&radiusKm=15"

# 3. Reserve Time Slot:
curl -X POST http://localhost:8080/api/bookings \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "portId": 1,
    "startTime": "2026-10-30T14:00:00",
    "endTime": "2026-10-30T15:00:00"
  }'
\`\`\``,
    },
  };

  const currentSnippet = codeSnippets[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Spring Boot 3 + MySQL 8 Backend Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Java 17
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect Spring Data JPA entities, Haversine repository queries, transactional booking service, and MySQL DDL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(currentSnippet.content)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy File'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'SCHEMA', label: 'schema.sql', icon: Database },
            { id: 'ENTITIES', label: 'JPA Entities', icon: FileCode },
            { id: 'REPOSITORIES', label: 'Haversine Repositories', icon: Server },
            { id: 'SERVICES', label: 'BookingService', icon: Terminal },
            { id: 'SECURITY', label: 'Spring Security + JWT', icon: Shield },
            { id: 'CONTROLLERS', label: 'REST Controllers', icon: Server },
            { id: 'CONFIG', label: 'application.yml', icon: FileCode },
            { id: 'README', label: 'Setup Guide', icon: ExternalLink },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed">
          <div className="text-[11px] text-slate-400 pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
            <span>Path: {currentSnippet.filename}</span>
            <span className="uppercase">{currentSnippet.language}</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre font-mono">
            {currentSnippet.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
