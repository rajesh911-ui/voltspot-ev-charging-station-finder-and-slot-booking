<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.StationChargingType" %>

<%
    List<ChargingStation> stations = (List<ChargingStation>) request.getAttribute("stations");
    request.setAttribute("pageTitle", "My Stations - Operator Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management</span>
            <h2 class="fw-bold mb-0">My Charging Stations</h2>
            <small class="text-muted">Manage stations, pricing, and charging slot configurations</small>
        </div>
        <a href="${pageContext.request.contextPath}/operator/add-station" class="btn btn-success fw-semibold">
            <i class="bi bi-plus-circle me-1"></i> Register New Station
        </a>
    </div>

    <% if (stations == null || stations.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <i class="bi bi-ev-station text-muted display-4 mb-3"></i>
            <h4>No stations registered yet</h4>
            <p class="text-muted">Register your first electric vehicle charging hub to start accepting driver bookings.</p>
            <div>
                <a href="${pageContext.request.contextPath}/operator/add-station" class="btn btn-primary">Register New Station</a>
            </div>
        </div>
    <% } else { %>
        <div class="row g-4">
            <% for (ChargingStation s : stations) {
                StationChargingType fast = s.getFastCharging();
                StationChargingType normal = s.getNormalCharging();
            %>
                <div class="col-lg-6">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-light text-dark border">
                                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> <%= s.getCity() %>
                                </span>
                                <div>
                                    <% if ("APPROVED".equalsIgnoreCase(s.getStatus())) { %>
                                        <span class="badge bg-success-subtle text-success border border-success">
                                            <i class="bi bi-check-circle-fill me-1"></i> Approved &amp; Live
                                        </span>
                                    <% } else if ("REJECTED".equalsIgnoreCase(s.getStatus())) { %>
                                        <span class="badge bg-danger-subtle text-danger border border-danger">
                                            <i class="bi bi-x-circle-fill me-1"></i> Rejected
                                        </span>
                                    <% } else { %>
                                        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning">
                                            <i class="bi bi-hourglass-split me-1"></i> Pending Admin Approval
                                        </span>
                                    <% } %>
                                </div>
                            </div>

                            <h4 class="fw-bold text-dark mb-1"><%= s.getName() %></h4>
                            <p class="text-muted small mb-2"><i class="bi bi-pin-map text-secondary me-1"></i> <%= s.getAddress() %></p>
                            <p class="text-muted small mb-3">
                                <i class="bi bi-telephone text-secondary me-1"></i> <%= s.getContactNumber() %> &bull; 
                                <i class="bi bi-clock me-1"></i> <%= s.getOpeningTime() %> - <%= s.getClosingTime() %> &bull;
                                <span class="star-rating small"><i class="bi bi-star-fill text-warning"></i> <%= s.getAverageRating() > 0 ? s.getAverageRating() : '5.0' %></span>
                            </p>

                            <% if ("REJECTED".equalsIgnoreCase(s.getStatus()) && s.getRejectionReason() != null) { %>
                                <div class="alert alert-danger p-2 small mb-3">
                                    <strong>Admin Rejection Reason:</strong> <%= s.getRejectionReason() %>
                                </div>
                            <% } %>

                            <!-- Fast & Normal Breakdown -->
                            <div class="row g-2 mb-3 mt-auto">
                                <div class="col-6">
                                    <div class="p-2 bg-light rounded border small">
                                        <div class="fw-bold text-warning-emphasis">FAST CHARGING</div>
                                        <div class="fw-bold fs-6 text-dark">₹<%= fast != null ? fast.getPricePerSlot() : '280.00' %>/slot</div>
                                        <div class="text-muted"><%= fast != null ? fast.getPowerKw() : '150' %> kW &bull; <%= fast != null ? fast.getTotalCapacity() : '6' %> ports</div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-2 bg-light rounded border small">
                                        <div class="fw-bold text-primary">NORMAL CHARGING</div>
                                        <div class="fw-bold fs-6 text-dark">₹<%= normal != null ? normal.getPricePerSlot() : '95.00' %>/slot</div>
                                        <div class="text-muted"><%= normal != null ? normal.getPowerKw() : '22' %> kW &bull; <%= normal != null ? normal.getTotalCapacity() : '10' %> ports</div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                                <small class="text-muted font-monospace">GPS: <%= s.getLatitude() %>, <%= s.getLongitude() %></small>
                                <div class="d-flex gap-2">
                                    <a href="${pageContext.request.contextPath}/operator/edit-station?id=<%= s.getId() %>" class="btn btn-sm btn-outline-secondary">
                                        <i class="bi bi-pencil me-1"></i> Edit
                                    </a>
                                    <a href="${pageContext.request.contextPath}/station-detail?id=<%= s.getId() %>" class="btn btn-sm btn-outline-success">
                                        <i class="bi bi-eye me-1"></i> Preview
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <% } %>
        </div>
    <% } %>
</div>

<jsp:include page="/includes/footer.jsp" />

