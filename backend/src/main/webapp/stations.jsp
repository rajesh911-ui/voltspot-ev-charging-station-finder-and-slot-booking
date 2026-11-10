<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.StationChargingType" %>
<%@ page import="com.voltspot.dao.StationDAO" %>

<%
    List<ChargingStation> stations = (List<ChargingStation>) request.getAttribute("stations");
    List<String> cities = (List<String>) request.getAttribute("cities");
    String selectedCity = (String) request.getAttribute("selectedCity");
    String keyword = (String) request.getAttribute("keyword");
    String selectedType = (String) request.getAttribute("selectedType");
    String stationsJson = (String) request.getAttribute("stationsJson");
    Boolean isNearbySearch = (Boolean) request.getAttribute("isNearbySearch");

    if (stations == null) {
        StationDAO sDao = new StationDAO();
        stations = sDao.findAllApproved();
        cities = sDao.findAllCities();
        com.google.gson.Gson gson = new com.google.gson.Gson();
        stationsJson = gson.toJson(stations);
    }

    request.setAttribute("pageTitle", "Find EV Charging Stations - VoltSpot");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <!-- Filter and Search Header -->
    <div class="card p-4 shadow-sm border-0 mb-4 bg-white">
        <form action="${pageContext.request.contextPath}/stations" method="GET" class="row g-3 align-items-end">
            <div class="col-lg-3 col-md-6">
                <label class="form-label fw-semibold small text-muted">City</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
                    <select name="city" class="form-select">
                        <option value="">All Cities</option>
                        <% if (cities != null) {
                            for (String c : cities) { %>
                                <option value="<%= c %>" <%= (selectedCity != null && selectedCity.equalsIgnoreCase(c)) ? "selected" : "" %>><%= c %></option>
                        <%  }
                           } %>
                    </select>
                </div>
            </div>

            <div class="col-lg-3 col-md-6">
                <label class="form-label fw-semibold small text-muted">Keyword or Address</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" name="keyword" class="form-control" placeholder="Station name or street..." value="<%= keyword != null ? keyword : "" %>">
                </div>
            </div>

            <div class="col-lg-3 col-md-6">
                <label class="form-label fw-semibold small text-muted">Charging Speed</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lightning-charge"></i></span>
                    <select name="type" class="form-select">
                        <option value="">All Types (Fast &amp; Normal)</option>
                        <option value="FAST" <%= "FAST".equalsIgnoreCase(selectedType) ? "selected" : "" %>>FAST Charging (DC)</option>
                        <option value="NORMAL" <%= "NORMAL".equalsIgnoreCase(selectedType) ? "selected" : "" %>>NORMAL Charging (AC)</option>
                    </select>
                </div>
            </div>

            <div class="col-lg-3 col-md-6 d-flex gap-2">
                <button type="submit" class="btn btn-success flex-grow-1 fw-semibold">
                    <i class="bi bi-filter me-1"></i> Apply Filters
                </button>
                <a href="${pageContext.request.contextPath}/stations" class="btn btn-outline-secondary" title="Reset Filters">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </a>
            </div>
        </form>

        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <div class="text-muted small">
                Showing <strong class="text-dark"><%= stations.size() %></strong> verified charging stations
                <% if (Boolean.TRUE.equals(isNearbySearch)) { %>
                    <span class="badge bg-success-subtle text-success ms-2"><i class="bi bi-geo-fill"></i> Sorted by GPS Distance</span>
                <% } %>
            </div>
            <button type="button" id="locateNearbyBtn" onclick="locateUserNearby()" class="btn btn-sm btn-outline-primary fw-semibold">
                <i class="bi bi-crosshair me-1"></i> Find Stations Near Me
            </button>
        </div>
    </div>

    <!-- Premium Google Maps Interactive Radar Section -->
    <div class="map-card-container mb-4 overflow-hidden position-relative">
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
                <span class="small text-muted fw-bold me-1 d-none d-md-inline">City Radar:</span>
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

    <!-- Stations Card Grid -->
    <div class="row g-4">
        <% if (stations == null || stations.isEmpty()) { %>
            <div class="col-12">
                <div class="card p-5 text-center border-0 bg-white shadow-sm">
                    <i class="bi bi-search text-muted display-4 mb-3"></i>
                    <h4>No charging stations found</h4>
                    <p class="text-muted">Try adjusting your search criteria, select a different city, or reset the filters.</p>
                    <div>
                        <a href="${pageContext.request.contextPath}/stations" class="btn btn-outline-success">View All Stations</a>
                    </div>
                </div>
            </div>
        <% } else {
            for (ChargingStation s : stations) {
                StationChargingType fast = s.getFastCharging();
                StationChargingType normal = s.getNormalCharging();
        %>
            <div class="col-lg-6">
                <div class="card h-100 station-card border-0 shadow-sm">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="badge bg-light text-dark border me-1">
                                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> <%= s.getCity() %>
                                </span>
                                <% if (s.getDistanceKm() != null) { %>
                                    <span class="badge bg-success-subtle text-success fw-bold">
                                        <i class="bi bi-cursor-fill me-1"></i> <%= s.getDistanceKm() %> km away
                                    </span>
                                <% } %>
                            </div>
                            <span class="star-rating small">
                                <i class="bi bi-star-fill text-warning"></i> <%= s.getAverageRating() > 0 ? s.getAverageRating() : '5.0' %>
                                <span class="text-muted small">(<%= s.getReviewCount() %>)</span>
                            </span>
                        </div>

                        <h4 class="fw-bold text-dark mb-1"><%= s.getName() %></h4>
                        <p class="text-muted small mb-2"><i class="bi bi-pin-map text-secondary me-1"></i> <%= s.getAddress() %></p>
                        <p class="text-muted small mb-3"><i class="bi bi-telephone text-secondary me-1"></i> <%= s.getContactNumber() %> &bull; <i class="bi bi-clock me-1"></i> <%= s.getOpeningTime() %> - <%= s.getClosingTime() %></p>

                        <!-- Fast & Normal Breakdown Table -->
                        <div class="row g-2 mb-3 mt-auto">
                            <div class="col-6">
                                <div class="p-3 bg-light rounded-3 border h-100">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="badge-fast small">FAST (DC)</span>
                                        <small class="text-muted"><%= fast != null ? fast.getPowerKw() : '150' %> kW</small>
                                    </div>
                                    <div class="fs-5 fw-bold text-dark mt-2">
                                        ₹<%= fast != null ? fast.getPricePerSlot() : "280.00" %>
                                        <span class="fs-6 fw-normal text-muted">/slot</span>
                                    </div>
                                    <small class="text-success"><i class="bi bi-check-circle-fill"></i> <%= fast != null ? fast.getTotalCapacity() : '6' %> charging ports</small>
                                </div>
                            </div>

                            <div class="col-6">
                                <div class="p-3 bg-light rounded-3 border h-100">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="badge-normal small">NORMAL (AC)</span>
                                        <small class="text-muted"><%= normal != null ? normal.getPowerKw() : '22' %> kW</small>
                                    </div>
                                    <div class="fs-5 fw-bold text-dark mt-2">
                                        ₹<%= normal != null ? normal.getPricePerSlot() : "95.00" %>
                                        <span class="fs-6 fw-normal text-muted">/slot</span>
                                    </div>
                                    <small class="text-primary"><i class="bi bi-check-circle-fill"></i> <%= normal != null ? normal.getTotalCapacity() : '10' %> charging ports</small>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top">
                            <div class="d-flex gap-1">
                                <a href="https://www.google.com/maps/dir/?api=1&destination=<%= s.getLatitude() %>,<%= s.getLongitude() %>&travelmode=driving" target="_blank" class="btn btn-sm btn-outline-primary fw-semibold" title="Live Driving Directions in Google Maps">
                                    <i class="bi bi-cursor-fill me-1"></i> Directions
                                </a>
                                <a href="https://www.google.com/maps/search/?api=1&query=<%= s.getLatitude() %>,<%= s.getLongitude() %>" target="_blank" class="btn btn-sm btn-outline-secondary" title="View exact location pin on Google Maps">
                                    <i class="bi bi-google"></i>
                                </a>
                            </div>
                            <a href="${pageContext.request.contextPath}/station-detail?id=<%= s.getId() %>" class="btn btn-success fw-semibold px-4">
                                Check Slots &amp; Book (₹) <i class="bi bi-arrow-right ms-1"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        <%  }
           } %>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const stationsData = <%= stationsJson != null ? stationsJson : "[]" %>;
    window.__stationsData = stationsData;
    const defaultLat = <%= request.getAttribute("userLat") != null ? request.getAttribute("userLat") : "12.9716" %>;
    const defaultLng = <%= request.getAttribute("userLng") != null ? request.getAttribute("userLng") : "77.5946" %>;
    initStationMap('stationMap', stationsData, defaultLat, defaultLng, 12);
});
</script>

<jsp:include page="/includes/footer.jsp" />

