<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.SlotBooking" %>

<%
    Map<String, Object> stats = (Map<String, Object>) request.getAttribute("stats");
    List<Map<String, Object>> popularStations = (List<Map<String, Object>>) request.getAttribute("popularStations");
    List<Map<String, Object>> paymentBreakdown = (List<Map<String, Object>>) request.getAttribute("paymentBreakdown");
    List<ChargingStation> stations = (List<ChargingStation>) request.getAttribute("stations");
    List<SlotBooking> bookings = (List<SlotBooking>) request.getAttribute("bookings");

    request.setAttribute("pageTitle", "Reports & Analytics - Admin Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <!-- Reports Header & Print Action -->
    <div class="d-flex justify-content-between align-items-center mb-4 no-print">
        <div>
            <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill">Admin Management</span>
            <h2 class="fw-bold mb-0">System Utilization &amp; Revenue Reports</h2>
            <small class="text-muted">Comprehensive operational metrics, booking lifecycle reports, and financial settlements</small>
        </div>
        <div class="d-flex gap-2">
            <button onclick="window.print()" class="btn btn-success fw-semibold">
                <i class="bi bi-printer me-1"></i> Print / Export Report
            </button>
            <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-1"></i> Dashboard
            </a>
        </div>
    </div>

    <!-- Printable Report Title Block -->
    <div class="card p-4 border shadow-sm mb-4 bg-white">
        <div class="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
            <div>
                <h4 class="fw-bold text-success mb-1"><i class="bi bi-lightning-charge-fill me-1"></i> VoltSpot EV System Telemetry Report</h4>
                <p class="small text-muted mb-0">Generated on: <%= new java.util.Date() %> &bull; Scope: Entire Platform Infrastructure</p>
            </div>
            <div class="text-end">
                <span class="badge bg-dark font-monospace">STATUS: ACTIVE</span>
            </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="row g-3 mb-4 text-center">
            <div class="col-md-3 col-6">
                <div class="p-3 border rounded bg-light">
                    <small class="text-muted fw-semibold d-block">Total Platform Users</small>
                    <h3 class="fw-bold mb-0 text-dark"><%= stats != null ? stats.get("totalUsers") : 0 %></h3>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="p-3 border rounded bg-light">
                    <small class="text-muted fw-semibold d-block">Approved Stations</small>
                    <h3 class="fw-bold mb-0 text-success"><%= stats != null ? stats.get("approvedStations") : 0 %></h3>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="p-3 border rounded bg-light">
                    <small class="text-muted fw-semibold d-block">Total Reservations</small>
                    <h3 class="fw-bold mb-0 text-primary"><%= stats != null ? stats.get("totalBookings") : 0 %></h3>
                </div>
            </div>
            <div class="col-md-3 col-6">
                <div class="p-3 border rounded bg-light">
                    <small class="text-muted fw-semibold d-block">Total Gross Revenue</small>
                    <h3 class="fw-bold mb-0 text-success">₹<%= stats != null ? stats.get("totalRevenue") : "0.00" %></h3>
                </div>
            </div>
        </div>

        <!-- Station Utilization Ranking Table -->
        <h5 class="fw-bold mb-3"><i class="bi bi-bar-chart-line text-success me-2"></i> Station Utilization &amp; Revenue Breakdown</h5>
        <div class="table-responsive mb-4">
            <table class="table table-bordered align-middle mb-0">
                <thead class="table-light small text-uppercase">
                    <tr>
                        <th>Station Name</th>
                        <th>City</th>
                        <th>Completed Bookings</th>
                        <th>Average Customer Rating</th>
                        <th class="text-end">Total Billed Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (popularStations != null && !popularStations.isEmpty()) {
                        for (Map<String, Object> ps : popularStations) { %>
                            <tr>
                                <td><strong class="text-dark"><%= ps.get("name") %></strong></td>
                                <td><%= ps.get("city") %></td>
                                <td><span class="badge bg-light text-dark border"><%= ps.get("bookingCount") %> bookings</span></td>
                                <td><i class="bi bi-star-fill text-warning small"></i> <%= ps.get("avgRating") %> / 5.0</td>
                                <td class="text-end fw-bold text-success">₹<%= ps.get("totalRevenue") %></td>
                            </tr>
                    <%  }
                       } else { %>
                        <tr><td colspan="5" class="text-center py-3 text-muted">No utilization data available.</td></tr>
                    <% } %>
                </tbody>
            </table>
        </div>

        <!-- Payment Gateway Settlement Breakdown -->
        <h5 class="fw-bold mb-3"><i class="bi bi-credit-card-2-front text-primary me-2"></i> Payment Gateway Method Settlement</h5>
        <div class="table-responsive">
            <table class="table table-bordered align-middle mb-0">
                <thead class="table-light small text-uppercase">
                    <tr>
                        <th>Payment Gateway Method</th>
                        <th>Number of Transactions</th>
                        <th class="text-end">Settled Volume</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (paymentBreakdown != null && !paymentBreakdown.isEmpty()) {
                        for (Map<String, Object> pb : paymentBreakdown) { %>
                            <tr>
                                <td><span class="badge bg-secondary"><%= pb.get("method") %></span></td>
                                <td><%= pb.get("count") %> successful payments</td>
                                <td class="text-end fw-bold text-dark">₹<%= pb.get("amount") %></td>
                            </tr>
                    <%  }
                       } else { %>
                        <tr><td colspan="3" class="text-center py-3 text-muted">No payment settlements recorded.</td></tr>
                    <% } %>
                </tbody>
            </table>
        </div>
    </div>
</div>

<jsp:include page="/includes/footer.jsp" />

