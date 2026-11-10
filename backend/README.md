# EV Charging Station Finder and Slot Booking System (VoltSpot EV)

A centralized enterprise web application for electric vehicle (EV) charging station discovery, real-time slot reservation, conflict prevention, payment authorization, tax invoice generation, and multi-role operations.

---

## 🛠 Technology Stack

- **Language:** Java (JDK 23.0.1 / compatible with JDK 17-25)
- **Frontend:** JSP (JavaServer Pages), HTML5, CSS3, JavaScript, Bootstrap 5.3, Leaflet.js
- **Backend:** Java Servlets (Java EE 8 / Servlet 4.0) + Pure JDBC (`java.sql.*`)
- **Database:** MySQL Server 8.0 (InnoDB, UTF-8mb4, relational integrity)
- **Database Tool:** MySQL Workbench 8.0
- **IDE:** Apache NetBeans IDE 24
- **Web & Application Server:** Apache Tomcat 9.0.84

---

## 📦 Project Architecture & Directory Structure

```text
backend/
├── pom.xml                                 <-- Standard Maven Webapp (WAR packaging) for NetBeans 24
├── README.md                               <-- Setup & execution guide
├── database/
│   └── voltspot_database_setup.sql         <-- Full DDL + Seed Data for MySQL Workbench
└── src/
    └── main/
        ├── java/com/voltspot/
        │   ├── dao/                        <-- JDBC Data Access Objects
        │   │   ├── BookingDAO.java         <-- Real-time slot availability check & overbooking prevention
        │   │   ├── ChargingTypeDAO.java    <-- FAST & NORMAL capacity and pricing
        │   │   ├── FeedbackDAO.java        <-- 1-5 star ratings & reviews
        │   │   ├── InvoiceDAO.java         <-- Tax invoice data retrieval & formatting
        │   │   ├── PaymentDAO.java         <-- Transactional payment processing & invoice generation
        │   │   ├── ReportDAO.java          <-- Analytics, station utilization, revenue breakdown
        │   │   ├── StationDAO.java         <-- Station search, nearby Haversine query, approval filters
        │   │   └── UserDAO.java            <-- Authentication, registration, and status management
        │   ├── filter/
        │   │   └── AuthenticationFilter.java <-- Role-based access control (User, Operator, Admin)
        │   ├── model/                      <-- JavaBean domain models
        │   │   ├── ChargingStation.java
        │   │   ├── Feedback.java
        │   │   ├── Invoice.java
        │   │   ├── Payment.java
        │   │   ├── SlotBooking.java
        │   │   ├── StationChargingType.java
        │   │   └── User.java
        │   ├── servlet/
        │   │   ├── admin/                  <-- Administrator module servlets
        │   │   │   ├── AdminBookingServlet.java
        │   │   │   ├── AdminDashboardServlet.java
        │   │   │   ├── AdminFeedbackServlet.java
        │   │   │   ├── AdminPaymentServlet.java
        │   │   │   ├── AdminReportServlet.java
        │   │   │   ├── AdminStationServlet.java
        │   │   │   └── AdminUserServlet.java
        │   │   ├── operator/               <-- Station Operator module servlets
        │   │   │   ├── OperatorBookingServlet.java
        │   │   │   ├── OperatorDashboardServlet.java
        │   │   │   ├── OperatorFeedbackServlet.java
        │   │   │   └── OperatorStationServlet.java
        │   │   ├── user/                   <-- EV Driver module servlets
        │   │   │   ├── BookingServlet.java
        │   │   │   ├── FeedbackServlet.java
        │   │   │   ├── InvoiceServlet.java
        │   │   │   ├── PaymentServlet.java
        │   │   │   ├── SlotAvailabilityServlet.java
        │   │   │   └── StationServlet.java
        │   │   ├── AuthServlet.java
        │   │   └── HomeServlet.java
        │   └── util/
        │       ├── DBConnection.java       <-- Robust JDBC connection manager with credential fallbacks
        │       ├── GeoUtil.java            <-- Haversine formula calculation for GPS proximity
        │       └── PasswordUtil.java       <-- SHA-256 password hashing & verification
        ├── resources/
        │   ├── database.sql                <-- Embedded database script copy
        │   └── db.properties               <-- Database URL, credentials configuration
        └── webapp/
            ├── WEB-INF/
            │   └── web.xml                 <-- Servlet 4.0 Deployment Descriptor
            ├── css/
            │   └── custom.css              <-- Modern EV theme, slot grid & print styling
            ├── js/
            │   ├── app.js                  <-- AJAX live slot checking & payment switcher
            │   └── map.js                  <-- Leaflet interactive map & GPS coordinate picker
            ├── includes/
            │   ├── header.jsp              <-- Global navbar with dynamic role controls
            │   ├── footer.jsp              <-- Global footer
            │   └── messages.jsp            <-- Success, error, and info alert toasts
            ├── index.jsp                   <-- Landing page with search & stats
            ├── login.jsp                   <-- Unified login with 1-click demo buttons
            ├── register.jsp                <-- EV User & Operator registration
            ├── stations.jsp                <-- Search stations, GPS proximity & map view
            ├── station-details.jsp         <-- Station info, live slot grid & booking form
            ├── my-bookings.jsp             <-- Driver reservations, invoices, cancel actions
            ├── payment.jsp                 <-- Integrated payment gateway simulation
            ├── payment-success.jsp         <-- Confirmation with booking & invoice links
            ├── invoice.jsp                 <-- Official printable Tax Invoice with breakdown
            ├── operator/
            │   ├── dashboard.jsp           <-- Operator metrics, quick actions, revenue
            │   ├── stations.jsp            <-- Operator station list with approval badges
            │   ├── add-station.jsp         <-- Register station with map picker & slot pricing
            │   ├── edit-station.jsp        <-- Edit station specs & capacities
            │   ├── bookings.jsp            <-- Customer bookings manager (update statuses)
            │   └── feedback.jsp            <-- Customer reviews for operator's stations
            └── admin/
                ├── dashboard.jsp           <-- Admin KPI metrics, pending approvals queue
                ├── pending-stations.jsp    <-- Approve / Reject station workflow with reasons
                ├── stations.jsp            <-- Manage all stations across network
                ├── users.jsp               <-- Manage EV Drivers, Operators, Admins
                ├── bookings.jsp            <-- System-wide bookings log
                ├── payments.jsp            <-- Payment ledger & financial breakdown
                ├── feedback.jsp            <-- Reviews moderation & deletion
                └── reports.jsp             <-- Utilization & revenue reports with print/export
```

---

## 🚀 Step-by-Step Setup Instructions

### 1. Database Setup in MySQL Workbench 8.0

1. Launch **MySQL Workbench 8.0** and connect to your local MySQL Server instance (port `3306`).
2. Open the SQL script:
   - `backend/database/voltspot_database_setup.sql` (or `backend/src/main/resources/database.sql`)
3. Click the **Execute (Lightning Bolt)** icon.
4. This will:
   - Create the `voltspot_db` database.
   - Create all 7 relational tables (`users`, `charging_stations`, `station_charging_types`, `slot_bookings`, `payments`, `invoices`, `station_feedback`).
   - Populate pre-configured seed data (Default Admin, Operators, EV Users, Charging Stations, Capacities, Sample Bookings, Payments, Invoices, and Ratings).
5. Verify `backend/src/main/resources/db.properties` matches your MySQL root password:
   ```properties
   db.driver=com.mysql.cj.jdbc.Driver
   db.url=jdbc:mysql://localhost:3306/voltspot_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
   db.username=root
   db.password=root
   ```
   *(Note: `DBConnection.java` also automatically tries common local passwords like `root`, `password`, `admin`, `123456`, and empty `""` if authentication fails).*

---

### 2. Opening & Running in Apache NetBeans IDE 24

1. Open **Apache NetBeans IDE 24**.
2. Click **File** > **Open Project...**
3. Navigate to and select the `backend` folder.
   *(NetBeans automatically detects the Maven Web Application icon).*
4. Click **Open Project**.
5. Ensure **Apache Tomcat 9.0.84** is registered in NetBeans:
   - Go to **Tools** > **Servers** in NetBeans.
   - If Tomcat is not listed, click **Add Server**, choose **Apache Tomcat or TomEE**, click **Next**, and browse to your Tomcat 9.0.84 installation directory. Enter your Tomcat manager username and password if prompted, then click **Finish**.
6. Set Tomcat as the server for the project:
   - Right-click the `voltspot-ev-booking` project > **Properties**.
   - Select **Run** on the left panel.
   - Set **Server** to `Apache Tomcat 9.0.84`.
   - Set **Context Path** to `/voltspot-ev-booking` (or leave default `/`).
   - Click **OK**.
7. Run the application:
   - Right-click the project > **Run** (or press `F6`).
   - NetBeans compiles the Java Servlets, packages the WAR file, deploys to Apache Tomcat 9, and opens your browser at:
     ```text
     http://localhost:8080/voltspot-ev-booking/
     ```

---

### 3. Deploying Directly to Apache Tomcat 9 (Standalone WAR)

If running Tomcat externally without NetBeans:
1. Build the WAR file:
   ```bash
   mvn clean package
   ```
2. Copy `target/voltspot-ev-booking.war` into the Tomcat `webapps/` folder:
   ```bash
   copy target\voltspot-ev-booking.war "C:\apache-tomcat-9.0.84\webapps\"
   ```
3. Start Tomcat (`bin/startup.bat` on Windows).
4. Access the web app at `http://localhost:8080/voltspot-ev-booking/`.

---

## 🔑 Default Accounts & Credentials

The database is pre-seeded with three demo roles for testing and evaluation:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@voltspot.in` | `admin123` | Full administrative control: Station approvals/rejections, user management, bookings, payments ledger, feedback moderation, system reports. |
| **Station Operator** | `operator@voltspot.in` | `operator123` | Operator Portal: Register stations, configure FAST & NORMAL capacities and slot prices, view customer bookings, update statuses (`Pending` &rarr; `Booked` &rarr; `Completed`/`Cancelled`), monitor feedback. |
| **EV User / Driver** | `user@voltspot.in` | `user123` | Driver Portal: Discover stations by city or GPS distance, check live slot availability, reserve slot, simulate payment, view/download tax invoice, submit ratings. |

*(Note: The login page includes convenient **One-Click Demo Login** buttons that fill these credentials instantly).*

---

## 🌟 Key Modules & Core Features Implemented

### 1. EV User (Driver) Module
- **Registration & Authentication:** Sign up as EV Driver, login with session tracking.
- **Station Search & Filtering:** Filter by City, location keywords, and Charging Type (FAST / NORMAL).
- **Nearby Stations via GPS:** Browser Geolocation + Haversine formula calculates exact great-circle distance in kilometers and sorts nearest hubs first.
- **Interactive Leaflet Map:** Visual green EV pins, click to inspect rates, operating hours, and jump directly to slot booking.
- **Dual Charging Infrastructure:**
  - **FAST (DC):** High-power chargers (e.g. 150 kW) with slot rates and port capacity.
  - **NORMAL (AC):** Level-2 chargers (e.g. 22 kW) with slot rates and port capacity.
- **Real-Time Slot Availability Validation:**
  - Real-time AJAX endpoint (`/check-slot-availability`) queries existing reservations against `total_capacity` for that station, date, charging type, and slot.
  - Interactive grid visually disables full slots (`Fully Booked`) and highlights available slots (`X Left`).
  - Server-side double-check during booking creation guarantees **zero overbooking**.
- **Booking Lifecycle Management:** Tracks reservations through `Pending` &rarr; `Booked` &rarr; `Completed` or `Cancelled`.
- **Integrated Payment Simulator:** Supports Card (with realistic fields), UPI (with QR code simulation), Net Banking, and Digital Wallets with instantaneous transaction ID generation.
- **Automated Tax Invoice Generation:**
  - Auto-generated upon payment with unique reference (`INV-2026-XXXX`).
  - 18% GST/tax itemized breakdown, customer details, station info, and transaction ID.
  - Dedicated print-optimized layout with **Print / Download PDF** button (`window.print()`).
- **Station Ratings & Reviews:** EV users can submit 1 to 5 star ratings and written reviews, which dynamically update the station's average rating.

### 2. Charging Station Operator Module
- **Operator Registration & Authentication:** Dedicated sign-up role for hub owners.
- **Station Registration:** Register new stations with address, city, contact phone, operating hours, and an **interactive Leaflet map coordinate picker** to click and pin exact latitude/longitude.
- **Capacity & Pricing Definition:** Configure FAST and NORMAL slot capacities (number of ports), power output in kW, and price per 1-hour slot.
- **Mandatory Admin Approval Workflow:** Newly registered stations are automatically marked `PENDING` and hidden from public search until reviewed and approved by the Administrator.
- **Customer Bookings Management:** View all incoming reservations across the operator's stations, with actions to transition booking status (`Pending` &rarr; `Booked` &rarr; `Completed` / `Cancelled`).
- **Customer Ratings Viewer:** View driver reviews and star ratings received across their stations.

### 3. Administrator Module
- **Admin Control Dashboard:** Real-time KPI metric counters for total users, operators, approved stations, pending stations, bookings, and gross platform revenue.
- **Station Approval Queue:** Review pending operator submissions, inspect coordinates, capacities, and pricing, with one-click **Approve & Publish** or **Reject with Reason**.
- **Station Network Management:** View all stations across operators, toggle statuses, and permanently delete non-compliant facilities.
- **User Account Management:** View all registered drivers, operators, and admins; toggle account status (`Active` / `Inactive`) to restrict bad actors.
- **Platform-Wide Bookings Log:** Master audit log of all reservations across all stations with status filters and overrides.
- **Payments & Financial Ledger:** Track all completed transactions, revenue totals, and payment method breakdowns (Card, UPI, Net Banking, Wallet).
- **Feedback Moderation:** Moderate user reviews, inspect sentiment, and delete offensive comments.
- **Reports & Analytics Generator:** Generate printable/exportable utilization reports, ranking popular stations by booking volume, average rating, and revenue billed.

---

## 🗄 Relational Database Schema (MySQL)

1. `users`: Stores user accounts, hashed credentials, roles (`USER`, `OPERATOR`, `ADMIN`), and status (`ACTIVE`, `INACTIVE`).
2. `charging_stations`: Physical charging facilities with operator foreign key, name, address, city, contact, latitude, longitude, hours, and status (`PENDING`, `APPROVED`, `REJECTED`).
3. `station_charging_types`: Charging configuration per station for `FAST` and `NORMAL`, defining port capacities, power in kW, and slot pricing.
4. `slot_bookings`: 1-hour slot reservations linking user, station, charging type, date, time slot, vehicle details, and status (`PENDING`, `BOOKED`, `COMPLETED`, `CANCELLED`).
5. `payments`: Payment records linking booking and user, storing transaction ID, payment method (`CARD`, `UPI`, `NET_BANKING`, `WALLET`), amount, and status (`PAID`).
6. `invoices`: Tax invoices linking booking, payment, and user, itemizing base amount, 18% tax, and total amount.
7. `station_feedback`: Ratings (1-5 stars) and user comments linked to charging stations and drivers.
