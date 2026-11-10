/**
 * VoltSpot EV Localhost Server
 * High-performance standalone HTTP server running on http://localhost:8080/voltspot-ev-booking/
 * Simulates the Java Servlet, JSP, JDBC and MySQL backend architecture with zero external dependencies.
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = process.env.PORT || 8080;
const CONTEXT_PATH = '/voltspot-ev-booking';

// -------------------------------------------------------------
// In-Memory Database State (Pre-seeded matching MySQL Database)
// -------------------------------------------------------------

const db = {
    users: [
        { id: 1, name: 'System Administrator (India)', email: 'admin@voltspot.in', password: 'admin123', phone: '+91-98000-12345', role: 'ADMIN', status: 'ACTIVE' },
        { id: 2, name: 'VoltPower India Operators Pvt Ltd', email: 'operator@voltspot.in', password: 'operator123', phone: '+91-98450-67890', role: 'OPERATOR', status: 'ACTIVE' },
        { id: 3, name: 'EcoCharge India Network Ltd', email: 'ecocharge@operator.in', password: 'operator123', phone: '+91-98220-54321', role: 'OPERATOR', status: 'ACTIVE' },
        { id: 4, name: 'EV Driver', email: 'user@voltspot.in', password: 'user123', phone: '+91-98765-43210', role: 'USER', status: 'ACTIVE' },
        { id: 5, name: 'Priya Sharma', email: 'priya@example.com', password: 'user123', phone: '+91-98450-12345', role: 'USER', status: 'ACTIVE' },
        { id: 6, name: 'Arun Verma', email: 'arun@example.com', password: 'user123', phone: '+91-97110-56789', role: 'USER', status: 'ACTIVE' }
    ],
    stations: [
        {
            id: 1, operatorId: 2, operatorName: 'VoltPower India Operators Pvt Ltd',
            name: 'VoltSpot MG Road Supercharger Hub', address: '45 MG Road, Brigade Junction', city: 'Bengaluru',
            contactNumber: '+91-80-4123-5678', latitude: 12.97160000, longitude: 77.59460000,
            openingTime: '06:00', closingTime: '23:30', status: 'APPROVED', rejectionReason: null,
            chargingTypes: [
                { chargingType: 'FAST', totalCapacity: 6, powerKw: 150.0, pricePerSlot: 280.00 },
                { chargingType: 'NORMAL', totalCapacity: 10, powerKw: 22.0, pricePerSlot: 95.00 }
            ]
        },
        {
            id: 2, operatorId: 2, operatorName: 'VoltPower India Operators Pvt Ltd',
            name: 'VoltSpot Cyber Towers Station', address: 'Hitec City, Madhapur', city: 'Hyderabad',
            contactNumber: '+91-40-6789-1234', latitude: 17.45040000, longitude: 78.38110000,
            openingTime: '00:00', closingTime: '23:59', status: 'APPROVED', rejectionReason: null,
            chargingTypes: [
                { chargingType: 'FAST', totalCapacity: 8, powerKw: 120.0, pricePerSlot: 260.00 },
                { chargingType: 'NORMAL', totalCapacity: 12, powerKw: 22.0, pricePerSlot: 90.00 }
            ]
        },
        {
            id: 3, operatorId: 3, operatorName: 'EcoCharge India Network Ltd',
            name: 'VoltSpot BKC Platinum Hub', address: 'G-Block, Bandra Kurla Complex', city: 'Mumbai',
            contactNumber: '+91-22-2654-9876', latitude: 19.06570000, longitude: 72.86870000,
            openingTime: '06:00', closingTime: '23:00', status: 'APPROVED', rejectionReason: null,
            chargingTypes: [
                { chargingType: 'FAST', totalCapacity: 10, powerKw: 180.0, pricePerSlot: 320.00 },
                { chargingType: 'NORMAL', totalCapacity: 14, powerKw: 50.0, pricePerSlot: 120.00 }
            ]
        },
        {
            id: 4, operatorId: 3, operatorName: 'EcoCharge India Network Ltd',
            name: 'VoltSpot Connaught Place Central', address: 'Outer Circle, Block F, Connaught Place', city: 'Delhi',
            contactNumber: '+91-11-4321-8765', latitude: 28.63150000, longitude: 77.21670000,
            openingTime: '05:00', closingTime: '23:00', status: 'APPROVED', rejectionReason: null,
            chargingTypes: [
                { chargingType: 'FAST', totalCapacity: 6, powerKw: 150.0, pricePerSlot: 290.00 },
                { chargingType: 'NORMAL', totalCapacity: 8, powerKw: 22.0, pricePerSlot: 95.00 }
            ]
        },
        {
            id: 5, operatorId: 2, operatorName: 'VoltPower India Operators Pvt Ltd',
            name: 'EcoCharge OMR Tech Corridor Hub', address: 'Rajiv Gandhi Salai, Thoraipakkam', city: 'Chennai',
            contactNumber: '+91-44-2456-7890', latitude: 12.93450000, longitude: 80.23120000,
            openingTime: '06:00', closingTime: '23:00', status: 'APPROVED', rejectionReason: null,
            chargingTypes: [
                { chargingType: 'FAST', totalCapacity: 6, powerKw: 120.0, pricePerSlot: 250.00 },
                { chargingType: 'NORMAL', totalCapacity: 8, powerKw: 22.0, pricePerSlot: 90.00 }
            ]
        },
        {
            id: 6, operatorId: 2, operatorName: 'VoltPower India Operators Pvt Ltd',
            name: 'EcoCharge Hinjewadi IT Park Hub', address: 'Phase 1, Near Infosys Circle, Hinjewadi', city: 'Pune',
            contactNumber: '+91-20-6677-8899', latitude: 18.59130000, longitude: 73.73890000,
            openingTime: '06:00', closingTime: '22:00', status: 'APPROVED', rejectionReason: null,
            chargingTypes: [
                { chargingType: 'FAST', totalCapacity: 4, powerKw: 120.0, pricePerSlot: 240.00 },
                { chargingType: 'NORMAL', totalCapacity: 6, powerKw: 22.0, pricePerSlot: 85.00 }
            ]
        },
        {
            id: 7, operatorId: 3, operatorName: 'EcoCharge India Network Ltd',
            name: 'VoltSpot Whitefield ITPL Hub (Pending Review)', address: 'ITPL Main Road, Whitefield', city: 'Bengaluru',
            contactNumber: '+91-80-2841-9999', latitude: 12.98630000, longitude: 77.73080000,
            openingTime: '07:00', closingTime: '21:00', status: 'PENDING', rejectionReason: null,
            chargingTypes: [
                { chargingType: 'FAST', totalCapacity: 4, powerKw: 60.0, pricePerSlot: 200.00 },
                { chargingType: 'NORMAL', totalCapacity: 4, powerKw: 22.0, pricePerSlot: 80.00 }
            ]
        }
    ],
    bookings: [
        {
            id: 1, bookingNumber: 'VS-BK-2026-1001', userId: 4, userName: 'EV Driver', userPhone: '+91-98765-43210', userEmail: 'user@voltspot.in',
            stationId: 1, stationName: 'VoltSpot MG Road Supercharger Hub', stationAddress: '45 MG Road, Brigade Junction', stationCity: 'Bengaluru',
            chargingType: 'FAST', bookingDate: '2026-11-10', timeSlot: '10:00 - 11:00',
            vehicleNumber: 'KA-01-EV-2024', vehicleModel: 'Tata Nexon EV', amount: 280.00, status: 'COMPLETED', createdAt: '2026-11-10 09:30:00',
            paymentStatus: 'PAID', paymentMethod: 'UPI', transactionId: 'TXN-902348102', invoiceNumber: 'INV-2026-0001'
        },
        {
            id: 2, bookingNumber: 'VS-BK-2026-1002', userId: 4, userName: 'EV Driver', userPhone: '+91-98765-43210', userEmail: 'user@voltspot.in',
            stationId: 1, stationName: 'VoltSpot MG Road Supercharger Hub', stationAddress: '45 MG Road, Brigade Junction', stationCity: 'Bengaluru',
            chargingType: 'FAST', bookingDate: '2026-11-10', timeSlot: '14:00 - 15:00',
            vehicleNumber: 'KA-01-EV-2024', vehicleModel: 'Tata Nexon EV', amount: 280.00, status: 'BOOKED', createdAt: '2026-11-10 11:15:00',
            paymentStatus: 'PAID', paymentMethod: 'UPI', transactionId: 'TXN-902348103', invoiceNumber: 'INV-2026-0002'
        },
        {
            id: 3, bookingNumber: 'VS-BK-2026-1003', userId: 5, userName: 'Priya Sharma', userPhone: '+91-98450-12345', userEmail: 'priya@example.com',
            stationId: 2, stationName: 'VoltSpot Cyber Towers Station', stationAddress: 'Hitec City, Madhapur', stationCity: 'Hyderabad',
            chargingType: 'NORMAL', bookingDate: '2026-11-10', timeSlot: '11:00 - 12:00',
            vehicleNumber: 'TS-09-EV-5544', vehicleModel: 'MG ZS EV', amount: 90.00, status: 'BOOKED', createdAt: '2026-11-10 10:00:00',
            paymentStatus: 'PAID', paymentMethod: 'CARD', transactionId: 'TXN-902348104', invoiceNumber: 'INV-2026-0003'
        },
        {
            id: 4, bookingNumber: 'VS-BK-2026-1004', userId: 6, userName: 'Arun Verma', userPhone: '+91-97110-56789', userEmail: 'arun@example.com',
            stationId: 3, stationName: 'VoltSpot BKC Platinum Hub', stationAddress: 'G-Block, Bandra Kurla Complex', stationCity: 'Mumbai',
            chargingType: 'FAST', bookingDate: '2026-11-10', timeSlot: '09:00 - 10:00',
            vehicleNumber: 'MH-02-EV-7890', vehicleModel: 'Mahindra XUV400', amount: 320.00, status: 'COMPLETED', createdAt: '2026-11-10 08:30:00',
            paymentStatus: 'PAID', paymentMethod: 'NET_BANKING', transactionId: 'TXN-902348105', invoiceNumber: 'INV-2026-0004'
        }
    ],
    payments: [
        { id: 1, bookingId: 1, bookingNumber: 'VS-BK-2026-1001', userId: 4, userName: 'EV Driver', amount: 330.40, paymentMethod: 'UPI', transactionId: 'TXN-902348102', paymentStatus: 'PAID', paymentDate: '2026-11-10 09:35:00' },
        { id: 2, bookingId: 2, bookingNumber: 'VS-BK-2026-1002', userId: 4, userName: 'EV Driver', amount: 330.40, paymentMethod: 'UPI', transactionId: 'TXN-902348103', paymentStatus: 'PAID', paymentDate: '2026-11-10 11:18:00' },
        { id: 3, bookingId: 3, bookingNumber: 'VS-BK-2026-1003', userId: 5, userName: 'Priya Sharma', amount: 106.20, paymentMethod: 'CARD', transactionId: 'TXN-902348104', paymentStatus: 'PAID', paymentDate: '2026-11-10 10:05:00' },
        { id: 4, bookingId: 4, bookingNumber: 'VS-BK-2026-1004', userId: 6, userName: 'Arun Verma', amount: 377.60, paymentMethod: 'NET_BANKING', transactionId: 'TXN-902348105', paymentStatus: 'PAID', paymentDate: '2026-11-10 08:35:00' }
    ],
    invoices: [
        { id: 1, invoiceNumber: 'INV-2026-0001', bookingId: 1, paymentId: 1, userId: 4, customerName: 'EV Driver', customerEmail: 'user@voltspot.in', customerPhone: '+91-98765-43210', stationName: 'VoltSpot MG Road Supercharger Hub', stationAddress: '45 MG Road, Brigade Junction', stationCity: 'Bengaluru', stationContact: '+91-80-4123-5678', chargingType: 'FAST', bookingDate: '2026-11-10', timeSlot: '10:00 - 11:00', vehicleNumber: 'KA-01-EV-2024', vehicleModel: 'Tata Nexon EV', baseAmount: 280.00, taxAmount: 50.40, totalAmount: 330.40, bookingNumber: 'VS-BK-2026-1001', transactionId: 'TXN-902348102', paymentMethod: 'UPI', invoiceDate: '2026-11-10 09:35:00' },
        { id: 2, invoiceNumber: 'INV-2026-0002', bookingId: 2, paymentId: 2, userId: 4, customerName: 'EV Driver', customerEmail: 'user@voltspot.in', customerPhone: '+91-98765-43210', stationName: 'VoltSpot MG Road Supercharger Hub', stationAddress: '45 MG Road, Brigade Junction', stationCity: 'Bengaluru', stationContact: '+91-80-4123-5678', chargingType: 'FAST', bookingDate: '2026-11-10', timeSlot: '14:00 - 15:00', vehicleNumber: 'KA-01-EV-2024', vehicleModel: 'Tata Nexon EV', baseAmount: 280.00, taxAmount: 50.40, totalAmount: 330.40, bookingNumber: 'VS-BK-2026-1002', transactionId: 'TXN-902348103', paymentMethod: 'UPI', invoiceDate: '2026-11-10 11:18:00' },
        { id: 3, invoiceNumber: 'INV-2026-0003', bookingId: 3, paymentId: 3, userId: 5, customerName: 'Priya Sharma', customerEmail: 'priya@example.com', customerPhone: '+91-98450-12345', stationName: 'VoltSpot Cyber Towers Station', stationAddress: 'Hitec City, Madhapur', stationCity: 'Hyderabad', stationContact: '+91-40-6789-1234', chargingType: 'NORMAL', bookingDate: '2026-11-10', timeSlot: '11:00 - 12:00', vehicleNumber: 'TS-09-EV-5544', vehicleModel: 'MG ZS EV', baseAmount: 90.00, taxAmount: 16.20, totalAmount: 106.20, bookingNumber: 'VS-BK-2026-1003', transactionId: 'TXN-902348104', paymentMethod: 'CARD', invoiceDate: '2026-11-10 10:05:00' },
        { id: 4, invoiceNumber: 'INV-2026-0004', bookingId: 4, paymentId: 4, userId: 6, customerName: 'Arun Verma', customerEmail: 'arun@example.com', customerPhone: '+91-97110-56789', stationName: 'VoltSpot BKC Platinum Hub', stationAddress: 'G-Block, Bandra Kurla Complex', stationCity: 'Mumbai', stationContact: '+91-22-2654-9876', chargingType: 'FAST', bookingDate: '2026-11-10', timeSlot: '09:00 - 10:00', vehicleNumber: 'MH-02-EV-7890', vehicleModel: 'Mahindra XUV400', baseAmount: 320.00, taxAmount: 57.60, totalAmount: 377.60, bookingNumber: 'VS-BK-2026-1004', transactionId: 'TXN-902348105', paymentMethod: 'NET_BANKING', invoiceDate: '2026-11-10 08:35:00' }
    ],
    feedbacks: [
        { id: 1, stationId: 1, stationName: 'VoltSpot MG Road Supercharger Hub', userId: 4, userName: 'EV Driver', rating: 5, comments: 'Super fast 150kW CCS2 charger! Charged my Tata Nexon EV from 20% to 80% in 28 mins. Great cafe nearby on MG Road.', createdAt: '2026-11-10 10:35:00' },
        { id: 2, stationId: 1, stationName: 'VoltSpot MG Road Supercharger Hub', userId: 5, userName: 'Priya Sharma', rating: 4, comments: 'Very clean facility and easy parking slots. Security guards assisted with parking.', createdAt: '2026-11-10 11:20:00' },
        { id: 3, stationId: 2, stationName: 'VoltSpot Cyber Towers Station', userId: 5, userName: 'Priya Sharma', rating: 5, comments: 'Perfect location near Cyber Towers in Hitec City. UPI payment was instantaneous and seamless slot check-in.', createdAt: '2026-11-10 12:10:00' },
        { id: 4, stationId: 3, stationName: 'VoltSpot BKC Platinum Hub', userId: 6, userName: 'Arun Verma', rating: 5, comments: 'High-power 180kW charger in BKC Mumbai. Seamless slot reservation and fast billing!', createdAt: '2026-11-10 09:45:00' }
    ]
};

const STANDARD_SLOTS = [
    "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00",
    "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
    "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
    "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00",
    "22:00 - 23:00"
];

// Helper: Haversine distance
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

// Helper: Calculate average rating for station
function getStationRating(stationId) {
    const list = db.feedbacks.filter(f => f.stationId === stationId);
    if (!list.length) return { avg: 5.0, count: 0 };
    const sum = list.reduce((acc, f) => acc + f.rating, 0);
    return { avg: Math.round((sum / list.length) * 10) / 10, count: list.length };
}

// Session store (Cookie-based simulation)
const sessions = {};

function parseCookies(req) {
    const list = {};
    const rc = req.headers.cookie;
    if (rc) {
        rc.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
    }
    return list;
}

function getCurrentUser(req) {
    const cookies = parseCookies(req);
    const sid = cookies.VS_SESSION;
    if (sid && sessions[sid]) {
        return sessions[sid];
    }
    // Default to user 4 for quick preview if not logged in
    return db.users[3]; // Alex Johnson
}

// -------------------------------------------------------------
// HTML Page Layout Generator
// -------------------------------------------------------------

function renderHeader(currentUser, title, activeTab) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'VoltSpot EV India - Charging Station Finder & Slot Booking (₹)'}</title>
    <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="${CONTEXT_PATH}/css/custom.css">
</head>
<body>

<!-- Global Full Page Antigravity Background (Slow drift, moves only where mouse/touch interacts) -->
<div id="antigravity-global-bg" aria-hidden="true"></div>

<nav class="navbar navbar-expand-xl navbar-dark bg-dark sticky-top shadow-sm">
    <div class="container-fluid px-xl-4">
        <a class="navbar-brand d-flex align-items-center me-3" href="${CONTEXT_PATH}/home">
            <i class="bi bi-lightning-charge-fill text-success fs-3 me-2 anim-bolt-spark"></i>
            <span>Volt<strong>Spot</strong> <small class="text-white-50 fs-6 fw-normal ms-1">India (₹)</small></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav me-auto mb-2 mb-xl-0 align-items-xl-center">
                <li class="nav-item">
                    <a class="nav-link ${activeTab === 'register' ? 'active text-success fw-bold' : ''}" href="${CONTEXT_PATH}/register.jsp"><i class="bi bi-person-plus text-success me-1"></i> Register</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activeTab === 'login' ? 'active text-info fw-bold' : ''}" href="${CONTEXT_PATH}/login.jsp"><i class="bi bi-box-arrow-in-right text-info me-1"></i> Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activeTab === 'home' ? 'active text-white fw-bold' : ''}" href="${CONTEXT_PATH}/home"><i class="bi bi-house-door me-1"></i> Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activeTab === 'stations' ? 'active text-warning fw-bold' : ''}" href="${CONTEXT_PATH}/stations"><i class="bi bi-geo-alt text-warning me-1"></i> Find Stations</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle text-primary ${activeTab === 'operator' ? 'active fw-bold' : ''}" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="bi bi-speedometer2 me-1"></i> Operator Portal
                    </a>
                    <ul class="dropdown-menu shadow">
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/operator/dashboard"><i class="bi bi-grid me-2"></i>Operator Dashboard</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/operator/stations"><i class="bi bi-ev-station me-2"></i>My Charging Stations</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/operator/add-station"><i class="bi bi-plus-circle me-2"></i>Register New Station</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/operator/bookings"><i class="bi bi-list-check me-2"></i>Manage Bookings (Status)</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/operator/feedback"><i class="bi bi-star me-2"></i>Customer Reviews</a></li>
                    </ul>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle text-danger ${activeTab === 'admin' ? 'active fw-bold' : ''}" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="bi bi-shield-lock me-1"></i> Admin Portal
                    </a>
                    <ul class="dropdown-menu shadow">
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/dashboard"><i class="bi bi-bar-chart me-2"></i>Admin Dashboard</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/pending-stations"><i class="bi bi-patch-check me-2"></i>Station Approvals (Pending)</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/stations"><i class="bi bi-ev-station me-2"></i>Manage Stations</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/users"><i class="bi bi-people me-2"></i>Manage Users</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/bookings"><i class="bi bi-calendar-event me-2"></i>All System Bookings</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/payments"><i class="bi bi-credit-card me-2"></i>Payments Ledger</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/feedback"><i class="bi bi-chat-quote me-2"></i>Customer Feedback</a></li>
                        <li><a class="dropdown-item" href="${CONTEXT_PATH}/admin/reports"><i class="bi bi-file-earmark-bar-graph me-2"></i>Reports & Analytics</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a class="nav-link ${activeTab === 'invoice' ? 'active text-success fw-bold' : ''}" href="${CONTEXT_PATH}/invoice?bookingId=BK-1001"><i class="bi bi-receipt text-success me-1"></i> GST Invoice</a>
                </li>
            </ul>

            <div class="d-flex align-items-center gap-2">
                <!-- Google Maps Persistent API Key Connector Button -->
                <button type="button" onclick="openGoogleMapsKeyModal()" id="navMapsApiBtn" class="btn btn-sm btn-outline-warning d-flex align-items-center position-relative btn-shimmer" title="Configure Google Maps API Key">
                    <i class="bi bi-google me-1"></i>
                    <span class="d-none d-md-inline">Maps API</span>
                    <span id="gmapsKeyActiveDot" class="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle d-none">
                        <span class="visually-hidden">Connected</span>
                    </span>
                </button>

                <!-- Currency Tag -->
                <span class="badge bg-secondary-subtle text-light border border-secondary px-2 py-1 small">
                    <i class="bi bi-currency-rupee text-success"></i> INR (₹)
                </span>

                ${currentUser ? `
                    <div class="dropdown">
                        <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-person-circle fs-5 me-2"></i>
                            <span>${currentUser.name}</span>
                            <span class="badge ${currentUser.role === 'ADMIN' ? 'bg-danger' : (currentUser.role === 'OPERATOR' ? 'bg-primary' : 'bg-success')} ms-2 small">${currentUser.role}</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li class="dropdown-header">${currentUser.email}</li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="${CONTEXT_PATH}/auth?action=switch&role=USER"><i class="bi bi-car-front me-2"></i> Switch to Driver Mode</a></li>
                            <li><a class="dropdown-item" href="${CONTEXT_PATH}/auth?action=switch&role=OPERATOR"><i class="bi bi-ev-station me-2"></i> Switch to Operator Mode</a></li>
                            <li><a class="dropdown-item" href="${CONTEXT_PATH}/auth?action=switch&role=ADMIN"><i class="bi bi-shield-lock me-2"></i> Switch to Admin Mode</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="${CONTEXT_PATH}/login.jsp"><i class="bi bi-box-arrow-right me-2"></i> Switch / Sign Out</a></li>
                        </ul>
                    </div>
                ` : `
                    <a href="${CONTEXT_PATH}/login.jsp" class="btn btn-outline-light me-2"><i class="bi bi-box-arrow-in-right me-1"></i> Sign In</a>
                    <a href="${CONTEXT_PATH}/register.jsp" class="btn btn-success"><i class="bi bi-person-plus me-1"></i> Register</a>
                `}
            </div>
        </div>
    </div>
</nav>

<div class="main-content">
`;
}

function renderFooter() {
    return `</div><!-- /.main-content -->

<!-- Google Maps API Key Modal -->
<div class="modal fade" id="gmapsApiKeyModal" tabindex="-1" aria-labelledby="gmapsApiKeyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-dark text-white">
                <h5 class="modal-title fw-bold" id="gmapsApiKeyModalLabel">
                    <i class="bi bi-google text-success me-2"></i> Connect Google Maps API
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <p class="text-muted small mb-3">
                    Enter your Google Maps JavaScript API key below to unlock real-time Google Maps satellite/terrain views, Google Places street autocomplete, live traffic, and turn-by-turn directions across India.
                </p>
                <div class="mb-3">
                    <label class="form-label fw-semibold small text-dark">Google Maps JavaScript API Key</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light"><i class="bi bi-key-fill text-warning"></i></span>
                        <input type="text" id="gmapsApiKeyInput" class="form-control" placeholder="AIzaSy..." autocomplete="off">
                    </div>
                    <div class="form-text small">Your key is stored in your browser (<code>localStorage</code>) and used for map requests.</div>
                </div>
                <div class="p-3 bg-light rounded-3 border small mb-3">
                    <div class="fw-bold mb-1"><i class="bi bi-info-circle text-primary me-1"></i> Quick Tips:</div>
                    <ul class="mb-0 ps-3 text-secondary">
                        <li>Requires <strong>Maps JavaScript API</strong> enabled in Google Cloud Console.</li>
                        <li>Recommended APIs: <em>Places API</em>, <em>Geocoding API</em>, <em>Geometry Library</em>.</li>
                        <li>If no key is entered, an interactive fallback map continues to operate seamlessly.</li>
                    </ul>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-outline-danger" onclick="clearGoogleMapsKey()">Clear Key</button>
                <button type="button" class="btn btn-success fw-bold px-4" onclick="saveGoogleMapsKeyFromModal()">
                    <i class="bi bi-check2-circle me-1"></i> Save &amp; Connect Key
                </button>
            </div>
        </div>
    </div>
</div>

<script>
function openGoogleMapsKeyModal() {
    const existingKey = localStorage.getItem('voltspot_google_maps_api_key') || '';
    const input = document.getElementById('gmapsApiKeyInput');
    if (input) input.value = existingKey;
    if (typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('gmapsApiKeyModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
            return;
        }
    }
    const key = prompt("Enter your Google Maps JavaScript API Key:", existingKey);
    if (key !== null) setGoogleMapsApiKey(key);
}

function saveGoogleMapsKeyFromModal() {
    const input = document.getElementById('gmapsApiKeyInput');
    if (!input) return;
    const key = input.value.trim();
    if (!key) { alert('Please enter a valid Google Maps API Key or click Clear Key.'); return; }
    setGoogleMapsApiKey(key);
}

function clearGoogleMapsKey() {
    localStorage.removeItem('voltspot_google_maps_api_key');
    window.location.reload();
}
</script>

<footer class="bg-dark text-white pt-5 pb-4 mt-5 border-top border-secondary">
    <div class="container">
        <div class="row g-4">
            <div class="col-lg-4 col-md-6">
                <h5 class="fw-bold text-success mb-3">
                    <i class="bi bi-lightning-charge-fill me-1"></i> VoltSpot EV
                </h5>
                <p class="text-secondary small">
                    Smart Electric Vehicle Charging Station Finder and Real-Time Slot Booking System. Built with Java Servlets, JSP, JDBC, and MySQL. Running live on local HTTP server.
                </p>
            </div>
            <div class="col-lg-2 col-md-6">
                <h6 class="fw-bold mb-3 text-light">Quick Links</h6>
                <ul class="list-unstyled small">
                    <li class="mb-2"><a href="${CONTEXT_PATH}/home" class="text-secondary text-decoration-none">Home</a></li>
                    <li class="mb-2"><a href="${CONTEXT_PATH}/stations" class="text-secondary text-decoration-none">Find Stations</a></li>
                    <li class="mb-2"><a href="${CONTEXT_PATH}/my-bookings" class="text-secondary text-decoration-none">My Bookings</a></li>
                    <li class="mb-2"><a href="${CONTEXT_PATH}/operator/dashboard" class="text-secondary text-decoration-none">Operator Hub</a></li>
                    <li class="mb-2"><a href="${CONTEXT_PATH}/admin/dashboard" class="text-secondary text-decoration-none">Admin Control</a></li>
                    <li class="mb-2"><button type="button" onclick="openGoogleMapsKeyModal()" class="btn btn-outline-warning btn-sm py-1 px-2 d-inline-flex align-items-center mt-1"><i class="bi bi-google me-1"></i> Maps API Key</button></li>
                </ul>
            </div>
            <div class="col-lg-3 col-md-6">
                <h6 class="fw-bold mb-3 text-light">Role Portals</h6>
                <div class="d-flex flex-column gap-1 small">
                    <a href="${CONTEXT_PATH}/auth?action=switch&role=USER" class="text-success text-decoration-none"><i class="bi bi-check2"></i> 1. EV Driver (Alex Johnson)</a>
                    <a href="${CONTEXT_PATH}/auth?action=switch&role=OPERATOR" class="text-primary text-decoration-none"><i class="bi bi-check2"></i> 2. Station Operator (VoltPower Inc.)</a>
                    <a href="${CONTEXT_PATH}/auth?action=switch&role=ADMIN" class="text-danger text-decoration-none"><i class="bi bi-check2"></i> 3. System Administrator</a>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <h6 class="fw-bold mb-3 text-light">Technology Stack</h6>
                <p class="small text-secondary mb-1"><strong>Language:</strong> Java (JDK 23 / 17)</p>
                <p class="small text-secondary mb-1"><strong>Backend:</strong> Java Servlets + JDBC</p>
                <p class="small text-secondary mb-1"><strong>Frontend:</strong> JSP, HTML5, CSS3, JavaScript</p>
                <p class="small text-secondary mb-1"><strong>Database:</strong> MySQL 8.0 &amp; Workbench</p>
                <p class="small text-secondary mb-0"><strong>Server:</strong> Apache Tomcat 9.0.84</p>
            </div>
        </div>
        <hr class="border-secondary my-4">
        <div class="row align-items-center small text-secondary">
            <div class="col-md-6 text-center text-md-start">
                &copy; 2026 VoltSpot EV Charging Platform. All rights reserved.
            </div>
            <div class="col-md-6 text-center text-md-end mt-2 mt-md-0">
                <span>Designed for Apache NetBeans IDE 24 &amp; Apache Tomcat 9</span>
            </div>
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="${CONTEXT_PATH}/js/map.js"></script>
<script src="${CONTEXT_PATH}/js/app.js"></script>
<script src="${CONTEXT_PATH}/js/antigravity.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const globalBg = document.getElementById('antigravity-global-bg');
    if (globalBg && window.initAntigravity && !window.__antigravityInitialized) {
        window.__antigravityInitialized = true;
        window.__globalAntigravityInstance = window.initAntigravity(globalBg, {
            colors: ["#10b981", "#3b82f6", "#a843ff", "#34d399", "#064e3b"],
            count: 1400,
            magnetRadius: 7.0,
            ringRadius: 5.5,
            particleSize: 0.9,
            waveSpeed: 0.10,
            autoAnimate: false,
            clickBurst: true,
            opacity: 0.85
        });
    }
});
</script>
</body>
</html>
`;
}

// -------------------------------------------------------------
// Request Handler & Routing
// -------------------------------------------------------------

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname || '/';
    const query = parsedUrl.query;

    // Normalize route by stripping CONTEXT_PATH if present (supports both Render root and Tomcat context path)
    let route = pathname;
    if (route.startsWith(CONTEXT_PATH)) {
        route = route.substring(CONTEXT_PATH.length);
    }
    if (!route || route === '') {
        route = '/';
    }

    // Health check endpoint for Render.com zero-downtime deployment
    if (route === '/health' || route === '/healthz') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'UP', service: 'voltspot-ev-booking', uptime: process.uptime() }));
        return;
    }

    // Redirect root or bare context path directly to Interactive Stations Map (User Request: Share the Stations Map directly)
    if (route === '/') {
        res.writeHead(302, { 'Location': `${CONTEXT_PATH}/stations` });
        res.end();
        return;
    }

    const currentUser = getCurrentUser(req);

    // Serve Static Assets from backend/src/main/webapp (or local webapp)
    if (route.startsWith('/css/') || route.startsWith('/js/')) {
        let filePath = path.join(__dirname, 'backend', 'src', 'main', 'webapp', route);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, 'src', 'main', 'webapp', route);
        }
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);
            const contentType = ext === '.css' ? 'text/css; charset=utf-8' : (ext === '.js' ? 'application/javascript; charset=utf-8' : 'text/plain');
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(fs.readFileSync(filePath));
            return;
        }
    }

    // -------------------------------------------------------------
    // Route 0: Website Entrypoint (User Request: Share Stations Map directly)
    // -------------------------------------------------------------
    if (route === '/') {
        res.writeHead(302, { 'Location': `${CONTEXT_PATH}/stations` });
        res.end();
        return;
    }

    // -------------------------------------------------------------
    // Route 1: Home Landing Page
    // -------------------------------------------------------------
    if (route === '/home' || route === '/index.jsp') {
        const approvedStations = db.stations.filter(s => s.status === 'APPROVED');
        const cities = [...new Set(approvedStations.map(s => s.city))];
        const totalRevenue = db.payments.reduce((sum, p) => sum + p.amount, 0);

        let stationsCards = '';
        approvedStations.slice(0, 6).forEach(s => {
            const fast = s.chargingTypes.find(t => t.chargingType === 'FAST');
            const normal = s.chargingTypes.find(t => t.chargingType === 'NORMAL');
            const rating = getStationRating(s.id);

            stationsCards += `
                <div class="col-lg-4 col-md-6">
                    <div class="card h-100 station-card border-0 shadow-sm">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-light text-dark border">
                                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> ${s.city}
                                </span>
                                <span class="star-rating small">
                                    <i class="bi bi-star-fill text-warning"></i> ${rating.avg}
                                    <span class="text-muted small">(${rating.count})</span>
                                </span>
                            </div>
                            <h5 class="fw-bold mb-2 text-dark">${s.name}</h5>
                            <p class="text-muted small mb-3 flex-grow-1"><i class="bi bi-pin-map text-secondary me-1"></i> ${s.address}</p>
                            <div class="bg-light p-3 rounded-3 mb-3 border">
                                <div class="row g-2 text-center small">
                                    <div class="col-6 border-end">
                                        <div class="fw-semibold text-warning-emphasis">FAST CHARGING</div>
                                        <div class="fs-6 fw-bold text-dark">₹${fast ? fast.pricePerSlot.toFixed(2) : '280.00'}/slot</div>
                                        <small class="text-muted">${fast ? fast.powerKw : 150} kW &bull; ${fast ? fast.totalCapacity : 6} ports</small>
                                    </div>
                                    <div class="col-6">
                                        <div class="fw-semibold text-primary">NORMAL</div>
                                        <div class="fs-6 fw-bold text-dark">₹${normal ? normal.pricePerSlot.toFixed(2) : '95.00'}/slot</div>
                                        <small class="text-muted">${normal ? normal.powerKw : 22} kW &bull; ${normal ? normal.totalCapacity : 10} ports</small>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted"><i class="bi bi-clock me-1"></i> ${s.openingTime} - ${s.closingTime}</small>
                                <a href="${CONTEXT_PATH}/station-detail?id=${s.id}" class="btn btn-success btn-sm px-3 btn-shimmer">
                                    Book Slot <i class="bi bi-chevron-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        let citiesOptions = cities.map(c => `<option value="${c}">${c}</option>`).join('');

        const html = renderHeader(currentUser, 'VoltSpot EV India - Charging Station Finder & Slot Booking (₹)', 'home') + `
        <!-- Quick All-7-Portals Flow Ribbon -->
        <div class="bg-dark border-bottom border-secondary py-2">
            <div class="container d-flex flex-wrap align-items-center justify-content-between gap-2 text-white small">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-success"><i class="bi bi-broadcast me-1"></i> ONE LOCALHOST ACTIVE</span>
                    <span class="text-white-50">Flow: <strong>Register</strong> &rarr; <strong>Login</strong> &rarr; <strong>Home</strong> &rarr; <strong>Interactive Map</strong> &rarr; <strong>Operator</strong> &rarr; <strong>Admin</strong> &rarr; <strong>GST Invoice</strong></span>
                </div>
                <div class="d-flex gap-1 flex-wrap">
                    <a href="${CONTEXT_PATH}/register.jsp" class="btn btn-xs btn-outline-success py-1 px-2 text-nowrap"><i class="bi bi-person-plus"></i> Register</a>
                    <a href="${CONTEXT_PATH}/login.jsp" class="btn btn-xs btn-outline-info py-1 px-2 text-nowrap"><i class="bi bi-box-arrow-in-right"></i> Login</a>
                    <a href="${CONTEXT_PATH}/home" class="btn btn-xs btn-success py-1 px-2 text-nowrap"><i class="bi bi-house-door"></i> Home</a>
                    <a href="${CONTEXT_PATH}/stations" class="btn btn-xs btn-outline-warning py-1 px-2 text-nowrap"><i class="bi bi-geo-alt"></i> Find Stations</a>
                    <a href="${CONTEXT_PATH}/operator/dashboard" class="btn btn-xs btn-outline-primary py-1 px-2 text-nowrap"><i class="bi bi-speedometer2"></i> Operator Portal</a>
                    <a href="${CONTEXT_PATH}/admin/dashboard" class="btn btn-xs btn-outline-danger py-1 px-2 text-nowrap"><i class="bi bi-shield-lock"></i> Admin Portal</a>
                    <a href="${CONTEXT_PATH}/invoice?bookingId=BK-1001" class="btn btn-xs btn-outline-light py-1 px-2 text-nowrap"><i class="bi bi-receipt"></i> GST Invoice</a>
                </div>
            </div>
        </div>
        <!-- Premium Hero Section with Animations -->
        <section class="hero-section text-center text-lg-start position-relative">
            <div class="container py-4">
                <div class="row align-items-center g-5">
                    <div class="col-lg-7 anim-fade-up">
                        <div class="d-inline-flex align-items-center gap-2 bg-success bg-opacity-20 text-success border border-success border-opacity-30 px-3 py-1 rounded-pill mb-3">
                            <span class="live-dot"></span>
                            <span class="small fw-bold">Live India EV Charging Network (₹ / INR)</span>
                        </div>
                        <h1 class="display-4 fw-bold mb-3 text-white">
                            Next-Gen EV Charging, <br><span class="text-gradient-emerald">Guaranteed Slot Booking</span>
                        </h1>
                        <p class="lead text-light opacity-75 mb-4" style="max-width: 580px;">
                            Discover high-speed CCS2 Fast Chargers (up to 180 kW) and Type 2 AC stations across Bengaluru, Hyderabad, Mumbai, Delhi, Chennai, and Pune. Continuous GPS radar and live availability prevent overbooking.
                        </p>

                        <!-- Elevated Search Bar Card -->
                        <div class="hero-search-card p-4 text-dark mb-4 anim-scale-in">
                            <form action="${CONTEXT_PATH}/stations" method="GET" class="row g-2 align-items-center">
                                <div class="col-md-5">
                                    <label class="form-label small fw-bold text-muted mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i> Hub City</label>
                                    <div class="input-group">
                                        <select name="city" class="form-select border-1 fw-semibold">
                                            <option value="">All Indian Metro Cities</option>
                                            ${citiesOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold text-muted mb-1"><i class="bi bi-search text-muted me-1"></i> Landmark / Area</label>
                                    <input type="text" name="keyword" class="form-control border-1" placeholder="e.g. MG Road, Hitec City, BKC...">
                                </div>
                                <div class="col-md-3 d-flex align-items-end">
                                    <button type="submit" class="btn btn-success w-100 py-2 fw-bold shadow-sm btn-shimmer">
                                        <i class="bi bi-search me-1"></i> Find Hubs
                                    </button>
                                </div>
                            </form>
                            <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top gap-2">
                                <div class="d-flex flex-wrap gap-1 align-items-center">
                                    <small class="text-muted fw-bold me-1">Quick Jump:</small>
                                    <a href="${CONTEXT_PATH}/stations?city=Bengaluru" class="city-chip">Bengaluru</a>
                                    <a href="${CONTEXT_PATH}/stations?city=Hyderabad" class="city-chip">Hyderabad</a>
                                    <a href="${CONTEXT_PATH}/stations?city=Mumbai" class="city-chip">Mumbai</a>
                                    <a href="${CONTEXT_PATH}/stations?city=Delhi" class="city-chip">Delhi NCR</a>
                                    <a href="${CONTEXT_PATH}/stations?city=Chennai" class="city-chip">Chennai</a>
                                    <a href="${CONTEXT_PATH}/stations?city=Pune" class="city-chip">Pune</a>
                                </div>
                                <button type="button" id="locateNearbyBtn" onclick="locateUserNearby()" class="btn btn-sm btn-outline-primary fw-bold">
                                    <i class="bi bi-crosshair me-1"></i> Use My GPS Location
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Hero Feature Cards with Animated Counter -->
                    <div class="col-lg-5 anim-fade-up">
                        <div class="row g-3">
                            <div class="col-6">
                                <div class="hero-stat-card h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <i class="bi bi-ev-station text-success fs-2"></i>
                                        <span class="badge bg-success-subtle text-success small">Verified</span>
                                    </div>
                                    <h2 class="fw-bold mb-0 text-white counter-val">${approvedStations.length * 15}+</h2>
                                    <small class="text-light opacity-75">Active Superchargers</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="hero-stat-card h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <i class="bi bi-lightning-charge-fill text-warning fs-2 anim-bolt-spark"></i>
                                        <span class="badge bg-warning-subtle text-warning small">CCS2 &bull; 180kW</span>
                                    </div>
                                    <h2 class="fw-bold mb-0 text-white">FAST &amp; AC</h2>
                                    <small class="text-light opacity-75">Dual Speed Ports</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="hero-stat-card h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <i class="bi bi-shield-check text-info fs-2"></i>
                                        <span class="badge bg-info-subtle text-info small">Anti-Overlap</span>
                                    </div>
                                    <h2 class="fw-bold mb-0 text-white">100%</h2>
                                    <small class="text-light opacity-75">Guaranteed Slots</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="hero-stat-card h-100">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <i class="bi bi-qr-code text-success fs-2"></i>
                                        <span class="badge bg-light text-dark small font-monospace">UPI &bull; ₹</span>
                                    </div>
                                    <h2 class="fw-bold mb-0 text-white">Instant</h2>
                                    <small class="text-light opacity-75">QR / RuPay Payments</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Stations with Staggered Animations -->
        <section class="py-5 bg-light">
            <div class="container py-2">
                <div class="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold">Top Locations in India</span>
                        <h2 class="fw-bold mb-0">Featured Charging Hubs</h2>
                    </div>
                    <a href="${CONTEXT_PATH}/stations" class="btn btn-outline-success btn-shimmer">
                        View All Stations <i class="bi bi-arrow-right ms-1"></i>
                    </a>
                </div>
                <div class="row g-4 stagger-grid">${stationsCards}</div>
            </div>
        </section>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 2: Stations Finder & Map
    // -------------------------------------------------------------
    if (route === '/stations' || route === '/stations.jsp' || route === '/nearby-stations') {
        const cityFilter = query.city || '';
        const keywordFilter = (query.keyword || '').toLowerCase();
        const typeFilter = query.type || '';
        const userLat = parseFloat(query.lat || 12.9716);
        const userLng = parseFloat(query.lng || 77.5946);
        const isNearby = !!query.lat;

        let list = db.stations.filter(s => s.status === 'APPROVED');

        if (cityFilter && cityFilter !== 'ALL') {
            list = list.filter(s => s.city.toLowerCase() === cityFilter.toLowerCase());
        }

        if (keywordFilter) {
            list = list.filter(s => s.name.toLowerCase().includes(keywordFilter) || s.address.toLowerCase().includes(keywordFilter) || s.city.toLowerCase().includes(keywordFilter));
        }

        if (typeFilter) {
            list = list.filter(s => s.chargingTypes.some(t => t.chargingType === typeFilter));
        }

        // Distance calculation
        list.forEach(s => {
            s.distanceKm = calculateDistanceKm(userLat, userLng, s.latitude, s.longitude);
        });

        if (isNearby) {
            list.sort((a, b) => a.distanceKm - b.distanceKm);
        }

        const cities = [...new Set(db.stations.filter(s => s.status === 'APPROVED').map(s => s.city))];
        const citiesOptions = cities.map(c => `<option value="${c}" ${cityFilter.toLowerCase() === c.toLowerCase() ? 'selected' : ''}>${c}</option>`).join('');

        let cardsHtml = '';
        list.forEach(s => {
            const fast = s.chargingTypes.find(t => t.chargingType === 'FAST');
            const normal = s.chargingTypes.find(t => t.chargingType === 'NORMAL');
            const rating = getStationRating(s.id);

            cardsHtml += `
                <div class="col-lg-6">
                    <div class="card h-100 station-card border-0 shadow-sm">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span class="badge bg-light text-dark border me-1">
                                        <i class="bi bi-geo-alt-fill text-danger me-1"></i> ${s.city}
                                    </span>
                                    <span class="badge bg-success-subtle text-success fw-bold" id="station-dist-${s.id}">
                                        <i class="bi bi-cursor-fill me-1"></i> ${s.distanceKm} km away
                                    </span>
                                </div>
                                <span class="star-rating small">
                                    <i class="bi bi-star-fill text-warning"></i> ${rating.avg}
                                    <span class="text-muted small">(${rating.count})</span>
                                </span>
                            </div>
                            <h4 class="fw-bold text-dark mb-1">${s.name}</h4>
                            <p class="text-muted small mb-2"><i class="bi bi-pin-map text-secondary me-1"></i> ${s.address}</p>
                            <p class="text-muted small mb-3"><i class="bi bi-telephone text-secondary me-1"></i> ${s.contactNumber} &bull; <i class="bi bi-clock me-1"></i> ${s.openingTime} - ${s.closingTime}</p>
                            <div class="row g-2 mb-3 mt-auto">
                                <div class="col-6">
                                    <div class="p-3 bg-light rounded-3 border h-100">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="badge-fast small">FAST (DC)</span>
                                            <small class="text-muted">${fast ? fast.powerKw : 150} kW</small>
                                        </div>
                                        <div class="fs-5 fw-bold text-dark mt-2">₹${fast ? fast.pricePerSlot.toFixed(2) : '280.00'}<span class="fs-6 fw-normal text-muted">/slot</span></div>
                                        <small class="text-success"><i class="bi bi-check-circle-fill"></i> ${fast ? fast.totalCapacity : 6} ports</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-3 bg-light rounded-3 border h-100">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <span class="badge-normal small">NORMAL (AC)</span>
                                            <small class="text-muted">${normal ? normal.powerKw : 22} kW</small>
                                        </div>
                                        <div class="fs-5 fw-bold text-dark mt-2">₹${normal ? normal.pricePerSlot.toFixed(2) : '95.00'}<span class="fs-6 fw-normal text-muted">/slot</span></div>
                                        <small class="text-primary"><i class="bi bi-check-circle-fill"></i> ${normal ? normal.totalCapacity : 10} ports</small>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top">
                                <div class="d-flex gap-1">
                                    <a href="https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}&travelmode=driving" target="_blank" class="btn btn-sm btn-outline-primary fw-semibold" title="Live Driving Directions in Google Maps">
                                        <i class="bi bi-cursor-fill me-1"></i> Directions
                                    </a>
                                    <a href="https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}" target="_blank" class="btn btn-sm btn-outline-secondary" title="View exact location pin on Google Maps">
                                        <i class="bi bi-google"></i>
                                    </a>
                                </div>
                                <a href="${CONTEXT_PATH}/station-detail?id=${s.id}" class="btn btn-success fw-semibold px-4 btn-shimmer">
                                    Check Slots &amp; Book (₹) <i class="bi bi-arrow-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        const stationsJson = JSON.stringify(list);

        const html = renderHeader(currentUser, 'Find EV Charging Stations - VoltSpot India (₹)', 'stations') + `
        <div class="container py-4">
            <!-- Shareable Live Link Banner -->
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 p-3 rounded-3 shadow-sm anim-fade-up" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12)); border: 1px solid rgba(16, 185, 129, 0.35);">
                <div class="d-flex align-items-center gap-2 mb-2 mb-md-0">
                    <span class="badge bg-success px-2 py-1"><i class="bi bi-broadcast me-1"></i> PUBLIC LIVE MAP</span>
                    <div>
                        <span class="fw-bold text-dark">VoltSpot EV Stations &amp; Live Radar</span>
                        <div class="text-muted small">Real-time GPS Tracking, Exact Google Locations &amp; Turn-by-Turn Directions</div>
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <button type="button" onclick="shareCurrentStationMap()" class="btn btn-sm btn-success fw-bold d-inline-flex align-items-center shadow-sm">
                        <i class="bi bi-share-fill me-1"></i> Share This Map
                    </button>
                    <button type="button" onclick="copyCurrentMapLink()" id="copyShareBtn" class="btn btn-sm btn-outline-dark fw-semibold d-inline-flex align-items-center bg-white">
                        <i class="bi bi-link-45deg me-1"></i> Copy Link
                    </button>
                </div>
            </div>

            <!-- Search & Filter Card -->
            <div class="card p-4 shadow-sm border-0 mb-4 bg-white anim-fade-up">
                <form action="${CONTEXT_PATH}/stations" method="GET" class="row g-3 align-items-end">
                    <div class="col-lg-3 col-md-6">
                        <label class="form-label fw-semibold small text-muted">City</label>
                        <select name="city" class="form-select">
                            <option value="">All Indian Metro Cities</option>
                            ${citiesOptions}
                        </select>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <label class="form-label fw-semibold small text-muted">Keyword or Address</label>
                        <input type="text" name="keyword" class="form-control" placeholder="Station name or street..." value="${query.keyword || ''}">
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <label class="form-label fw-semibold small text-muted">Charging Speed</label>
                        <select name="type" class="form-select">
                            <option value="">All Types (Fast &amp; Normal)</option>
                            <option value="FAST" ${typeFilter === 'FAST' ? 'selected' : ''}>FAST Charging (DC)</option>
                            <option value="NORMAL" ${typeFilter === 'NORMAL' ? 'selected' : ''}>NORMAL Charging (AC)</option>
                        </select>
                    </div>
                    <div class="col-lg-3 col-md-6 d-flex gap-2">
                        <button type="submit" class="btn btn-success flex-grow-1 fw-semibold btn-shimmer"><i class="bi bi-filter me-1"></i> Apply Filters</button>
                        <a href="${CONTEXT_PATH}/stations" class="btn btn-outline-secondary"><i class="bi bi-arrow-counterclockwise"></i></a>
                    </div>
                </form>
                <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <div class="text-muted small">Showing <strong class="text-dark">${list.length}</strong> verified charging stations in India</div>
                    <button type="button" id="locateNearbyBtn" onclick="locateUserNearby()" class="btn btn-sm btn-outline-primary fw-semibold">
                        <i class="bi bi-crosshair me-1"></i> Find Stations Near Me
                    </button>
                </div>
            </div>

            <!-- Premium Google Maps Interactive Radar Section -->
            <div class="map-card-container mb-4 overflow-hidden position-relative anim-fade-up">
                <div class="map-radar-ping">
                    <span class="live-dot" style="background: #3b82f6; box-shadow: 0 0 10px #3b82f6;"></span>
                    <span style="color: #60a5fa; font-weight: 700;">Live GPS:</span>
                    <span>Continuous Tracking Active</span>
                </div>
                <div class="card-header bg-white py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
                    <div class="d-flex align-items-center gap-2">
                        <h6 class="fw-bold mb-0 text-dark">
                            <i class="bi bi-geo-alt-fill text-success me-1"></i> Live Station Radar &amp; GPS Tracker (Google Maps)
                        </h6>
                        <button type="button" onclick="findNearestStation(window.__stationsData)" class="btn btn-sm btn-outline-success fw-bold d-none d-sm-inline-flex align-items-center">
                            <i class="bi bi-lightning-charge-fill me-1"></i> Nearest Hub
                        </button>
                    </div>
                    <div class="d-flex flex-wrap gap-1 align-items-center">
                        <span class="small text-muted fw-bold me-1 d-none d-md-inline">Jump City:</span>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(12.9716, 77.5946, 12)" class="city-chip">Bengaluru</a>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(17.4504, 78.3811, 12)" class="city-chip">Hyderabad</a>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(19.0657, 72.8687, 12)" class="city-chip">Mumbai</a>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(28.6315, 77.2167, 12)" class="city-chip">Delhi NCR</a>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(12.9345, 80.2312, 12)" class="city-chip">Chennai</a>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(18.5913, 73.7389, 12)" class="city-chip">Pune</a>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(28.4952, 77.0891, 12)" class="city-chip">Gurgaon</a>
                        <a href="javascript:void(0)" onclick="centerMapOnCity(22.5804, 88.4328, 12)" class="city-chip">Kolkata</a>
                    </div>
                </div>
                <div id="stationMap" style="height: 460px; width: 100%;"></div>
            </div>

            <!-- Staggered Stations Cards Grid -->
            <div class="row g-4 stagger-grid">${cardsHtml}</div>
        </div>

        <script>
        function copyCurrentMapLink() {
            const shareUrl = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    const btn = document.getElementById('copyShareBtn');
                    if (btn) {
                        btn.innerHTML = '<i class="bi bi-check-circle-fill text-success me-1"></i> Copied!';
                        setTimeout(() => {
                            btn.innerHTML = '<i class="bi bi-link-45deg me-1"></i> Copy Link';
                        }, 2500);
                    }
                }).catch(() => fallbackCopy(shareUrl));
            } else {
                fallbackCopy(shareUrl);
            }
        }

        function fallbackCopy(url) {
            prompt('Copy this live map link to share:', url);
        }

        function shareCurrentStationMap() {
            const title = 'VoltSpot EV - Live Charging Station Radar & GPS';
            const text = 'Find verified EV charging stations, live GPS tracking, and guaranteed slot booking across India:';
            const url = window.location.href;
            if (navigator.share) {
                navigator.share({ title, text, url }).catch(() => {});
            } else {
                const shareText = encodeURIComponent(text + ' ' + url);
                window.open('https://api.whatsapp.com/send?text=' + shareText, '_blank');
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            const stationsData = ${stationsJson};
            window.__stationsData = stationsData;
            initStationMap('stationMap', stationsData, ${userLat}, ${userLng}, 12);
        });
        </script>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 3: Dynamic AJAX Live Slot Check (Anti-Overbooking)
    // -------------------------------------------------------------
    if (route === '/check-slot-availability') {
        const stationId = parseInt(query.stationId);
        const chargingType = (query.chargingType || 'FAST').toUpperCase();
        const bookingDate = query.date || new Date().toISOString().split('T')[0];

        const station = db.stations.find(s => s.id === stationId);
        const typeConfig = station ? station.chargingTypes.find(t => t.chargingType === chargingType) : null;
        const totalCapacity = typeConfig ? typeConfig.totalCapacity : 4;

        const results = STANDARD_SLOTS.map(slot => {
            const bookedCount = db.bookings.filter(b =>
                b.stationId === stationId &&
                b.chargingType === chargingType &&
                b.bookingDate === bookingDate &&
                b.timeSlot === slot &&
                (b.status === 'PENDING' || b.status === 'BOOKED')
            ).length;

            const available = Math.max(0, totalCapacity - bookedCount);
            return {
                slot: slot,
                totalCapacity: totalCapacity,
                booked: bookedCount,
                available: available,
                isFull: available <= 0
            };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
        return;
    }

    // -------------------------------------------------------------
    // Route 4: Station Details & Interactive Slot Booking
    // -------------------------------------------------------------
    if (route === '/station-detail' || route === '/station-details.jsp') {
        const stationId = parseInt(query.id);
        const station = db.stations.find(s => s.id === stationId);

        if (!station) {
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/stations` });
            res.end();
            return;
        }

        const fast = station.chargingTypes.find(t => t.chargingType === 'FAST');
        const normal = station.chargingTypes.find(t => t.chargingType === 'NORMAL');
        const reviews = db.feedbacks.filter(f => f.stationId === stationId);
        const rating = getStationRating(stationId);

        let reviewsHtml = reviews.map(fb => `
            <div class="border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-dark"><i class="bi bi-person-circle text-secondary me-1"></i> ${fb.userName}</strong>
                    <div class="star-rating small">
                        ${[1,2,3,4,5].map(i => `<i class="bi ${i <= fb.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}"></i>`).join('')}
                    </div>
                </div>
                <p class="text-muted small mb-1">${fb.comments}</p>
                <small class="text-secondary opacity-75" style="font-size:0.75rem;">${fb.createdAt}</small>
            </div>
        `).join('') || '<p class="text-muted small">No reviews yet for this station. Be the first to rate your charging experience below!</p>';

        const html = renderHeader(currentUser, `${station.name} - VoltSpot EV`, 'stations') + `
        <div class="container py-4">
            <nav aria-label="breadcrumb" class="mb-3">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="${CONTEXT_PATH}/home">Home</a></li>
                    <li class="breadcrumb-item"><a href="${CONTEXT_PATH}/stations">Stations</a></li>
                    <li class="breadcrumb-item active">${station.name}</li>
                </ol>
            </nav>

            <div class="row g-4">
                <div class="col-lg-7">
                    <div class="card shadow-sm border-0 mb-4">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold">
                                    <i class="bi bi-patch-check-fill me-1"></i> Verified Station
                                </span>
                                <div class="star-rating">
                                    <i class="bi bi-star-fill text-warning"></i> ${rating.avg}
                                    <span class="text-muted small">(${rating.count} reviews)</span>
                                </div>
                            </div>
                            <h2 class="fw-bold text-dark mb-2">${station.name}</h2>
                            <p class="text-muted mb-3"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${station.address}, <strong>${station.city}</strong></p>
                            <div class="row g-3 py-3 border-top border-bottom my-3">
                                <div class="col-sm-6">
                                    <small class="text-muted d-block">Operating Hours</small>
                                    <strong>${station.openingTime} - ${station.closingTime}</strong>
                                </div>
                                <div class="col-sm-6">
                                    <small class="text-muted d-block">Station Helpdesk</small>
                                    <strong>${station.contactNumber}</strong>
                                </div>
                            </div>

                            <h5 class="fw-bold mb-3 mt-4">Available Charging Infrastructure</h5>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="card border p-3 bg-light h-100">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="badge-fast">FAST CHARGING (DC)</span>
                                            <span class="fw-bold text-success fs-5">₹${fast ? fast.pricePerSlot.toFixed(2) : '280.00'}<small class="text-muted fs-6">/slot</small></span>
                                        </div>
                                        <ul class="list-unstyled small text-muted mb-0 mt-2">
                                            <li class="mb-1"><i class="bi bi-lightning-charge-fill text-warning me-1"></i> Power Output: <strong>${fast ? fast.powerKw : 150} kW</strong></li>
                                            <li class="mb-1"><i class="bi bi-layers-fill text-primary me-1"></i> Dedicated Ports: <strong>${fast ? fast.totalCapacity : 6} slots</strong></li>
                                            <li><i class="bi bi-speedometer2 text-danger me-1"></i> Fast Top-Up: 20% to 80% in ~28 mins</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border p-3 bg-light h-100">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="badge-normal">NORMAL CHARGING (AC)</span>
                                            <span class="fw-bold text-primary fs-5">₹${normal ? normal.pricePerSlot.toFixed(2) : '95.00'}<small class="text-muted fs-6">/slot</small></span>
                                        </div>
                                        <ul class="list-unstyled small text-muted mb-0 mt-2">
                                            <li class="mb-1"><i class="bi bi-plug-fill text-info me-1"></i> Power Output: <strong>${normal ? normal.powerKw : 22} kW</strong></li>
                                            <li class="mb-1"><i class="bi bi-layers-fill text-primary me-1"></i> Dedicated Ports: <strong>${normal ? normal.totalCapacity : 10} slots</strong></li>
                                            <li><i class="bi bi-hourglass-split text-info me-1"></i> Optimal for routine parking &amp; office hours</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Interactive Animated EV Battery Charging Simulator -->
                            <div class="ev-battery-box mt-4 mb-2 anim-fade-up" id="evBatterySimulator">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-battery-charging text-success fs-4 me-2 anim-bolt-spark"></i>
                                        <div>
                                            <strong class="d-block" style="font-size: 14px;">EV Battery Charging &amp; Cost Simulator</strong>
                                            <small class="text-secondary opacity-75">Interactive estimate for 40.5 kWh EV (Tata Nexon / MG ZS / XUV400)</small>
                                        </div>
                                    </div>
                                    <span class="badge bg-success font-monospace" id="batteryPercentLabel">25%</span>
                                </div>
                                
                                <div class="battery-shell mb-3">
                                    <div class="battery-fill" id="batteryFillBar" style="width: 25%;"></div>
                                </div>
                                
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between small text-secondary mb-1">
                                        <span>Current Battery Level (Slide to Adjust):</span>
                                        <span class="text-white fw-bold">Target: 80% Fast-Charge Cap</span>
                                    </div>
                                    <input type="range" class="form-range" id="batteryCurrentSlider" min="10" max="90" value="25" step="5">
                                </div>

                                <div class="row g-2 text-center pt-2 border-top border-secondary">
                                    <div class="col-6 border-end border-secondary">
                                        <small class="text-secondary d-block">Est. Charging Time (DC Fast)</small>
                                        <strong class="text-warning" id="batteryTimeEstimate">~28 mins to 80%</strong>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-secondary d-block">Est. Energy / Slot Cost</small>
                                        <strong class="text-success fs-6" id="batteryCostEstimate">₹280.00</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Interactive Google Map Mini View -->
                        <div class="mt-4">
                            <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-geo-alt-fill text-danger me-1"></i> Exact Google Location</h6>
                                <div class="d-flex gap-1">
                                    <a href="https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&travelmode=driving" target="_blank" class="btn btn-sm btn-primary text-white fw-semibold">
                                        <i class="bi bi-cursor-fill me-1"></i> Directions
                                    </a>
                                    <a href="https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}" target="_blank" class="btn btn-sm btn-outline-secondary" title="View exact location pin on Google Maps">
                                        <i class="bi bi-google me-1"></i> Exact Pin
                                    </a>
                                </div>
                            </div>
                            <div id="stationDetailMap" class="rounded-3 border overflow-hidden shadow-sm" style="height: 220px; width: 100%;"></div>
                        </div>
                    </div>

                    <!-- Customer Reviews -->
                    <div class="card shadow-sm border-0">
                        <div class="card-body p-4">
                            <h5 class="fw-bold mb-4">Customer Ratings &amp; Reviews</h5>
                            ${reviewsHtml}
                            <div class="mt-4 pt-3 border-top">
                                <h6 class="fw-bold mb-3"><i class="bi bi-pencil-square me-1"></i> Rate This Station</h6>
                                <form action="${CONTEXT_PATH}/submit-feedback" method="POST">
                                    <input type="hidden" name="stationId" value="${station.id}">
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Your Rating</label>
                                        <select name="rating" class="form-select form-select-sm">
                                            <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Outstanding</option>
                                            <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                                            <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <textarea name="comments" rows="3" class="form-control form-control-sm" placeholder="Write your charging experience..." required></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-sm btn-outline-success">Submit Review</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Live Slot Booking Widget -->
                <div class="col-lg-5">
                    <div class="card shadow-sm border-0 sticky-top" style="top: 80px;">
                        <div class="card-header bg-dark text-white p-3">
                            <h5 class="fw-bold mb-0"><i class="bi bi-calendar2-check-fill text-success me-2"></i> Book A Charging Slot</h5>
                            <small class="text-secondary">Real-time capacity verification prevents overbooking</small>
                        </div>
                        <div class="card-body p-4">
                            <form id="slotBookingForm" action="${CONTEXT_PATH}/book-slot" method="POST">
                                <input type="hidden" id="bookingStationId" name="stationId" value="${station.id}">
                                <input type="hidden" id="selectedTimeSlot" name="timeSlot" value="" required>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold small text-muted">1. Select Charging Type</label>
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <input type="radio" class="btn-check" name="chargingType" id="typeFast" value="FAST" data-price="${fast ? fast.pricePerSlot : 18}" checked>
                                            <label class="btn btn-outline-warning text-dark w-100 py-2" for="typeFast">
                                                <div class="fw-bold">FAST (DC)</div>
                                                <small class="d-block">₹${fast ? fast.pricePerSlot.toFixed(2) : '18.00'}/slot</small>
                                            </label>
                                        </div>
                                        <div class="col-6">
                                            <input type="radio" class="btn-check" name="chargingType" id="typeNormal" value="NORMAL" data-price="${normal ? normal.pricePerSlot : 8.5}">
                                            <label class="btn btn-outline-info text-dark w-100 py-2" for="typeNormal">
                                                <div class="fw-bold">NORMAL (AC)</div>
                                                <small class="d-block">₹${normal ? normal.pricePerSlot.toFixed(2) : '8.50'}/slot</small>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold small text-muted">2. Select Date</label>
                                    <input type="date" id="bookingDate" name="bookingDate" class="form-control" required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold small text-muted">3. Select Time Slot (1 Hour)</label>
                                    <div id="slotGridContainer" class="py-2"></div>
                                    <small class="text-muted d-block mt-1"><i class="bi bi-info-circle"></i> Click an available slot above to select it.</small>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold small text-muted">4. Vehicle Information</label>
                                    <div class="row g-2">
                                        <div class="col-6"><input type="text" name="vehicleModel" class="form-control form-control-sm" placeholder="e.g. Tata Nexon EV" value="Tata Nexon EV" required></div>
                                        <div class="col-6"><input type="text" name="vehicleNumber" class="form-control form-control-sm" placeholder="e.g. KA-01-EV-2024" value="KA-01-EV-2024" required></div>
                                    </div>
                                </div>

                                <div class="bg-light p-3 rounded-3 mb-4 border">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="fw-semibold text-muted">Slot Charge:</span>
                                        <span id="totalPricePreview" class="fs-4 fw-bold text-success">₹280.00</span>
                                    </div>
                                    <small class="text-muted d-block">+ 18% GST/Tax calculated at payment</small>
                                </div>

                                <button type="submit" class="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm">
                                    <i class="bi bi-check-circle-fill me-1"></i> Reserve Slot &amp; Proceed to Pay
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
        document.addEventListener('DOMContentLoaded', function () {
            if (window.initStationDetailMap) {
                initStationDetailMap('stationDetailMap', ${station.latitude}, ${station.longitude}, '${station.name.replace(/'/g, "\\'")}', '${station.address.replace(/'/g, "\\\'")}');
            }
        });
        </script>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 5: Create Booking
    // -------------------------------------------------------------
    if (route === '/book-slot' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const stationId = parseInt(params.stationId);
            const chargingType = (params.chargingType || 'FAST').toUpperCase();
            const bookingDate = params.bookingDate;
            const timeSlot = params.timeSlot;
            const vehicleModel = params.vehicleModel || 'Tesla Model 3';
            const vehicleNumber = params.vehicleNumber || 'EV-NY-8921';

            const station = db.stations.find(s => s.id === stationId);
            const typeConfig = station ? station.chargingTypes.find(t => t.chargingType === chargingType) : null;
            const amount = typeConfig ? typeConfig.pricePerSlot : 18.00;

            const newBooking = {
                id: db.bookings.length + 1,
                bookingNumber: 'VS-BK-' + Math.floor(1000000 + Math.random() * 9000000),
                userId: currentUser ? currentUser.id : 4,
                userName: currentUser ? currentUser.name : 'Alex Johnson',
                userPhone: currentUser ? currentUser.phone : '+1-555-012-3456',
                userEmail: currentUser ? currentUser.email : 'user@voltspot.com',
                stationId: stationId,
                stationName: station ? station.name : 'VoltSpot Station',
                stationAddress: station ? station.address : '',
                stationCity: station ? station.city : '',
                chargingType: chargingType,
                bookingDate: bookingDate,
                timeSlot: timeSlot || '10:00 - 11:00',
                vehicleNumber: vehicleNumber,
                vehicleModel: vehicleModel,
                amount: amount,
                status: 'PENDING',
                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };

            db.bookings.unshift(newBooking);

            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/payment?bookingId=${newBooking.id}` });
            res.end();
        });
        return;
    }

    // -------------------------------------------------------------
    // Route 6: Payment Checkout & Simulator
    // -------------------------------------------------------------
    if (route === '/payment' || route === '/payment.jsp') {
        const bookingId = parseInt(query.bookingId);
        const booking = db.bookings.find(b => b.id === bookingId) || db.bookings[0];

        const baseAmount = booking.amount;
        const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100;
        const totalAmount = (baseAmount + taxAmount).toFixed(2);

        const html = renderHeader(currentUser, 'Checkout & Payment - VoltSpot EV', 'bookings') + `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card shadow-sm border-0 overflow-hidden">
                        <div class="card-header bg-dark text-white p-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="badge bg-success-subtle text-success mb-1">Step 2 of 2: Payment Authorization</span>
                                    <h4 class="fw-bold mb-0">Complete Your Slot Booking</h4>
                                </div>
                                <span class="badge bg-secondary font-monospace">${booking.bookingNumber}</span>
                            </div>
                        </div>

                        <div class="card-body p-4 p-md-5">
                            <div class="row g-4 mb-4">
                                <div class="col-md-5 order-md-2">
                                    <div class="p-4 bg-light rounded-3 border">
                                        <h6 class="fw-bold mb-3 border-bottom pb-2">Reservation Summary</h6>
                                        <p class="mb-1 fw-bold text-dark">${booking.stationName}</p>
                                        <p class="small text-muted mb-2">${booking.stationAddress}</p>
                                        <div class="small mb-3">
                                            <div class="d-flex justify-content-between py-1"><span class="text-muted">Type:</span><strong>${booking.chargingType} Charging</strong></div>
                                            <div class="d-flex justify-content-between py-1"><span class="text-muted">Date:</span><strong>${booking.bookingDate}</strong></div>
                                            <div class="d-flex justify-content-between py-1"><span class="text-muted">Slot:</span><strong>${booking.timeSlot}</strong></div>
                                            <div class="d-flex justify-content-between py-1"><span class="text-muted">Vehicle:</span><span>${booking.vehicleModel} (${booking.vehicleNumber})</span></div>
                                        </div>
                                        <div class="border-top pt-2 small">
                                            <div class="d-flex justify-content-between py-1"><span>Slot Fee:</span><span>₹${baseAmount.toFixed(2)}</span></div>
                                            <div class="d-flex justify-content-between py-1"><span>Tax (18% GST):</span><span>₹${taxAmount.toFixed(2)}</span></div>
                                            <div class="d-flex justify-content-between py-2 border-top mt-2 fs-5 fw-bold text-success">
                                                <span>Total Payable:</span><span>₹${totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-7 order-md-1">
                                    <form action="${CONTEXT_PATH}/process-payment" method="POST">
                                        <input type="hidden" name="bookingId" value="${booking.id}">
                                        <input type="hidden" name="totalAmount" value="${totalAmount}">
                                        <h6 class="fw-bold mb-3">Select Payment Method</h6>
                                        <div class="row g-2 mb-4">
                                            <div class="col-6">
                                                <input type="radio" class="btn-check" name="paymentMethod" id="payUPI" value="UPI" checked>
                                                <label class="btn btn-outline-secondary w-100 py-3 text-center" for="payUPI">
                                                    <i class="bi bi-qr-code-scan fs-3 text-success d-block mb-1"></i>
                                                    <span class="fw-semibold small">UPI (GPay/PhonePe/QR)</span>
                                                </label>
                                            </div>
                                            <div class="col-6">
                                                <input type="radio" class="btn-check" name="paymentMethod" id="payCard" value="CARD">
                                                <label class="btn btn-outline-secondary w-100 py-3 text-center" for="payCard">
                                                    <i class="bi bi-credit-card-2-front fs-3 text-primary d-block mb-1"></i>
                                                    <span class="fw-semibold small">RuPay / Debit Card</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div id="cardPaymentSection" class="p-3 border rounded-3 bg-light mb-4" style="display:none;">
                                            <div class="mb-3">
                                                <label class="form-label small fw-semibold">Cardholder Name</label>
                                                <input type="text" class="form-control form-control-sm" value="${currentUser ? currentUser.name : 'Alex Johnson'}">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label small fw-semibold">Card Number</label>
                                                <input type="text" class="form-control form-control-sm" value="4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242">
                                            </div>
                                            <div class="row g-2">
                                                <div class="col-6"><input type="text" class="form-control form-control-sm" value="12/28"></div>
                                                <div class="col-6"><input type="password" class="form-control form-control-sm" value="888"></div>
                                            </div>
                                        </div>

                                        <div id="upiPaymentSection" class="p-3 border rounded-3 bg-light mb-4 text-center">
                                            <p class="small text-muted mb-2">Scan QR code using Google Pay, PhonePe, Paytm, or BHIM to pay <strong>₹${totalAmount}</strong>:</p>
                                            <div class="bg-white p-3 d-inline-block rounded border shadow-sm mb-2 upi-qr-card position-relative">
                                                <div class="qr-laser-line"></div>
                                                <i class="bi bi-qr-code text-dark" style="font-size: 100px;"></i>
                                            </div>
                                            <div class="input-group input-group-sm mt-2">
                                                <span class="input-group-text">UPI ID</span>
                                                <input type="text" class="form-control" placeholder="user@okhdfcbank">
                                            </div>
                                        </div>

                                        <button type="submit" class="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm btn-shimmer">
                                            <i class="bi bi-lock-fill me-1"></i> Pay ₹${totalAmount} &amp; Confirm Booking
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 7: Process Payment & Generate Tax Invoice
    // -------------------------------------------------------------
    if (route === '/process-payment' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const bookingId = parseInt(params.bookingId);
            const paymentMethod = (params.paymentMethod || 'CARD').toUpperCase();
            const totalAmount = parseFloat(params.totalAmount || 21.24);

            const booking = db.bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = 'BOOKED';
                const txnId = 'TXN-' + Math.floor(100000000 + Math.random() * 900000000);
                const invId = 'INV-' + Math.floor(1000000 + Math.random() * 9000000);

                booking.paymentStatus = 'PAID';
                booking.paymentMethod = paymentMethod;
                booking.transactionId = txnId;
                booking.invoiceNumber = invId;

                const baseAmount = booking.amount;
                const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100;

                const newPayment = {
                    id: db.payments.length + 1,
                    bookingId: booking.id,
                    bookingNumber: booking.bookingNumber,
                    userId: booking.userId,
                    userName: booking.userName,
                    amount: totalAmount,
                    paymentMethod: paymentMethod,
                    transactionId: txnId,
                    paymentStatus: 'PAID',
                    paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
                };
                db.payments.unshift(newPayment);

                const newInvoice = {
                    id: db.invoices.length + 1,
                    invoiceNumber: invId,
                    bookingId: booking.id,
                    paymentId: newPayment.id,
                    userId: booking.userId,
                    customerName: booking.userName,
                    customerEmail: booking.userEmail,
                    customerPhone: booking.userPhone,
                    stationName: booking.stationName,
                    stationAddress: booking.stationAddress,
                    stationCity: booking.stationCity,
                    stationContact: '+1-800-555-0199',
                    chargingType: booking.chargingType,
                    bookingDate: booking.bookingDate,
                    timeSlot: booking.timeSlot,
                    vehicleNumber: booking.vehicleNumber,
                    vehicleModel: booking.vehicleModel,
                    baseAmount: baseAmount,
                    taxAmount: taxAmount,
                    totalAmount: totalAmount,
                    bookingNumber: booking.bookingNumber,
                    transactionId: txnId,
                    paymentMethod: paymentMethod,
                    invoiceDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
                };
                db.invoices.unshift(newInvoice);
            }

            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/payment-success?bookingId=${bookingId}` });
            res.end();
        });
        return;
    }

    // -------------------------------------------------------------
    // Route 8: Payment Success
    // -------------------------------------------------------------
    if (route === '/payment-success' || route === '/payment-success.jsp') {
        const bookingId = parseInt(query.bookingId);
        const booking = db.bookings.find(b => b.id === bookingId) || db.bookings[0];

        const html = renderHeader(currentUser, 'Booking Confirmed - VoltSpot EV', 'bookings') + `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-md-7 col-lg-6">
                    <div class="card shadow-sm border-0 text-center p-4 p-md-5">
                        <div class="mb-4">
                            <div class="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style="width: 80px; height: 80px;">
                                <i class="bi bi-check2-circle fs-1"></i>
                            </div>
                        </div>
                        <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold mx-auto mb-2">Slot Reserved &amp; Paid</span>
                        <h3 class="fw-bold text-dark">Charging Slot Confirmed!</h3>
                        <p class="text-muted small mb-4">Your EV charging port is locked and ready for your scheduled arrival.</p>
                        <div class="p-4 bg-light rounded-3 border text-start mb-4 small">
                            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Booking Reference:</span><strong class="font-monospace text-dark">${booking.bookingNumber}</strong></div>
                            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Station:</span><strong class="text-dark">${booking.stationName}</strong></div>
                            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Scheduled Slot:</span><strong>${booking.bookingDate} | ${booking.timeSlot}</strong></div>
                            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Charging Speed:</span><span class="badge bg-warning text-dark">${booking.chargingType}</span></div>
                            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Transaction ID:</span><span class="font-monospace">${booking.transactionId || 'TXN-CONFIRMED'}</span></div>
                            <div class="d-flex justify-content-between py-1 pt-2"><span class="fw-bold text-dark">Total Amount Paid:</span><strong class="text-success fs-6">₹${(booking.amount * 1.18).toFixed(2)}</strong></div>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="${CONTEXT_PATH}/invoice?bookingId=${booking.id}" class="btn btn-success py-2 fw-semibold">
                                <i class="bi bi-file-earmark-arrow-down-fill me-1"></i> View / Download Tax Invoice
                            </a>
                            <a href="${CONTEXT_PATH}/my-bookings" class="btn btn-outline-secondary py-2">
                                <i class="bi bi-calendar-check me-1"></i> Go to My Bookings
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 9: Tax Invoice
    // -------------------------------------------------------------
    if (route === '/invoice' || route === '/invoice.jsp') {
        const bookingId = parseInt(query.bookingId);
        const invoice = db.invoices.find(i => i.bookingId === bookingId) || db.invoices[0];

        const html = renderHeader(currentUser, `Tax Invoice ${invoice.invoiceNumber} - VoltSpot EV`, 'bookings') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4 no-print">
                <a href="${CONTEXT_PATH}/my-bookings" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i> Back to My Bookings</a>
                <button onclick="window.print()" class="btn btn-success fw-semibold"><i class="bi bi-printer-fill me-1"></i> Print / Download PDF</button>
            </div>

            <div class="invoice-box mx-auto" style="max-width: 820px;">
                <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                    <div>
                        <h3 class="fw-bold text-success mb-1"><i class="bi bi-lightning-charge-fill me-1"></i> VoltSpot EV</h3>
                        <p class="small text-muted mb-0">VoltSpot Technologies India Pvt Ltd</p>
                        <p class="small text-muted mb-0">GSTIN: 36AABCV8910M1Z5 | SAC: 998714</p>
                    </div>
                    <div class="text-end">
                        <div class="mb-2">
                            <span class="paid-stamp">PAID IN FULL</span>
                        </div>
                        <h4 class="fw-bold text-dark mb-1">TAX INVOICE</h4>
                        <div class="text-muted small">Invoice No: <strong class="text-dark font-monospace">${invoice.invoiceNumber}</strong></div>
                        <div class="text-muted small">Date: <strong>${invoice.invoiceDate}</strong></div>
                        <div class="text-muted small"><span class="badge bg-success">PAID</span></div>
                    </div>
                </div>

                <div class="row g-4 mb-4 pb-3 border-bottom">
                    <div class="col-6">
                        <h6 class="text-uppercase text-muted fw-bold small mb-2">Billed To (Customer):</h6>
                        <strong class="text-dark fs-6">${invoice.customerName}</strong>
                        <div class="small text-muted"><i class="bi bi-envelope"></i> ${invoice.customerEmail}</div>
                        <div class="small text-muted"><i class="bi bi-telephone"></i> ${invoice.customerPhone}</div>
                    </div>
                    <div class="col-6 text-end">
                        <h6 class="text-uppercase text-muted fw-bold small mb-2">Charging Facility:</h6>
                        <strong class="text-dark fs-6">${invoice.stationName}</strong>
                        <div class="small text-muted">${invoice.stationAddress}, ${invoice.stationCity}</div>
                    </div>
                </div>

                <div class="table-responsive mb-4">
                    <table class="table table-bordered mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>#</th>
                                <th>Service Description</th>
                                <th>Slot Schedule</th>
                                <th>Vehicle</th>
                                <th class="text-end">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>
                                    <strong class="text-dark">EV Charging Slot Reservation (${invoice.chargingType})</strong>
                                    <div class="small text-muted">Booking Reference: <span class="font-monospace">${invoice.bookingNumber}</span></div>
                                </td>
                                <td><div>${invoice.bookingDate}</div><small class="text-muted">${invoice.timeSlot}</small></td>
                                <td><div>${invoice.vehicleModel}</div><small class="text-muted font-monospace">${invoice.vehicleNumber}</small></td>
                                <td class="text-end fw-bold text-dark">₹${invoice.baseAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="row g-4 align-items-center mb-4">
                    <div class="col-sm-6">
                        <div class="p-3 bg-light rounded-3 border small">
                            <div class="text-muted mb-1"><strong>Payment Details:</strong></div>
                            <div>Method: <span class="badge bg-secondary">${invoice.paymentMethod}</span></div>
                            <div>Transaction ID: <span class="font-monospace text-dark">${invoice.transactionId}</span></div>
                            <div class="text-success mt-1"><i class="bi bi-shield-check"></i> Verified via Electronic Payment Gateway</div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="ms-auto" style="max-width: 280px;">
                            <div class="d-flex justify-content-between py-1 small"><span>Base Charge:</span><span>₹${invoice.baseAmount.toFixed(2)}</span></div>
                            <div class="d-flex justify-content-between py-1 small"><span>CGST (9%):</span><span>₹${(invoice.taxAmount / 2).toFixed(2)}</span></div><div class="d-flex justify-content-between py-1 small"><span>SGST (9%):</span><span>₹${(invoice.taxAmount / 2).toFixed(2)}</span></div>
                            <div class="d-flex justify-content-between py-2 border-top border-bottom mt-2 fs-5 fw-bold text-success">
                                <span>Total Paid:</span><span>₹${invoice.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="border-top pt-4 mt-4 d-flex justify-content-between align-items-end text-muted small">
                    <div>
                        <p class="mb-1"><strong>Terms &amp; Conditions:</strong></p>
                        <p class="mb-0 text-secondary" style="font-size: 0.75rem;">This is a computer-generated tax invoice and requires no physical signature.</p>
                    </div>
                    <div class="text-end font-monospace text-success fw-bold">[E-SIGNED]</div>
                </div>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 10: My Bookings
    // -------------------------------------------------------------
    if (route === '/my-bookings' || route === '/my-bookings.jsp') {
        const userBookings = db.bookings;

        let rowsHtml = userBookings.map(b => `
            <tr>
                <td><span class="font-monospace fw-bold small text-dark">${b.bookingNumber}</span><div class="text-muted opacity-75" style="font-size:0.75rem;">${b.createdAt}</div></td>
                <td><strong class="text-dark">${b.stationName}</strong><div class="text-muted small"><i class="bi bi-geo-alt"></i> ${b.stationCity}</div></td>
                <td><span class="badge ${b.chargingType === 'FAST' ? 'bg-warning text-dark' : 'bg-info text-dark'}">${b.chargingType}</span></td>
                <td><div class="fw-semibold text-dark">${b.bookingDate}</div><div class="text-muted small"><i class="bi bi-clock me-1"></i>${b.timeSlot}</div></td>
                <td><span class="small text-dark d-block">${b.vehicleModel}</span><span class="badge bg-light text-secondary border font-monospace">${b.vehicleNumber}</span></td>
                <td><strong class="text-dark">₹${b.amount.toFixed(2)}</strong></td>
                <td>
                    ${b.status === 'BOOKED' ? '<span class="badge bg-success-subtle text-success border border-success">Booked</span>' :
                      b.status === 'COMPLETED' ? '<span class="badge bg-primary-subtle text-primary border border-primary">Completed</span>' :
                      b.status === 'CANCELLED' ? '<span class="badge bg-danger-subtle text-danger border border-danger">Cancelled</span>' :
                      '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning">Pending Payment</span>'}
                </td>
                <td class="text-end">
                    <div class="d-inline-flex gap-1">
                        ${b.status === 'PENDING' ? `<a href="${CONTEXT_PATH}/payment?bookingId=${b.id}" class="btn btn-sm btn-warning text-dark fw-bold"><i class="bi bi-credit-card"></i> Pay Now</a>` : ''}
                        ${b.status === 'BOOKED' || b.status === 'COMPLETED' ? `<a href="${CONTEXT_PATH}/invoice?bookingId=${b.id}" class="btn btn-sm btn-outline-primary" title="View Tax Invoice"><i class="bi bi-receipt"></i> Invoice</a>` : ''}
                        ${b.status === 'PENDING' || b.status === 'BOOKED' ? `
                            <form action="${CONTEXT_PATH}/cancel-booking" method="POST" class="d-inline" onsubmit="return confirm('Cancel this booking?');">
                                <input type="hidden" name="bookingId" value="${b.id}">
                                <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-x-lg"></i></button>
                            </form>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        const html = renderHeader(currentUser, 'My Slot Bookings - VoltSpot EV', 'bookings') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-0">My Charging Slot Bookings</h2>
                    <small class="text-muted">Manage your charging reservations, complete pending payments, and view tax invoices</small>
                </div>
                <a href="${CONTEXT_PATH}/stations" class="btn btn-success fw-semibold"><i class="bi bi-plus-circle me-1"></i> Book New Slot</a>
            </div>

            <div class="card shadow-sm border-0 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small text-uppercase">
                            <tr>
                                <th>Ref Number</th><th>Station &amp; City</th><th>Type</th><th>Date &amp; Slot</th><th>Vehicle</th><th>Amount</th><th>Status</th><th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 11: Cancel Booking
    // -------------------------------------------------------------
    if (route === '/cancel-booking' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const bookingId = parseInt(params.bookingId);
            const b = db.bookings.find(bk => bk.id === bookingId);
            if (b) b.status = 'CANCELLED';
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/my-bookings` });
            res.end();
        });
        return;
    }

    // -------------------------------------------------------------
    // Route 12: Operator Dashboard
    // -------------------------------------------------------------
    if (route === '/operator/dashboard') {
        const myStations = db.stations.filter(s => s.operatorId === 2 || s.operatorId === (currentUser ? currentUser.id : 2));
        const approvedCount = myStations.filter(s => s.status === 'APPROVED').length;
        const pendingCount = myStations.filter(s => s.status === 'PENDING').length;
        const activeBookings = db.bookings.filter(b => b.status === 'BOOKED').length;
        const completedBookings = db.bookings.filter(b => b.status === 'COMPLETED').length;
        const totalRevenue = db.payments.reduce((acc, p) => acc + p.amount, 0);

        const html = renderHeader(currentUser, 'Operator Dashboard - VoltSpot EV', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management Portal</span>
                    <h2 class="fw-bold mb-0">Charging Hubs Overview</h2>
                    <small class="text-muted">Welcome, ${currentUser ? currentUser.name : 'VoltPower Operator'}</small>
                </div>
                <div class="d-flex gap-2">
                    <a href="${CONTEXT_PATH}/operator/add-station" class="btn btn-success fw-semibold"><i class="bi bi-plus-circle me-1"></i> Register New Station</a>
                    <a href="${CONTEXT_PATH}/operator/bookings" class="btn btn-outline-primary fw-semibold"><i class="bi bi-calendar-check me-1"></i> Customer Bookings</a>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-3 col-sm-6">
                    <div class="card p-3 border-0 shadow-sm bg-white">
                        <small class="text-muted fw-semibold d-block">My Stations</small>
                        <h3 class="fw-bold mb-0 text-dark">${myStations.length}</h3>
                        <small class="text-success">${approvedCount} Live &bull; ${pendingCount} Pending</small>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="card p-3 border-0 shadow-sm bg-white">
                        <small class="text-muted fw-semibold d-block">Active Booked Slots</small>
                        <h3 class="fw-bold mb-0 text-success">${activeBookings}</h3>
                        <small class="text-muted">Currently reserved</small>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="card p-3 border-0 shadow-sm bg-white">
                        <small class="text-muted fw-semibold d-block">Completed Sessions</small>
                        <h3 class="fw-bold mb-0 text-dark">${completedBookings}</h3>
                        <small class="text-info">Fully charged</small>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="card p-3 border-0 shadow-sm bg-white">
                        <small class="text-muted fw-semibold d-block">Billed Revenue</small>
                        <h3 class="fw-bold mb-0 text-success">₹${totalRevenue.toFixed(2)}</h3>
                        <small class="text-muted">Electronic settlements</small>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card shadow-sm border-0">
                        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-list-check me-2 text-primary"></i> Recent Customer Bookings</h5>
                            <a href="${CONTEXT_PATH}/operator/bookings" class="btn btn-sm btn-outline-primary">View All</a>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light small">
                                    <tr><th>Ref</th><th>Station</th><th>Driver</th><th>Slot</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    ${db.bookings.slice(0, 5).map(b => `
                                        <tr>
                                            <td><span class="font-monospace small fw-bold">${b.bookingNumber}</span></td>
                                            <td>${b.stationName}</td>
                                            <td>${b.userName}</td>
                                            <td><span class="badge bg-light text-dark border">${b.timeSlot}</span></td>
                                            <td><span class="badge ${b.status === 'BOOKED' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}">${b.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white py-3">
                            <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-star-fill text-warning me-2"></i> Recent Feedback</h5>
                        </div>
                        <div class="card-body p-3">
                            ${db.feedbacks.slice(0, 3).map(fb => `
                                <div class="border-bottom pb-2 mb-2">
                                    <div class="d-flex justify-content-between"><strong class="small">${fb.userName}</strong><span class="text-warning small">${'★'.repeat(fb.rating)}</span></div>
                                    <p class="small text-muted mb-1">"${fb.comments}"</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 13: Operator Stations Manager
    // -------------------------------------------------------------
    if (route === '/operator/stations') {
        const myStations = db.stations;

        let stationsHtml = myStations.map(s => {
            const fast = s.chargingTypes.find(t => t.chargingType === 'FAST');
            const normal = s.chargingTypes.find(t => t.chargingType === 'NORMAL');

            return `
                <div class="col-lg-6">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-light text-dark border">${s.city}</span>
                                <span class="badge ${s.status === 'APPROVED' ? 'bg-success-subtle text-success border border-success' : (s.status === 'REJECTED' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis border border-warning')}">
                                    ${s.status === 'APPROVED' ? 'Approved & Live' : (s.status === 'REJECTED' ? 'Rejected' : 'Pending Admin Approval')}
                                </span>
                            </div>
                            <h4 class="fw-bold text-dark mb-1">${s.name}</h4>
                            <p class="text-muted small mb-3"><i class="bi bi-pin-map text-secondary me-1"></i> ${s.address}</p>
                            <div class="row g-2 mb-3 mt-auto">
                                <div class="col-6">
                                    <div class="p-2 bg-light rounded border small">
                                        <div class="fw-bold text-warning-emphasis">FAST CHARGING</div>
                                        <div class="fw-bold fs-6 text-dark">₹${fast ? fast.pricePerSlot.toFixed(2) : '18.00'}/slot</div>
                                        <div class="text-muted">${fast ? fast.powerKw : 150} kW &bull; ${fast ? fast.totalCapacity : 4} ports</div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-2 bg-light rounded border small">
                                        <div class="fw-bold text-primary">NORMAL CHARGING</div>
                                        <div class="fw-bold fs-6 text-dark">₹${normal ? normal.pricePerSlot.toFixed(2) : '8.50'}/slot</div>
                                        <div class="text-muted">${normal ? normal.powerKw : 22} kW &bull; ${normal ? normal.totalCapacity : 8} ports</div>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                                <small class="text-muted font-monospace">GPS: ${s.latitude}, ${s.longitude}</small>
                                <a href="${CONTEXT_PATH}/station-detail?id=${s.id}" class="btn btn-sm btn-outline-success">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const html = renderHeader(currentUser, 'My Stations - Operator Portal', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management</span>
                    <h2 class="fw-bold mb-0">My Charging Stations</h2>
                    <small class="text-muted">Manage stations, slot capacity, and pricing models</small>
                </div>
                <a href="${CONTEXT_PATH}/operator/add-station" class="btn btn-success fw-semibold"><i class="bi bi-plus-circle me-1"></i> Register New Station</a>
            </div>
            <div class="row g-4">${stationsHtml}</div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 14: Operator Register Station (GET & POST)
    // -------------------------------------------------------------
    if (route === '/operator/add-station') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const p = querystring.parse(body);
                const newStation = {
                    id: db.stations.length + 1,
                    operatorId: currentUser ? currentUser.id : 2,
                    operatorName: currentUser ? currentUser.name : 'VoltPower India Operators Pvt Ltd',
                    name: p.name || 'VoltSpot Koramangala Fast Hub',
                    address: p.address || '80 Feet Road, 4th Block, Koramangala',
                    city: p.city || 'Bengaluru',
                    contactNumber: p.contactNumber || '+91-80-2553-9090',
                    latitude: parseFloat(p.latitude || 12.9352),
                    longitude: parseFloat(p.longitude || 77.6245),
                    openingTime: p.openingTime || '06:00',
                    closingTime: p.closingTime || '23:30',
                    status: 'PENDING', // Placed into Admin Review Queue
                    rejectionReason: null,
                    chargingTypes: [
                        { chargingType: 'FAST', totalCapacity: parseInt(p.fastCapacity || 6), powerKw: parseFloat(p.fastPower || 150), pricePerSlot: parseFloat(p.fastPrice || 280) },
                        { chargingType: 'NORMAL', totalCapacity: parseInt(p.normalCapacity || 10), powerKw: parseFloat(p.normalPower || 22), pricePerSlot: parseFloat(p.normalPrice || 95) }
                    ]
                };

                db.stations.push(newStation);
                res.writeHead(302, { 'Location': `${CONTEXT_PATH}/operator/stations` });
                res.end();
            });
            return;
        }

        const html = renderHeader(currentUser, 'Register New Charging Station - VoltSpot EV', '') + `
        <div class="container py-4">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Portal</span>
                            <h2 class="fw-bold mb-0">Register New EV Charging Station</h2>
                            <small class="text-muted">Define station details, configure FAST &amp; NORMAL slot capacities, and pick GPS coordinates</small>
                        </div>
                        <a href="${CONTEXT_PATH}/operator/stations" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i> Back to Stations</a>
                    </div>

                    <div class="card shadow-sm border-0">
                        <div class="card-body p-4 p-md-5">
                            <div class="alert alert-info d-flex align-items-center mb-4">
                                <i class="bi bi-info-circle-fill fs-4 me-3"></i>
                                <div><strong>Admin Approval Notice:</strong> Newly registered stations are automatically placed in the Administrator Review Queue with status <code>PENDING</code>. Once approved by the Admin, the station becomes visible for public search and slot booking.</div>
                            </div>

                            <form action="${CONTEXT_PATH}/operator/add-station" method="POST">
                                <h5 class="fw-bold mb-3 border-bottom pb-2">1. Station Information</h5>
                                <div class="row g-3 mb-4">
                                    <div class="col-md-8"><label class="form-label fw-semibold">Station Name</label><input type="text" name="name" class="form-control" value="VoltSpot Koramangala Supercharger Hub" required></div>
                                    <div class="col-md-4"><label class="form-label fw-semibold">City</label><input type="text" name="city" class="form-control" value="Bengaluru" required></div>
                                    <div class="col-md-8"><label class="form-label fw-semibold">Street Address</label><input type="text" name="address" class="form-control" value="80 Feet Road, 4th Block, Koramangala" required></div>
                                    <div class="col-md-4"><label class="form-label fw-semibold">Contact Phone</label><input type="tel" name="contactNumber" class="form-control" value="+91-80-2553-9090" required></div>
                                    <div class="col-md-6"><label class="form-label fw-semibold">Opening Time</label><input type="time" name="openingTime" class="form-control" value="06:00" required></div>
                                    <div class="col-md-6"><label class="form-label fw-semibold">Closing Time</label><input type="time" name="closingTime" class="form-control" value="23:30" required></div>
                                </div>

                                <h5 class="fw-bold mb-3 border-bottom pb-2">2. Geographical Location (Google Maps &amp; GPS Coordinates)</h5>
                                <p class="text-muted small">Search for a landmark or drag the marker on the Google Map below to set coordinates:</p>
                                <div class="input-group mb-2">
                                    <span class="input-group-text bg-white"><i class="bi bi-search text-success"></i></span>
                                    <input type="text" id="stationAddressSearch" class="form-control" placeholder="Search address or area in Google Maps (e.g. Indiranagar Bengaluru, Hitec City Hyderabad)...">
                                </div>
                                <div class="card mb-3 overflow-hidden border"><div id="pickerMap" style="height: 300px; width: 100%;"></div></div>
                                <div class="row g-3 mb-4">
                                    <div class="col-md-6"><label class="form-label fw-semibold">Latitude</label><input type="text" id="stationLat" name="latitude" class="form-control" value="12.971600" required></div>
                                    <div class="col-md-6"><label class="form-label fw-semibold">Longitude</label><input type="text" id="stationLng" name="longitude" class="form-control" value="77.594600" required></div>
                                </div>

                                <h5 class="fw-bold mb-3 border-bottom pb-2">3. Charging Capacities &amp; Pricing</h5>
                                <div class="row g-4 mb-4">
                                    <div class="col-md-6">
                                        <div class="p-3 bg-light rounded-3 border">
                                            <h6 class="fw-bold mb-3 text-warning-emphasis">FAST CHARGING (DC)</h6>
                                            <div class="mb-3"><label class="form-label small fw-semibold">Capacity (Ports)</label><input type="number" name="fastCapacity" class="form-control" value="4" required></div>
                                            <div class="mb-3"><label class="form-label small fw-semibold">Power Output (kW)</label><input type="number" step="0.1" name="fastPower" class="form-control" value="150.0" required></div>
                                            <div><label class="form-label small fw-semibold">Price Per 1-Hour Slot (₹ INR)</label><input type="number" step="0.01" name="fastPrice" class="form-control" value="280.00" required></div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="p-3 bg-light rounded-3 border">
                                            <h6 class="fw-bold mb-3 text-primary">NORMAL CHARGING (AC)</h6>
                                            <div class="mb-3"><label class="form-label small fw-semibold">Capacity (Ports)</label><input type="number" name="normalCapacity" class="form-control" value="8" required></div>
                                            <div class="mb-3"><label class="form-label small fw-semibold">Power Output (kW)</label><input type="number" step="0.1" name="normalPower" class="form-control" value="22.0" required></div>
                                            <div><label class="form-label small fw-semibold">Price Per 1-Hour Slot (₹ INR)</label><input type="number" step="0.01" name="normalPrice" class="form-control" value="95.00" required></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                                    <a href="${CONTEXT_PATH}/operator/stations" class="btn btn-outline-secondary px-4">Cancel</a>
                                    <button type="submit" class="btn btn-success px-5 fw-bold"><i class="bi bi-check-circle me-1"></i> Submit Station for Admin Approval</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
        document.addEventListener('DOMContentLoaded', function () {
            initCoordinatePicker('pickerMap', 'stationLat', 'stationLng', 12.9716, 77.5946);
        });
        </script>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 15: Operator Bookings & Feedback
    // -------------------------------------------------------------
    if (route === '/operator/bookings') {
        const rows = db.bookings.map(b => `
            <tr>
                <td><span class="font-monospace small fw-bold">${b.bookingNumber}</span></td>
                <td>${b.stationName}</td>
                <td><div class="small fw-semibold">${b.userName}</div><small class="text-muted">${b.userPhone}</small></td>
                <td><span class="badge ${b.chargingType === 'FAST' ? 'bg-warning text-dark' : 'bg-info text-dark'}">${b.chargingType}</span></td>
                <td><div class="small fw-semibold">${b.bookingDate}</div><span class="badge bg-light text-dark border small">${b.timeSlot}</span></td>
                <td><span class="badge ${b.status === 'BOOKED' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}">${b.status}</span></td>
                <td class="text-end">
                    <form action="${CONTEXT_PATH}/operator/update-booking-status" method="POST" class="d-inline-flex gap-1">
                        <input type="hidden" name="bookingId" value="${b.id}">
                        <select name="status" class="form-select form-select-sm" style="width: auto;">
                            <option value="PENDING" ${b.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                            <option value="BOOKED" ${b.status === 'BOOKED' ? 'selected' : ''}>Booked</option>
                            <option value="COMPLETED" ${b.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                            <option value="CANCELLED" ${b.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button type="submit" class="btn btn-sm btn-primary"><i class="bi bi-check-lg"></i></button>
                    </form>
                </td>
            </tr>
        `).join('');

        const html = renderHeader(currentUser, 'Customer Bookings - Operator Portal', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management</span>
                    <h2 class="fw-bold mb-0">Customer Slot Bookings</h2>
                    <small class="text-muted">Monitor and update slot reservations across your stations</small>
                </div>
            </div>
            <div class="card shadow-sm border-0 overflow-hidden">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr><th>Ref</th><th>Station</th><th>Customer</th><th>Type</th><th>Date &amp; Slot</th><th>Status</th><th class="text-end">Update</th></tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/operator/update-booking-status' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const bookingId = parseInt(params.bookingId);
            const b = db.bookings.find(bk => bk.id === bookingId);
            if (b) b.status = params.status;
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/operator/bookings` });
            res.end();
        });
        return;
    }

    if (route === '/operator/feedback') {
        const feedbacksHtml = db.feedbacks.map(fb => `
            <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-light text-dark border">${fb.stationName}</span>
                            <span class="text-warning small">${'★'.repeat(fb.rating)}</span>
                        </div>
                        <h6 class="fw-bold text-dark mt-2 mb-1">${fb.userName}</h6>
                        <p class="text-muted small mb-3">"${fb.comments}"</p>
                        <small class="text-secondary opacity-75">${fb.createdAt}</small>
                    </div>
                </div>
            </div>
        `).join('');

        const html = renderHeader(currentUser, 'Customer Reviews - Operator Portal', '') + `
        <div class="container py-4">
            <h2 class="fw-bold mb-4">Customer Ratings &amp; Reviews</h2>
            <div class="row g-4">${feedbacksHtml}</div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 16: Admin Dashboard & Pending Queue
    // -------------------------------------------------------------
    if (route === '/admin/dashboard') {
        const pendingStations = db.stations.filter(s => s.status === 'PENDING');
        const approvedStations = db.stations.filter(s => s.status === 'APPROVED');
        const totalRevenue = db.payments.reduce((acc, p) => acc + p.amount, 0);

        const html = renderHeader(currentUser, 'Administrator Dashboard - VoltSpot EV', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill">System Administrator Hub</span>
                    <h2 class="fw-bold mb-0">Platform Overview &amp; Analytics</h2>
                    <small class="text-muted">Master control for stations, users, reservations, and revenues</small>
                </div>
                <div class="d-flex gap-2">
                    <a href="${CONTEXT_PATH}/admin/pending-stations" class="btn btn-warning text-dark fw-bold position-relative">
                        <i class="bi bi-patch-check-fill me-1"></i> Station Approval Queue
                        ${pendingStations.length > 0 ? `<span class="badge bg-danger ms-1">${pendingStations.length}</span>` : ''}
                    </a>
                    <a href="${CONTEXT_PATH}/admin/reports" class="btn btn-outline-secondary"><i class="bi bi-file-earmark-bar-graph me-1"></i> Generate Reports</a>
                </div>
            </div>

            <div class="row g-3 mb-4 text-center">
                <div class="col-md-2 col-6"><div class="card p-3 border-0 shadow-sm"><i class="bi bi-people-fill text-primary fs-3 mb-1"></i><h3 class="fw-bold mb-0">${db.users.filter(u => u.role === 'USER').length}</h3><small class="text-muted">EV Drivers</small></div></div>
                <div class="col-md-2 col-6"><div class="card p-3 border-0 shadow-sm"><i class="bi bi-building-fill text-info fs-3 mb-1"></i><h3 class="fw-bold mb-0">${db.users.filter(u => u.role === 'OPERATOR').length}</h3><small class="text-muted">Operators</small></div></div>
                <div class="col-md-2 col-6"><div class="card p-3 border-0 shadow-sm"><i class="bi bi-ev-station-fill text-success fs-3 mb-1"></i><h3 class="fw-bold mb-0 text-success">${approvedStations.length}</h3><small class="text-muted">Live Stations</small></div></div>
                <div class="col-md-2 col-6"><div class="card p-3 border-0 shadow-sm"><i class="bi bi-hourglass-split text-warning fs-3 mb-1"></i><h3 class="fw-bold mb-0 text-warning">${pendingStations.length}</h3><small class="text-muted">Pending Review</small></div></div>
                <div class="col-md-2 col-6"><div class="card p-3 border-0 shadow-sm"><i class="bi bi-calendar-check-fill text-primary fs-3 mb-1"></i><h3 class="fw-bold mb-0">${db.bookings.length}</h3><small class="text-muted">Total Bookings</small></div></div>
                <div class="col-md-2 col-6"><div class="card p-3 border-0 shadow-sm"><i class="bi bi-cash-stack text-success fs-3 mb-1"></i><h3 class="fw-bold mb-0 text-success">₹${totalRevenue.toFixed(2)}</h3><small class="text-muted">Gross Revenue</small></div></div>
            </div>

            <!-- Pending Review Table -->
            ${pendingStations.length > 0 ? `
                <div class="card shadow-sm border-warning mb-4">
                    <div class="card-header bg-warning bg-opacity-25 py-3 d-flex justify-content-between align-items-center">
                        <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-exclamation-circle-fill text-warning me-2"></i> Stations Pending Administrator Approval (${pendingStations.length})</h5>
                        <a href="${CONTEXT_PATH}/admin/pending-stations" class="btn btn-sm btn-dark">Open Approval Queue</a>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light small"><tr><th>Station</th><th>Operator</th><th>City</th><th class="text-end">Decision</th></tr></thead>
                            <tbody>
                                ${pendingStations.map(ps => `
                                    <tr>
                                        <td><strong>${ps.name}</strong></td>
                                        <td>${ps.operatorName}</td>
                                        <td>${ps.city}</td>
                                        <td class="text-end">
                                            <form action="${CONTEXT_PATH}/admin/approve-station" method="POST" class="d-inline">
                                                <input type="hidden" name="stationId" value="${ps.id}">
                                                <button type="submit" class="btn btn-sm btn-success fw-semibold"><i class="bi bi-check-circle me-1"></i> Approve</button>
                                            </form>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}

            <div class="row g-4">
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white py-3"><h5 class="fw-bold mb-0 text-dark"><i class="bi bi-trophy-fill text-warning me-2"></i> Top Performing Stations</h5></div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light small"><tr><th>Station</th><th>City</th><th>Bookings</th></tr></thead>
                                <tbody>
                                    ${approvedStations.slice(0, 4).map(s => `<tr><td><strong>${s.name}</strong></td><td>${s.city}</td><td><span class="badge bg-success-subtle text-success">Active Hub</span></td></tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white py-3"><h5 class="fw-bold mb-0 text-dark"><i class="bi bi-clock-history text-primary me-2"></i> Recent Platform Bookings</h5></div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light small"><tr><th>Ref</th><th>User</th><th>Station</th><th>Status</th></tr></thead>
                                <tbody>
                                    ${db.bookings.slice(0, 4).map(b => `<tr><td><span class="font-monospace small">${b.bookingNumber}</span></td><td>${b.userName}</td><td>${b.stationName}</td><td><span class="badge bg-success-subtle text-success">${b.status}</span></td></tr>`).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/admin/pending-stations') {
        const pendingStations = db.stations.filter(s => s.status === 'PENDING');

        const html = renderHeader(currentUser, 'Station Approvals - Admin Portal', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span class="badge bg-warning text-dark fw-semibold px-3 py-1 rounded-pill">Verification Queue</span>
                    <h2 class="fw-bold mb-0">Newly Registered Stations Pending Approval</h2>
                    <small class="text-muted">Review operator submissions before granting visibility to public EV users</small>
                </div>
            </div>

            ${pendingStations.length === 0 ? `
                <div class="card p-5 text-center border-0 shadow-sm bg-white">
                    <div class="text-success display-4 mb-3"><i class="bi bi-check-circle-fill"></i></div>
                    <h4>All Caught Up!</h4>
                    <p class="text-muted">There are currently no charging stations awaiting administrator review.</p>
                </div>
            ` : `
                <div class="row g-4">
                    ${pendingStations.map(s => `
                        <div class="col-lg-6">
                            <div class="card border-warning shadow-sm h-100">
                                <div class="card-header bg-warning bg-opacity-10 py-3 d-flex justify-content-between align-items-center">
                                    <span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i> Awaiting Approval</span>
                                </div>
                                <div class="card-body p-4 d-flex flex-column">
                                    <h4 class="fw-bold text-dark mb-1">${s.name}</h4>
                                    <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${s.address}, <strong>${s.city}</strong></p>
                                    <div class="p-3 bg-light rounded-3 border small mb-3">
                                        <div><strong>Operator:</strong> ${s.operatorName}</div>
                                        <div><strong>Contact:</strong> ${s.contactNumber}</div>
                                        <div><strong>Hours:</strong> ${s.openingTime} - ${s.closingTime}</div>
                                    </div>
                                    <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-auto">
                                        <form action="${CONTEXT_PATH}/admin/reject-station" method="POST" class="d-inline">
                                            <input type="hidden" name="stationId" value="${s.id}">
                                            <button type="submit" class="btn btn-outline-danger px-4"><i class="bi bi-x-circle me-1"></i> Reject</button>
                                        </form>
                                        <form action="${CONTEXT_PATH}/admin/approve-station" method="POST" class="d-inline">
                                            <input type="hidden" name="stationId" value="${s.id}">
                                            <button type="submit" class="btn btn-success px-4 fw-bold"><i class="bi bi-check-circle me-1"></i> Approve &amp; Publish</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/admin/approve-station' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const stationId = parseInt(params.stationId);
            const s = db.stations.find(st => st.id === stationId);
            if (s) s.status = 'APPROVED';
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/admin/pending-stations` });
            res.end();
        });
        return;
    }

    if (route === '/admin/reject-station' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const stationId = parseInt(params.stationId);
            const s = db.stations.find(st => st.id === stationId);
            if (s) s.status = 'REJECTED';
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/admin/pending-stations` });
            res.end();
        });
        return;
    }

    // -------------------------------------------------------------
    // Route 17: Admin Stations, Users, Bookings, Payments, Reports
    // -------------------------------------------------------------
    if (route === '/admin/stations') {
        const rows = db.stations.map(s => `
            <tr>
                <td>#${s.id}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.operatorName}</td>
                <td>${s.address}, ${s.city}</td>
                <td><span class="badge ${s.status === 'APPROVED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}">${s.status}</span></td>
                <td class="text-end">
                    <form action="${CONTEXT_PATH}/admin/delete-station" method="POST" class="d-inline" onsubmit="return confirm('Delete station: ${s.name}?');">
                        <input type="hidden" name="stationId" value="${s.id}">
                        <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </form>
                </td>
            </tr>
        `).join('');

        const html = renderHeader(currentUser, 'Manage All Stations - Admin Portal', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold mb-0">Manage All Charging Stations</h2>
                <a href="${CONTEXT_PATH}/admin/pending-stations" class="btn btn-warning text-dark fw-semibold"><i class="bi bi-patch-check-fill me-1"></i> Pending Approvals</a>
            </div>
            <div class="card shadow-sm border-0 overflow-hidden">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase"><tr><th>ID</th><th>Station</th><th>Operator</th><th>Location</th><th>Status</th><th class="text-end">Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/admin/delete-station' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const stationId = parseInt(params.stationId);
            const idx = db.stations.findIndex(s => s.id === stationId);
            if (idx !== -1) db.stations.splice(idx, 1);
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/admin/stations` });
            res.end();
        });
        return;
    }

    if (route === '/admin/users') {
        const rows = db.users.map(u => `
            <tr>
                <td>#${u.id}</td>
                <td><strong>${u.name}</strong></td>
                <td><span class="badge ${u.role === 'ADMIN' ? 'bg-danger' : (u.role === 'OPERATOR' ? 'bg-primary' : 'bg-success')}">${u.role}</span></td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td><span class="badge ${u.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-secondary'}">${u.status}</span></td>
                <td class="text-end">
                    <form action="${CONTEXT_PATH}/admin/toggle-user-status" method="POST" class="d-inline">
                        <input type="hidden" name="userId" value="${u.id}">
                        <input type="hidden" name="status" value="${u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}">
                        <button type="submit" class="btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}">
                            ${u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                    </form>
                </td>
            </tr>
        `).join('');

        const html = renderHeader(currentUser, 'Manage Users - Admin Portal', '') + `
        <div class="container py-4">
            <h2 class="fw-bold mb-4">Manage User Accounts</h2>
            <div class="card shadow-sm border-0 overflow-hidden">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase"><tr><th>ID</th><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Status</th><th class="text-end">Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/admin/toggle-user-status' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const userId = parseInt(params.userId);
            const u = db.users.find(usr => usr.id === userId);
            if (u) u.status = params.status;
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/admin/users` });
            res.end();
        });
        return;
    }

    if (route === '/admin/bookings') {
        const rows = db.bookings.map(b => `
            <tr>
                <td><span class="font-monospace small fw-bold">${b.bookingNumber}</span></td>
                <td><strong>${b.userName}</strong><div class="small text-muted">${b.userEmail}</div></td>
                <td>${b.stationName} (${b.stationCity})</td>
                <td><span class="badge ${b.chargingType === 'FAST' ? 'bg-warning text-dark' : 'bg-info text-dark'}">${b.chargingType}</span></td>
                <td>${b.bookingDate} &bull; ${b.timeSlot}</td>
                <td><strong>₹${b.amount.toFixed(2)}</strong></td>
                <td><span class="badge ${b.status === 'BOOKED' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}">${b.status}</span></td>
            </tr>
        `).join('');

        const html = renderHeader(currentUser, 'All Bookings - Admin Portal', '') + `
        <div class="container py-4">
            <h2 class="fw-bold mb-4">System-Wide Slot Reservations</h2>
            <div class="card shadow-sm border-0 overflow-hidden">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase"><tr><th>Ref</th><th>Customer</th><th>Station</th><th>Type</th><th>Slot</th><th>Fee</th><th>Status</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/admin/payments') {
        const totalRevenue = db.payments.reduce((acc, p) => acc + p.amount, 0);
        const rows = db.payments.map(p => `
            <tr>
                <td><span class="font-monospace fw-bold small text-dark">${p.transactionId}</span></td>
                <td><span class="font-monospace small">${p.bookingNumber}</span></td>
                <td><strong>${p.userName}</strong></td>
                <td><strong class="text-success">₹${p.amount.toFixed(2)}</strong></td>
                <td><span class="badge bg-secondary">${p.paymentMethod}</span></td>
                <td><small class="text-muted">${p.paymentDate}</small></td>
                <td><span class="badge bg-success-subtle text-success">PAID</span></td>
            </tr>
        `).join('');

        const html = renderHeader(currentUser, 'Payments Ledger - Admin Portal', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold mb-0">Payments &amp; Transactions Ledger</h2>
                <h3 class="fw-bold text-success mb-0">Total: ₹${totalRevenue.toFixed(2)}</h3>
            </div>
            <div class="card shadow-sm border-0 overflow-hidden">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase"><tr><th>Txn ID</th><th>Booking Ref</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/admin/feedback') {
        const rows = db.feedbacks.map(fb => `
            <tr>
                <td><strong>${fb.stationName}</strong></td>
                <td>${fb.userName}</td>
                <td><span class="text-warning small">${'★'.repeat(fb.rating)}</span></td>
                <td><p class="small text-muted mb-0">"${fb.comments}"</p></td>
                <td><small class="text-muted">${fb.createdAt}</small></td>
                <td class="text-end">
                    <form action="${CONTEXT_PATH}/admin/delete-feedback" method="POST" class="d-inline" onsubmit="return confirm('Delete review?');">
                        <input type="hidden" name="id" value="${fb.id}">
                        <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </form>
                </td>
            </tr>
        `).join('');

        const html = renderHeader(currentUser, 'Moderate Feedback - Admin Portal', '') + `
        <div class="container py-4">
            <h2 class="fw-bold mb-4">Customer Ratings &amp; Reviews Moderation</h2>
            <div class="card shadow-sm border-0 overflow-hidden">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase"><tr><th>Station</th><th>Driver</th><th>Rating</th><th>Comments</th><th>Date</th><th class="text-end">Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/admin/delete-feedback' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = querystring.parse(body);
            const id = parseInt(params.id);
            const idx = db.feedbacks.findIndex(f => f.id === id);
            if (idx !== -1) db.feedbacks.splice(idx, 1);
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/admin/feedback` });
            res.end();
        });
        return;
    }

    if (route === '/admin/reports') {
        const totalRevenue = db.payments.reduce((acc, p) => acc + p.amount, 0);

        const html = renderHeader(currentUser, 'Reports & Analytics - Admin Portal', '') + `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4 no-print">
                <h2 class="fw-bold mb-0">System Utilization &amp; Revenue Reports</h2>
                <button onclick="window.print()" class="btn btn-success fw-semibold"><i class="bi bi-printer me-1"></i> Print / Export Report</button>
            </div>

            <div class="card p-4 border shadow-sm mb-4 bg-white">
                <h4 class="fw-bold text-success mb-1"><i class="bi bi-lightning-charge-fill me-1"></i> VoltSpot EV System Telemetry Report</h4>
                <p class="small text-muted mb-4">Generated on: ${new Date().toLocaleString()}</p>
                <div class="row g-3 mb-4 text-center">
                    <div class="col-md-3 col-6"><div class="p-3 border rounded bg-light"><small class="text-muted d-block">Platform Drivers</small><h3 class="fw-bold text-dark">${db.users.filter(u => u.role === 'USER').length}</h3></div></div>
                    <div class="col-md-3 col-6"><div class="p-3 border rounded bg-light"><small class="text-muted d-block">Approved Stations</small><h3 class="fw-bold text-success">${db.stations.filter(s => s.status === 'APPROVED').length}</h3></div></div>
                    <div class="col-md-3 col-6"><div class="p-3 border rounded bg-light"><small class="text-muted d-block">Total Reservations</small><h3 class="fw-bold text-primary">${db.bookings.length}</h3></div></div>
                    <div class="col-md-3 col-6"><div class="p-3 border rounded bg-light"><small class="text-muted d-block">Gross Billed Volume</small><h3 class="fw-bold text-success">₹${totalRevenue.toFixed(2)}</h3></div></div>
                </div>

                <h5 class="fw-bold mb-3">Station Utilization Ranking</h5>
                <table class="table table-bordered mb-0">
                    <thead class="table-light small"><tr><th>Station</th><th>City</th><th>Status</th></tr></thead>
                    <tbody>
                        ${db.stations.map(s => `<tr><td><strong>${s.name}</strong></td><td>${s.city}</td><td><span class="badge bg-success-subtle text-success">${s.status}</span></td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // -------------------------------------------------------------
    // Route 18: Authentication & Role Switcher
    // -------------------------------------------------------------
    if (route === '/login.jsp' || route === '/login') {
        const html = renderHeader(null, 'Sign In - VoltSpot EV India (₹)', '') + `
        <div class="antigravity-login-wrapper">
            <!-- Centered Flexbox & Grid Container (Perfect Horizontal & Vertical Centering) -->
            <div class="login-center-container">
                <!-- 3. Glassmorphic Login Card with High-Contrast Adjusted Typography -->
                <div class="card antigravity-login-card mx-auto">
                    <div class="antigravity-glow-bar"></div>
                    <div class="card-body p-4 p-md-5">
                    
                    <!-- Header with Adjusted Contrast -->
                    <div class="text-center mb-4">
                        <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-2" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);">
                            <i class="bi bi-lightning-charge-fill fs-2" style="color: #10b981;"></i>
                        </div>
                        <h3 class="fw-bold mb-1">Volt<span style="color: #34d399;">Spot</span> EV India</h3>
                        <p class="subtitle mb-2">Real-Time Station Discovery &amp; Slot Booking (₹ / INR)</p>
                        <div class="antigravity-engine-badge">
                            <i class="bi bi-cpu"></i>
                            <span>Antigravity Physics Active</span>
                        </div>
                    </div>

                    <!-- Particle Palette Switcher -->
                    <div class="d-flex align-items-center justify-content-between mb-3 px-1">
                        <span class="small fw-bold" style="color: #94a3b8; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;">Particle Theme:</span>
                        <div class="btn-group btn-group-sm palette-btn-group" role="group">
                            <button type="button" class="btn btn-outline-success active" id="btnPaletteEmerald" onclick="switchPalette('emerald')">
                                <i class="bi bi-lightning"></i> Emerald ⚡
                            </button>
                            <button type="button" class="btn btn-outline-info" id="btnPaletteCosmic" onclick="switchPalette('cosmic')">
                                <i class="bi bi-stars"></i> Cosmic 🔥
                            </button>
                        </div>
                    </div>

                    <form action="${CONTEXT_PATH}/auth" method="POST">
                        <input type="hidden" name="action" value="login">
                        <input type="hidden" name="redirect" value="${CONTEXT_PATH}/home">

                        <!-- Email Input with High Contrast -->
                        <div class="mb-3">
                            <label class="form-label">Email Address</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-envelope-at-fill"></i></span>
                                <input type="email" name="email" id="loginEmail" class="form-control" placeholder="user@voltspot.in" value="user@voltspot.com" required>
                            </div>
                        </div>

                        <!-- Password Input with High Contrast -->
                        <div class="mb-4">
                            <label class="form-label">Password</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-shield-lock-fill"></i></span>
                                <input type="password" name="password" id="loginPassword" class="form-control" placeholder="Enter password" value="user123" required>
                            </div>
                        </div>

                        <button type="submit" class="btn antigravity-submit-btn w-100 py-2 mb-3">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to VoltSpot (Proceed to Home)
                        </button>
                    </form>

                    <!-- 3. One-Click Instant Demo Profiles with Adjusted Text Contrast -->
                    <div class="pt-3 border-top" style="border-color: rgba(51, 65, 85, 0.7) !important;">
                        <p class="small mb-2 fw-bold text-center" style="color: #94a3b8; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase;">
                            1-Click Instant Demo Login (Navigates to Home Landing):
                        </p>
                        <div class="d-flex flex-column gap-2">
                            <a href="${CONTEXT_PATH}/auth?action=switch&role=ADMIN&redirect=${encodeURIComponent(CONTEXT_PATH + '/home')}" class="demo-account-chip">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-shield-shaded text-danger fs-5"></i>
                                    <div>
                                        <div class="fw-bold small text-white">Central Administrator</div>
                                        <div class="text-white-50" style="font-size: 0.7rem;">Approval authority, audits, reports</div>
                                    </div>
                                </div>
                                <span class="badge bg-danger-subtle text-danger border border-danger small">Admin</span>
                            </a>

                            <a href="${CONTEXT_PATH}/auth?action=switch&role=OPERATOR&redirect=${encodeURIComponent(CONTEXT_PATH + '/home')}" class="demo-account-chip">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-ev-station text-primary fs-5"></i>
                                    <div>
                                        <div class="fw-bold small text-white">VoltPower Hub Operator</div>
                                        <div class="text-white-50" style="font-size: 0.7rem;">Manage slots, pricing (₹), live bookings</div>
                                    </div>
                                </div>
                                <span class="badge bg-primary-subtle text-primary border border-primary small">Operator</span>
                            </a>

                            <a href="${CONTEXT_PATH}/auth?action=switch&role=USER&redirect=${encodeURIComponent(CONTEXT_PATH + '/home')}" class="demo-account-chip">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-car-front text-success fs-5"></i>
                                    <div>
                                        <div class="fw-bold small text-white">EV Driver (Demo User)</div>
                                        <div class="text-white-50" style="font-size: 0.7rem;">Tata Nexon EV &bull; Bengaluru Hubs</div>
                                    </div>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success small">EV User</span>
                            </a>
                        </div>
                    </div>

                    <!-- Registration Link -->
                    <div class="text-center mt-4">
                        <p class="small mb-0" style="color: #94a3b8;">
                            Don't have an account? 
                            <a href="${CONTEXT_PATH}/register.jsp" style="color: #34d399; font-weight: 700; text-decoration: none;">
                                Register New Account <i class="bi bi-arrow-right"></i>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            </div><!-- /.login-center-container -->
        </div><!-- /.antigravity-login-wrapper -->

        <!-- Load Antigravity WebGL2 Particle Simulation Engine -->
        <script>
        function switchPalette(theme) {
            const btnEm = document.getElementById('btnPaletteEmerald');
            const btnCos = document.getElementById('btnPaletteCosmic');
            const inst = window.__globalAntigravityInstance;
            if (theme === 'cosmic') {
                if (inst && inst.updateColors) {
                    inst.updateColors(["#ff2727", "#000000", "#a843ff", "#f43f5e", "#8b5cf6"]);
                }
                if (btnCos) { btnCos.classList.add('active'); btnCos.classList.remove('btn-outline-info'); btnCos.classList.add('btn-info'); }
                if (btnEm) { btnEm.classList.remove('active'); btnEm.classList.remove('btn-success'); btnEm.classList.add('btn-outline-success'); }
            } else {
                if (inst && inst.updateColors) {
                    inst.updateColors(["#10b981", "#3b82f6", "#a843ff", "#34d399", "#064e3b"]);
                }
                if (btnEm) { btnEm.classList.add('active'); btnEm.classList.remove('btn-outline-success'); btnEm.classList.add('btn-success'); }
                if (btnCos) { btnCos.classList.remove('active'); btnCos.classList.remove('btn-info'); btnCos.classList.add('btn-outline-info'); }
            }
        }
        </script>
            }
        }
        </script>
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/auth') {
        const action = query.action;
        if (action === 'switch') {
            const targetRole = (query.role || 'USER').toUpperCase();
            const targetUser = db.users.find(u => u.role === targetRole) || db.users[3];
            const sid = 'SESS_' + Date.now();
            sessions[sid] = targetUser;

            // User requested: After Login Page, get Home Landing
            let dest = query.redirect || `${CONTEXT_PATH}/home`;

            res.writeHead(302, {
                'Set-Cookie': `VS_SESSION=${sid}; Path=/; HttpOnly`,
                'Location': dest
            });
            res.end();
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                const params = querystring.parse(body);
                const action = params.action || 'login';
                let matchedUser = null;

                if (action === 'register') {
                    const name = (params.name || '').trim() || 'EV Driver';
                    const email = (params.email || '').toLowerCase().trim() || `driver${Date.now()}@voltspot.in`;
                    const role = (params.role || 'USER').toUpperCase();
                    const phone = (params.phone || '+91 98765 00000').trim();

                    matchedUser = db.users.find(u => u.email === email);
                    if (!matchedUser) {
                        matchedUser = {
                            id: db.users.length + 1,
                            name: name,
                            email: email,
                            password: params.password || 'password123',
                            phone: phone,
                            role: role,
                            status: 'ACTIVE'
                        };
                        db.users.push(matchedUser);
                    }
                } else {
                    const email = (params.email || '').toLowerCase().trim();
                    matchedUser = db.users.find(u => u.email === email) || db.users[3];
                }

                const sid = 'SESS_' + Date.now();
                sessions[sid] = matchedUser;

                // User requested: After Login Page, get Home Landing
                let dest = params.redirect || `${CONTEXT_PATH}/home`;

                res.writeHead(302, {
                    'Set-Cookie': `VS_SESSION=${sid}; Path=/; HttpOnly`,
                    'Location': dest
                });
                res.end();
            });
            return;
        }
    }

    if (route === '/register.jsp' || route === '/register') {
        const html = renderHeader(null, 'Create Account - VoltSpot EV India (₹)', '') + `
        <div class="antigravity-login-wrapper">
            <!-- Centered Flexbox & Grid Container (Perfect Horizontal & Vertical Centering) -->
            <div class="login-center-container" style="max-width: 550px;">
                <!-- 3. Glassmorphic Registration Card with Adjusted High-Contrast Text Colors -->
                <div class="card antigravity-login-card mx-auto" style="max-width: 540px;">
                    <div class="antigravity-glow-bar"></div>
                    <div class="card-body p-4 p-md-5">
                    
                    <div class="text-center mb-3">
                        <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-2" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);">
                            <i class="bi bi-person-plus-fill fs-2" style="color: #10b981;"></i>
                        </div>
                        <h3 class="fw-bold mb-1">Join Volt<span style="color: #34d399;">Spot</span> EV</h3>
                        <p class="subtitle mb-2">Register as an EV Driver or Charging Hub Operator (₹)</p>
                        <div class="antigravity-engine-badge">
                            <i class="bi bi-cpu"></i>
                            <span>Antigravity Physics Active</span>
                        </div>
                    </div>

                    <!-- Direct Quick Navigation for Registered Users -->
                    <div class="p-3 mb-4 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-2" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.4) !important;">
                        <div>
                            <span class="badge bg-success me-1">ALREADY REGISTERED?</span>
                            <span class="text-white small fw-semibold">Already have an account?</span>
                        </div>
                        <a href="${CONTEXT_PATH}/login.jsp" class="btn btn-sm btn-success fw-bold text-nowrap">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Open Login Page
                        </a>
                    </div>

                    <form action="${CONTEXT_PATH}/auth" method="GET">
                        <input type="hidden" name="action" value="switch">
                        <input type="hidden" name="redirect" value="${CONTEXT_PATH}/home">

                        <!-- Role Selector with High Contrast -->
                        <div class="mb-4">
                            <label class="form-label">I want to register as:</label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="role" id="roleUser" value="USER" checked>
                                    <label class="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center" for="roleUser" style="border-width: 1.5px; font-weight: 700;">
                                        <i class="bi bi-car-front-fill fs-4 mb-1"></i>
                                        <span class="fw-bold">EV Driver</span>
                                        <small class="text-white-50" style="font-size: 0.7rem;">Book Charging Slots</small>
                                    </label>
                                </div>
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="role" id="roleOperator" value="OPERATOR">
                                    <label class="btn btn-outline-primary w-100 py-2 d-flex flex-column align-items-center" for="roleOperator" style="border-width: 1.5px; font-weight: 700;">
                                        <i class="bi bi-ev-station-fill fs-4 mb-1"></i>
                                        <span class="fw-bold">Hub Operator</span>
                                        <small class="text-white-50" style="font-size: 0.7rem;">Manage EV Hubs</small>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Full Name / Organization</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                <input type="text" name="name" class="form-control" placeholder="Enter your full name or organization" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Email Address</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-envelope-at-fill"></i></span>
                                <input type="email" name="email" class="form-control" placeholder="you@example.com" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Mobile Number</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
                                <input type="tel" name="phone" class="form-control" placeholder="+91 98765 00000" required>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Password</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-shield-lock-fill"></i></span>
                                <input type="password" name="password" class="form-control" placeholder="Minimum 6 characters" minlength="6" required>
                            </div>
                        </div>

                        <button type="submit" class="btn antigravity-submit-btn w-100 py-2 mb-3">
                            <i class="bi bi-check-circle me-1"></i> Complete Registration
                        </button>
                    </form>

                    <div class="text-center mt-3 pt-3 border-top" style="border-color: rgba(51, 65, 85, 0.7) !important;">
                        <p class="small mb-0" style="color: #94a3b8;">
                            Already registered? 
                            <a href="${CONTEXT_PATH}/login.jsp" style="color: #34d399; font-weight: 700; text-decoration: none;">
                                Sign In to Your Account <i class="bi bi-arrow-right"></i>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            </div><!-- /.login-center-container -->
        </div><!-- /.antigravity-login-wrapper -->
        ` + renderFooter();

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    if (route === '/submit-feedback' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const p = querystring.parse(body);
            const stId = parseInt(p.stationId);
            const st = db.stations.find(s => s.id === stId);
            db.feedbacks.unshift({
                id: db.feedbacks.length + 1,
                stationId: stId,
                stationName: st ? st.name : 'Station',
                userId: currentUser ? currentUser.id : 4,
                userName: currentUser ? currentUser.name : 'Alex Johnson',
                rating: parseInt(p.rating || 5),
                comments: p.comments || 'Great charging experience!',
                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
            });
            res.writeHead(302, { 'Location': `${CONTEXT_PATH}/station-detail?id=${stId}` });
            res.end();
        });
        return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1><p><a href="' + CONTEXT_PATH + '/home">Go to Home</a></p>');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================================================`);
    console.log(`VoltSpot EV Localhost Server running successfully!`);
    console.log(`Access the application at: http://localhost:${PORT}${CONTEXT_PATH}/`);
    console.log(`========================================================================`);
});
