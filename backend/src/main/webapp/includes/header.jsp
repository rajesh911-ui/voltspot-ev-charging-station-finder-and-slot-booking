<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.voltspot.model.User" %>
<%
    User currentUser = (session != null) ? (User) session.getAttribute("user") : null;
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle != null ? pageTitle : 'VoltSpot EV - Charging Station Finder & Slot Booking'}</title>
    <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Bootstrap 5.3 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Leaflet CSS for Fallback -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <!-- Custom CSS -->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/custom.css">
</head>
<body>

<!-- Global Full Page Antigravity Background (Slow drift, moves only where mouse/touch interacts) -->
<div id="antigravity-global-bg" aria-hidden="true"></div>

<nav class="navbar navbar-expand-xl navbar-dark bg-dark sticky-top shadow-sm">
    <div class="container-fluid px-xl-4">
        <a class="navbar-brand d-flex align-items-center me-3" href="${pageContext.request.contextPath}/home">
            <i class="bi bi-lightning-charge-fill text-success fs-3 me-2 anim-bolt-spark"></i>
            <span>Volt<strong>Spot</strong> <small class="text-white-50 fs-6 fw-normal ms-1">India (₹)</small></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav me-auto mb-2 mb-xl-0 align-items-xl-center">
                <li class="nav-item">
                    <a class="nav-link" href="${pageContext.request.contextPath}/register.jsp"><i class="bi bi-person-plus text-success me-1"></i> Register</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="${pageContext.request.contextPath}/login.jsp"><i class="bi bi-box-arrow-in-right text-info me-1"></i> Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="${pageContext.request.contextPath}/home"><i class="bi bi-house-door me-1"></i> Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="${pageContext.request.contextPath}/stations"><i class="bi bi-geo-alt text-warning me-1"></i> Find Stations</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle text-primary" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="bi bi-speedometer2 me-1"></i> Operator Portal
                    </a>
                    <ul class="dropdown-menu shadow">
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/operator/dashboard"><i class="bi bi-grid me-2"></i>Operator Dashboard</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/operator/stations"><i class="bi bi-ev-station me-2"></i>My Charging Stations</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/operator/add-station"><i class="bi bi-plus-circle me-2"></i>Register New Station</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/operator/bookings"><i class="bi bi-list-check me-2"></i>Manage Bookings (Status)</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/operator/feedback"><i class="bi bi-star me-2"></i>Customer Reviews</a></li>
                    </ul>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle text-danger" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="bi bi-shield-lock me-1"></i> Admin Portal
                    </a>
                    <ul class="dropdown-menu shadow">
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/dashboard"><i class="bi bi-bar-chart me-2"></i>Admin Dashboard</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/pending-stations"><i class="bi bi-patch-check me-2"></i>Station Approvals (Pending)</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/stations"><i class="bi bi-ev-station me-2"></i>Manage Stations</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/users"><i class="bi bi-people me-2"></i>Manage Users</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/bookings"><i class="bi bi-calendar-event me-2"></i>All System Bookings</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/payments"><i class="bi bi-credit-card me-2"></i>Payments Ledger</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/feedback"><i class="bi bi-chat-quote me-2"></i>Customer Feedback</a></li>
                        <li><a class="dropdown-item" href="${pageContext.request.contextPath}/admin/reports"><i class="bi bi-file-earmark-bar-graph me-2"></i>Reports & Analytics</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="${pageContext.request.contextPath}/invoice?bookingId=BK-1001"><i class="bi bi-receipt text-success me-1"></i> GST Invoice</a>
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

                <% if (currentUser != null) { %>
                    <div class="dropdown">
                        <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-person-circle fs-5 me-2"></i>
                            <span><%= currentUser.getName() %></span>
                            <span class="badge bg-secondary ms-2 small"><%= currentUser.getRole() %></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li class="dropdown-header"><%= currentUser.getEmail() %></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="${pageContext.request.contextPath}/auth?action=logout"><i class="bi bi-box-arrow-right me-2"></i> Sign Out</a></li>
                        </ul>
                    </div>
                <% } else { %>
                    <a href="${pageContext.request.contextPath}/login.jsp" class="btn btn-outline-light me-1"><i class="bi bi-box-arrow-in-right me-1"></i> Sign In</a>
                    <a href="${pageContext.request.contextPath}/register.jsp" class="btn btn-success"><i class="bi bi-person-plus me-1"></i> Register</a>
                <% } %>
            </div>
        </div>
    </div>
</nav>

<div class="main-content">
