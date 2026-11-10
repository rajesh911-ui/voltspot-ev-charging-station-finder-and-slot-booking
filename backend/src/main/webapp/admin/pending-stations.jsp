<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.StationChargingType" %>

<%
    List<ChargingStation> pendingStations = (List<ChargingStation>) request.getAttribute("pendingStations");
    request.setAttribute("pageTitle", "Station Approvals - Admin Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-warning text-dark fw-semibold px-3 py-1 rounded-pill">Verification Queue</span>
            <h2 class="fw-bold mb-0">Newly Registered Stations Pending Approval</h2>
            <small class="text-muted">Review operator submissions before granting visibility to public EV users</small>
        </div>
        <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Dashboard
        </a>
    </div>

    <% if (pendingStations == null || pendingStations.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <div class="text-success display-4 mb-3"><i class="bi bi-check-circle-fill"></i></div>
            <h4>All Caught Up!</h4>
            <p class="text-muted">There are currently no charging stations awaiting administrator review.</p>
            <div>
                <a href="${pageContext.request.contextPath}/admin/stations" class="btn btn-outline-secondary">View All Active Stations</a>
            </div>
        </div>
    <% } else { %>
        <div class="row g-4">
            <% for (ChargingStation s : pendingStations) {
                StationChargingType fast = s.getFastCharging();
                StationChargingType normal = s.getNormalCharging();
            %>
                <div class="col-lg-6">
                    <div class="card border-warning shadow-sm h-100">
                        <div class="card-header bg-warning bg-opacity-10 py-3 d-flex justify-content-between align-items-center">
                            <span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i> Awaiting Approval</span>
                            <small class="text-muted">Submitted: <%= s.getCreatedAt() %></small>
                        </div>
                        <div class="card-body p-4 d-flex flex-column">
                            <h4 class="fw-bold text-dark mb-1"><%= s.getName() %></h4>
                            <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i> <%= s.getAddress() %>, <strong><%= s.getCity() %></strong></p>
                            
                            <div class="p-3 bg-light rounded-3 border small mb-3">
                                <div><strong>Operator:</strong> <%= s.getOperatorName() != null ? s.getOperatorName() : "Operator #" + s.getOperatorId() %></div>
                                <div><strong>Contact:</strong> <%= s.getContactNumber() %></div>
                                <div><strong>Hours:</strong> <%= s.getOpeningTime() %> - <%= s.getClosingTime() %></div>
                                <div><strong>Coordinates:</strong> <span class="font-monospace"><%= s.getLatitude() %>, <%= s.getLongitude() %></span></div>
                            </div>

                            <h6 class="fw-bold small text-uppercase text-muted mb-2">Configured Charging Infrastructure:</h6>
                            <div class="row g-2 mb-4">
                                <div class="col-6">
                                    <div class="border p-2 rounded bg-white small">
                                        <div class="fw-bold text-warning-emphasis">FAST CHARGING</div>
                                        <div>Rate: <strong>₹<%= fast != null ? fast.getPricePerSlot() : '280.00' %>/slot</strong></div>
                                        <div class="text-muted">Capacity: <%= fast != null ? fast.getTotalCapacity() : 0 %> ports &bull; <%= fast != null ? fast.getPowerKw() : 0 %> kW</div>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="border p-2 rounded bg-white small">
                                        <div class="fw-bold text-primary">NORMAL CHARGING</div>
                                        <div>Rate: <strong>₹<%= normal != null ? normal.getPricePerSlot() : '95.00' %>/slot</strong></div>
                                        <div class="text-muted">Capacity: <%= normal != null ? normal.getTotalCapacity() : 0 %> ports &bull; <%= normal != null ? normal.getPowerKw() : 0 %> kW</div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-auto">
                                <button type="button" class="btn btn-outline-danger px-4" data-bs-toggle="modal" data-bs-target="#rejectModal<%= s.getId() %>">
                                    <i class="bi bi-x-circle me-1"></i> Reject
                                </button>
                                <form action="${pageContext.request.contextPath}/admin/approve-station" method="POST" class="d-inline">
                                    <input type="hidden" name="stationId" value="<%= s.getId() %>">
                                    <button type="submit" class="btn btn-success px-4 fw-bold">
                                        <i class="bi bi-check-circle me-1"></i> Approve &amp; Publish
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal for Rejection Reason -->
                <div class="modal fade" id="rejectModal<%= s.getId() %>" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <form action="${pageContext.request.contextPath}/admin/reject-station" method="POST">
                                <input type="hidden" name="stationId" value="<%= s.getId() %>">
                                <div class="modal-header">
                                    <h5 class="modal-title fw-bold text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i> Reject Station</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <p class="small text-muted mb-3">Rejecting <strong><%= s.getName() %></strong> will notify the operator with your feedback reason.</p>
                                    <label class="form-label fw-semibold">Reason for Rejection</label>
                                    <textarea name="reason" rows="3" class="form-control" placeholder="Specify issues (e.g. invalid GPS coordinates, unverified address, unrealistic pricing)..." required></textarea>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-danger fw-semibold">Confirm Rejection</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            <% } %>
        </div>
    <% } %>
</div>

<jsp:include page="/includes/footer.jsp" />

