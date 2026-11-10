<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.StationChargingType" %>
<%@ page import="com.voltspot.dao.StationDAO" %>
<%@ page import="com.voltspot.dao.ReportDAO" %>

<%
    // Fallback load if accessed directly via index.jsp
    List<ChargingStation> featuredStations = (List<ChargingStation>) request.getAttribute("featuredStations");
    List<String> cities = (List<String>) request.getAttribute("cities");
    Map<String, Object> stats = (Map<String, Object>) request.getAttribute("stats");

    if (featuredStations == null || cities == null || stats == null) {
        StationDAO sDao = new StationDAO();
        ReportDAO rDao = new ReportDAO();
        List<ChargingStation> all = sDao.findAllApproved();
        featuredStations = all.size() > 6 ? all.subList(0, 6) : all;
        cities = sDao.findAllCities();
        stats = rDao.getAdminDashboardStats();
    }

    request.setAttribute("pageTitle", "VoltSpot EV - Charging Station Finder & Slot Booking");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<!-- Premium Hero Section -->
<section class="hero-section text-center text-lg-start">
    <div class="container py-4">
        <div class="row align-items-center g-5">
            <div class="col-lg-7">
                <div class="hero-badge mb-3">
                    <span class="live-dot me-2"></span>
                    <span>INDIA'S PREMIER EV CHARGING NETWORK &bull; REAL-TIME LIVE SLOTS</span>
                </div>
                <h1 class="display-4 fw-bold mb-3 hero-title">
                    Next-Gen EV Charging, <br><span class="text-gradient-emerald">Guaranteed Slot Booking</span>
                </h1>
                <p class="lead text-light opacity-75 mb-4" style="max-width: 580px;">
                    Discover high-speed CCS2 Fast Chargers (up to 180 kW) and Type 2 AC stations across Bengaluru, Hyderabad, Mumbai, Delhi, Chennai, and Pune. Real-time capacity checks prevent overbooking.
                </p>

                <!-- Elevated Search Bar Card -->
                <div class="hero-search-card p-4 text-dark mb-4">
                    <form action="${pageContext.request.contextPath}/stations" method="GET" class="row g-2 align-items-center">
                        <div class="col-md-5">
                            <label class="form-label small fw-bold text-muted mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i> Select Hub City</label>
                            <div class="input-group">
                                <select name="city" class="form-select border-1 fw-semibold">
                                    <option value="">All Indian Metro Cities</option>
                                    <% for (String c : cities) { %>
                                        <option value="<%= c %>"><%= c %></option>
                                    <% } %>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-bold text-muted mb-1"><i class="bi bi-search text-muted me-1"></i> Landmark / Area</label>
                            <input type="text" name="keyword" class="form-control border-1" placeholder="e.g. MG Road, Hitec City, BKC...">
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button type="submit" class="btn btn-success w-100 py-2 fw-bold shadow-sm">
                                <i class="bi bi-search me-1"></i> Find Hubs
                            </button>
                        </div>
                    </form>
                    <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top gap-2">
                        <div class="d-flex flex-wrap gap-1 align-items-center">
                            <small class="text-muted fw-bold me-1">Quick Jump:</small>
                            <a href="${pageContext.request.contextPath}/stations?city=Bengaluru" class="city-chip">Bengaluru</a>
                            <a href="${pageContext.request.contextPath}/stations?city=Hyderabad" class="city-chip">Hyderabad</a>
                            <a href="${pageContext.request.contextPath}/stations?city=Mumbai" class="city-chip">Mumbai</a>
                            <a href="${pageContext.request.contextPath}/stations?city=Delhi" class="city-chip">Delhi NCR</a>
                            <a href="${pageContext.request.contextPath}/stations?city=Chennai" class="city-chip">Chennai</a>
                            <a href="${pageContext.request.contextPath}/stations?city=Pune" class="city-chip">Pune</a>
                        </div>
                        <button type="button" id="locateNearbyBtn" onclick="locateUserNearby()" class="btn btn-sm btn-outline-primary fw-bold">
                            <i class="bi bi-crosshair me-1"></i> Use My GPS Location
                        </button>
                    </div>
                </div>
            </div>

            <!-- Hero Feature Cards -->
            <div class="col-lg-5">
                <div class="row g-3">
                    <div class="col-6">
                        <div class="hero-stat-card h-100">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <i class="bi bi-ev-station text-success fs-2"></i>
                                <span class="badge bg-success-subtle text-success small">Verified</span>
                            </div>
                            <h2 class="fw-bold mb-0 text-white"><%= stats.get("approvedStations") %>+</h2>
                            <small class="text-light opacity-75">Active Superchargers</small>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="hero-stat-card h-100">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <i class="bi bi-lightning-charge-fill text-warning fs-2"></i>
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
                </div>
            </div>
        </div>
    </div>
</section>

<!-- How It Works Section -->
<section class="py-5 bg-white">
    <div class="container py-3">
        <div class="text-center mb-5">
            <span class="badge bg-light text-primary px-3 py-2 rounded-pill fw-semibold mb-2">Simple 3-Step Process</span>
            <h2 class="fw-bold">How VoltSpot Works</h2>
            <p class="text-muted">A streamlined experience for electric vehicle drivers</p>
        </div>

        <div class="row g-4 text-center">
            <div class="col-md-4">
                <div class="p-4 border rounded-3 h-100 bg-light">
                    <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                        <i class="bi bi-geo-alt fs-3"></i>
                    </div>
                    <h5 class="fw-bold">1. Discover Stations</h5>
                    <p class="text-muted small">Search by city or view stations sorted by distance using GPS and the Haversine formula.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded-3 h-100 bg-light">
                    <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                        <i class="bi bi-clock-history fs-3"></i>
                    </div>
                    <h5 class="fw-bold">2. Choose Type &amp; Slot</h5>
                    <p class="text-muted small">Select FAST or NORMAL charging. Live slot availability checks ensure you never face overbooking.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-4 border rounded-3 h-100 bg-light">
                    <div class="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                        <i class="bi bi-receipt-cutoff fs-3"></i>
                    </div>
                    <h5 class="fw-bold">3. Pay &amp; Get Invoice</h5>
                    <p class="text-muted small">Secure integrated payment checkout with automated tax invoice generation and rate your experience.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Featured Stations Section -->
<section class="py-5 bg-light">
    <div class="container py-2">
        <div class="d-flex justify-content-between align-items-end mb-4">
            <div>
                <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold">Top Locations</span>
                <h2 class="fw-bold mb-0">Featured Charging Hubs</h2>
            </div>
            <a href="${pageContext.request.contextPath}/stations" class="btn btn-outline-success">
                View All Stations <i class="bi bi-arrow-right ms-1"></i>
            </a>
        </div>

        <div class="row g-4">
            <% if (featuredStations != null && !featuredStations.isEmpty()) {
                for (ChargingStation s : featuredStations) {
                    StationChargingType fast = s.getFastCharging();
                    StationChargingType normal = s.getNormalCharging();
            %>
                <div class="col-lg-4 col-md-6">
                    <div class="card h-100 station-card">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-light text-dark border">
                                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> <%= s.getCity() %>
                                </span>
                                <span class="star-rating small">
                                    <i class="bi bi-star-fill text-warning"></i> <%= s.getAverageRating() > 0 ? s.getAverageRating() : '5.0' %>
                                    <span class="text-muted small">(<%= s.getReviewCount() %>)</span>
                                </span>
                            </div>

                            <h5 class="fw-bold mb-2 text-dark"><%= s.getName() %></h5>
                            <p class="text-muted small mb-3 flex-grow-1">
                                <i class="bi bi-pin-map text-secondary me-1"></i> <%= s.getAddress() %>
                            </p>

                            <!-- Charging Types & Rates -->
                            <div class="bg-light p-3 rounded-3 mb-3 border">
                                <div class="row g-2 text-center small">
                                    <div class="col-6 border-end">
                                        <div class="fw-semibold text-warning-emphasis">FAST CHARGING</div>
                                        <div class="fs-6 fw-bold text-dark">₹<%= fast != null ? fast.getPricePerSlot() : "280.00" %>/slot</div>
                                        <small class="text-muted"><%= fast != null ? fast.getPowerKw() : '150' %> kW &bull; <%= fast != null ? fast.getTotalCapacity() : '6' %> ports</small>
                                    </div>
                                    <div class="col-6">
                                        <div class="fw-semibold text-primary">NORMAL</div>
                                        <div class="fs-6 fw-bold text-dark">₹<%= normal != null ? normal.getPricePerSlot() : "95.00" %>/slot</div>
                                        <small class="text-muted"><%= normal != null ? normal.getPowerKw() : '22' %> kW &bull; <%= normal != null ? normal.getTotalCapacity() : '10' %> ports</small>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="bi bi-clock me-1"></i> <%= s.getOpeningTime() %> - <%= s.getClosingTime() %>
                                </small>
                                <a href="${pageContext.request.contextPath}/station-detail?id=<%= s.getId() %>" class="btn btn-success btn-sm px-3">
                                    Book Slot <i class="bi bi-chevron-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            <%  }
               } %>
        </div>
    </div>
</section>

<!-- Modules Overview -->
<section class="py-5 bg-white border-top">
    <div class="container py-2">
        <div class="text-center mb-5">
            <h2 class="fw-bold">Designed for Every Stakeholder</h2>
            <p class="text-muted">Role-based modules tailored for seamless cooperation</p>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100 p-4 border shadow-sm">
                    <div class="text-success fs-1 mb-3"><i class="bi bi-person-badge"></i></div>
                    <h4 class="fw-bold">1. EV Users</h4>
                    <p class="text-muted small">Search stations by location or distance, view FAST/NORMAL pricing, check real-time slot availability, make secure payments, download tax invoices, and submit feedback.</p>
                    <a href="${pageContext.request.contextPath}/register.jsp?role=USER" class="btn btn-outline-success mt-auto">Join as Driver</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card h-100 p-4 border shadow-sm">
                    <div class="text-primary fs-1 mb-3"><i class="bi bi-ev-station-fill"></i></div>
                    <h4 class="fw-bold">2. Station Operators</h4>
                    <p class="text-muted small">Register new charging stations with GPS coordinates, configure FAST &amp; NORMAL slot capacities and hourly pricing, track customer bookings, and monitor station ratings.</p>
                    <a href="${pageContext.request.contextPath}/register.jsp?role=OPERATOR" class="btn btn-outline-primary mt-auto">Register as Operator</a>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card h-100 p-4 border shadow-sm">
                    <div class="text-danger fs-1 mb-3"><i class="bi bi-shield-lock-fill"></i></div>
                    <h4 class="fw-bold">3. System Admin</h4>
                    <p class="text-muted small">Approve or reject newly registered stations, monitor network-wide bookings and payments, manage registered users, moderate feedback, and generate analytics reports.</p>
                    <a href="${pageContext.request.contextPath}/login.jsp" class="btn btn-outline-danger mt-auto">Admin Login</a>
                </div>
            </div>
        </div>
    </div>
</section>

<jsp:include page="/includes/footer.jsp" />

