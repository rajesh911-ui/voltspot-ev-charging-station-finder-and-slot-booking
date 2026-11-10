# VoltSpot EV - Charging Station Finder and Slot Booking System

A complete web-based application built with **Java Servlets, JSP, JDBC, MySQL, Apache NetBeans IDE 24, and Apache Tomcat 9.0.84**.

---

## ⚡ Technology Stack

- **Language:** Java (JDK 23.0.1 / compatible with JDK 17-25)
- **Frontend:** JSP, HTML5, CSS3, JavaScript, Bootstrap 5.3, Leaflet.js
- **Backend:** Java Servlets + Pure JDBC (`java.sql.*`)
- **Database:** MySQL Server 8.0 & MySQL Workbench 8.0
- **IDE:** Apache NetBeans IDE 24
- **Application Server:** Apache Tomcat 9.0.84

---

## 🚀 How to Run the Project

### 1. Database Setup in MySQL Workbench 8.0
1. Open **MySQL Workbench 8.0** and connect to your local MySQL instance.
2. Open and run:
   - `backend/database/voltspot_database_setup.sql`
3. This creates the `voltspot_db` database and seeds all demo data (Admin, Operators, Drivers, Stations, Capacities, Slots, Bookings, Payments, Invoices, and Ratings).

### 2. Run in Apache NetBeans IDE 24
1. Open **Apache NetBeans IDE 24**.
2. Click **File** > **Open Project...** and select the `backend` folder.
3. Ensure **Apache Tomcat 9.0.84** is added under **Tools** > **Servers**.
4. Right-click the project > **Properties** > **Run** > set Server to `Apache Tomcat 9.0.84`.
5. Right-click the project > **Run** (or press `F6`).
6. The application launches automatically in your browser at:
   ```text
   http://localhost:8080/voltspot-ev-booking/
   ```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@voltspot.in` | `admin123` |
| **Station Operator** | `operator@voltspot.in` | `operator123` |
| **EV Driver (User)** | `user@voltspot.in` | `user123` |

*(The login page includes 1-click quick fill buttons for these accounts).*

---

## 🌟 Key Features
- **🇮🇳 Indian Rupee (₹) & GST Invoicing:** Authentic Indian EV stations (Bengaluru, Hyderabad, Mumbai, Delhi, Chennai, Pune), realistic ₹/slot rates, UPI QR payment simulator (GPay, PhonePe, Paytm, BHIM), and 18% GST (CGST 9% + SGST 9%) tax invoices with GSTIN `36AABCV8910M1Z5`.
- **🗺️ Google Maps API Key Connector & Live Radar:** Seamless Google Maps JavaScript API integration with persistent API Key modal, continuous GPS live location beacon (`watchPosition`), dynamic distance calculation in km, custom SVG neon lightning markers, and operator draggable pin coordinate picker.
- **💎 Ultra-Premium UI/UX:** Clean cybernetic dark-emerald design system, Plus Jakarta Sans typography, frosted glassmorphism, responsive slot selection cards, and real-time availability checks.

---

## 📁 Source Code Location
All Java backend sources, DAO layer, Servlets, models, utilities, database SQL, and JSP web views are located in the [`backend/`](./backend) directory. Detailed documentation can be found in [`backend/README.md`](./backend/README.md).
