<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.SlotBooking" %>

<%
    Map<String, Object> stats = (Map<String, Object>) request.getAttribute("stats");
    List<ChargingStation> pendingStations = (List<ChargingStation>) request.getAttribute("pendingStations");
    List<SlotBooking> recentBookings = (List<SlotBooking>) request.getAttribute("recentBookings");
    List<Map<String, Object>> popularStations = (List<Map<String, Object>>) request.getAttribute("popularStations");

    request.setAttribute("pageTitle", "Administrator Dashboard - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <!-- Admin Top Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill">System Administrator Control Hub</span>
            <h2 class="fw-bold mb-0">Platform Overview &amp; Analytics</h2>
            <small class="text-muted">Master administrative controls for stations, users, reservations, and revenues</small>
        </div>
        <div class="d-flex gap-2">
            <a href="${pageContext.request.contextPath}/admin/pending-stations" class="btn btn-warning text-dark fw-bold position-relative">
                <i class="bi bi-patch-check-fill me-1"></i> Station Approval Queue
                <% int pendingCount = (pendingStations != null) ? pendingStations.size() : 0;
                   if (pendingCount > 0) { %>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        <%= pendingCount %>
                    </span>
                <% } %>
            </a>
            <a href="${pageContext.request.contextPath}/admin/reports" class="btn btn-outline-secondary">
                <i class="bi bi-file-earmark-bar-graph me-1"></i> Generate Reports
            </a>
        </div>
    </div>

    <!-- Analytics Metric Cards -->
    <div class="row g-3 mb-4">
        <div class="col-lg-2 col-md-4 col-6">
            <div class="card p-3 border-0 shadow-sm bg-white text-center">
                <i class="bi bi-people-fill text-primary fs-3 mb-1"></i>
                <h3 class="fw-bold mb-0 text-dark"><%= stats != null ? stats.get("totalUsers") : 0 %></h3>
                <small class="text-muted">EV Drivers</small>
            </div>
        </div>

        <div class="col-lg-2 col-md-4 col-6">
            <div class="card p-3 border-0 shadow-sm bg-white text-center">
                <i class="bi bi-building-fill text-info fs-3 mb-1"></i>
                <h3 class="fw-bold mb-0 text-dark"><%= stats != null ? stats.get("totalOperators") : 0 %></h3>
                <small class="text-muted">Operators</small>
            </div>
        </div>

        <div class="col-lg-2 col-md-4 col-6">
            <div class="card p-3 border-0 shadow-sm bg-white text-center">
                <i class="bi bi-ev-station-fill text-success fs-3 mb-1"></i>
                <h3 class="fw-bold mb-0 text-success"><%= stats != null ? stats.get("approvedStations") : 0 %></h3>
                <small class="text-muted">Live Stations</small>
            </div>
        </div>

        <div class="col-lg-2 col-md-4 col-6">
            <div class="card p-3 border-0 shadow-sm bg-white text-center">
                <i class="bi bi-hourglass-split text-warning fs-3 mb-1"></i>
                <h3 class="fw-bold mb-0 text-warning"><%= stats != null ? stats.get("pendingStations") : 0 %></h3>
                <small class="text-muted">Pending Review</small>
            </div>
        </div>

        <div class="col-lg-2 col-md-4 col-6">
            <div class="card p-3 border-0 shadow-sm bg-white text-center">
                <i class="bi bi-calendar-check-fill text-primary fs-3 mb-1"></i>
                <h3 class="fw-bold mb-0 text-dark"><%= stats != null ? stats.get("totalBookings") : 0 %></h3>
                <small class="text-muted">Total Bookings</small>
            </div>
        </div>

        <div class="col-lg-2 col-md-4 col-6">
            <div class="card p-3 border-0 shadow-sm bg-white text-center">
                <i class="bi bi-cash-stack text-success fs-3 mb-1"></i>
                <h3 class="fw-bold mb-0 text-success">₹<%= stats != null ? stats.get("totalRevenue") : '0.00' %></h3>
                <small class="text-muted">Gross Revenue</small>
            </div>
        </div>
    </div>

    <!-- Pending Station Approvals Queue Banner -->
    <% if (pendingStations != null && !pendingStations.isEmpty()) { %>
        <div class="card shadow-sm border-warning mb-4">
            <div class="card-header bg-warning bg-opacity-25 py-3 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0 text-dark">
                    <i class="bi bi-exclamation-circle-fill text-warning me-2"></i> Stations Pending Administrator Approval (<%= pendingStations.size() %>)
                </h5>
                <a href="${pageContext.request.contextPath}/admin/pending-stations" class="btn btn-sm btn-dark">Open Approval Queue</a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                        <tr>
                            <th>Station Name</th>
                            <th>Operator</th>
                            <th>City &amp; Address</th>
                            <th>Fast / Normal Capacity</th>
                            <th class="text-end">Immediate Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (ChargingStation ps : pendingStations) { %>
                            <tr>
                                <td><strong class="text-dark"><%= ps.getName() %></strong></td>
                                <td><%= ps.getOperatorName() != null ? ps.getOperatorName() : "Operator #" + ps.getOperatorId() %></td>
                                <td><%= ps.getAddress() %>, <strong><%= ps.getCity() %></strong></td>
                                <td>
                                    <span class="badge bg-warning text-dark me-1">Fast: <%= ps.getFastCharging() != null ? ps.getFastCharging().getTotalCapacity() : 0 %> slots</span>
                                    <span class="badge bg-info text-dark">Normal: <%= ps.getNormalCharging() != null ? ps.getNormalCharging().getTotalCapacity() : 0 %> slots</span>
                                </td>
                                <td class="text-end">
                                    <form action="${pageContext.request.contextPath}/admin/approve-station" method="POST" class="d-inline">
                                        <input type="hidden" name="stationId" value="<%= ps.getId() %>">
                                        <button type="submit" class="btn btn-sm btn-success fw-semibold">
                                            <i class="bi bi-check-circle me-1"></i> Approve
                                        </button>
                                    </form>
                                    <button type="button" class="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#rejectModal<%= ps.getId() %>">
                                        <i class="bi bi-x-circle me-1"></i> Reject
                                    </button>

                                    <!-- Reject Modal -->
                                    <div class="modal fade text-start" id="rejectModal<%= ps.getId() %>" tabindex="-1">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <form action="${pageContext.request.contextPath}/admin/reject-station" method="POST">
                                                    <input type="hidden" name="stationId" value="<%= ps.getId() %>">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title fw-bold">Reject Station: <%= ps.getName() %></h5>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <label class="form-label fw-semibold">Reason for Rejection:</label>
                                                        <textarea name="reason" rows="3" class="form-control" placeholder="Specify why this station cannot be approved..." required></textarea>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                                        <button type="submit" class="btn btn-danger">Confirm Rejection</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        <% } %>
                    </tbody>
                </table>
            </div>
        </div>
    <% } %>

    <!-- Popular Stations & Recent Bookings -->
    <div class="row g-4">
        <div class="col-lg-6">
            <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-trophy-fill text-warning me-2"></i> Top Performing Stations</h5>
                    <a href="${pageContext.request.contextPath}/admin/stations" class="btn btn-sm btn-outline-secondary">Manage All</a>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small">
                            <tr>
                                <th>Station Name</th>
                                <th>City</th>
                                <th>Bookings</th>
                                <th>Rating</th>
                                <th class="text-end">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% if (popularStations != null && !popularStations.isEmpty()) {
                                for (Map<String, Object> ps : popularStations) { %>
                                    <tr>
                                        <td><strong><%= ps.get("name") %></strong></td>
                                        <td><span class="badge bg-light text-dark border"><%= ps.get("city") %></span></td>
                                        <td><span class="badge bg-success-subtle text-success"><%= ps.get("bookingCount") %> slots</span></td>
                                        <td><i class="bi bi-star-fill text-warning small"></i> <%= ps.get("avgRating") %></td>
                                        <td class="text-end fw-bold text-success">₹<%= ps.get("totalRevenue") %></td>
                                    </tr>
                            <%  }
                               } else { %>
                                <tr><td colspan="5" class="text-center py-3 text-muted">No station records yet.</td></tr>
                            <% } %>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="col-lg-6">
            <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-clock-history text-primary me-2"></i> Recent Platform Bookings</h5>
                    <a href="${pageContext.request.contextPath}/admin/bookings" class="btn btn-sm btn-outline-secondary">View All</a>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small">
                            <tr>
                                <th>Ref</th>
                                <th>User</th>
                                <th>Station</th>
                                <th>Amount</th>
                                <th class="text-end">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% if (recentBookings != null && !recentBookings.isEmpty()) {
                                for (SlotBooking b : recentBookings) { %>
                                    <tr>
                                        <td><span class="font-monospace small fw-bold"><%= b.getBookingNumber() %></span></td>
                                        <td><%= b.getUserName() %></td>
                                        <td><small class="text-muted"><%= b.getStationName() %></small></td>
                                        <td><strong>₹<%= b.getAmount() %></strong></td>
                                        <td class="text-end">
                                            <% if ("BOOKED".equalsIgnoreCase(b.getStatus())) { %>
                                                <span class="badge bg-success-subtle text-success">Booked</span>
                                            <% } else if ("COMPLETED".equalsIgnoreCase(b.getStatus())) { %>
                                                <span class="badge bg-primary-subtle text-primary">Completed</span>
                                            <% } else if ("CANCELLED".equalsIgnoreCase(b.getStatus())) { %>
                                                <span class="badge bg-danger-subtle text-danger">Cancelled</span>
                                            <% } else { %>
                                                <span class="badge bg-warning-subtle text-warning">Pending</span>
                                            <% } %>
                                        </td>
                                    </tr>
                            <%  }
                               } else { %>
                                <tr><td colspan="5" class="text-center py-3 text-muted">No bookings recorded yet.</td></tr>
                            <% } %>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/includes/footer.jsp" />

