<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.StationChargingType" %>

<%
    List<ChargingStation> stations = (List<ChargingStation>) request.getAttribute("stations");
    request.setAttribute("pageTitle", "Manage Stations - Admin Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill">Admin Management</span>
            <h2 class="fw-bold mb-0">Manage All Charging Stations</h2>
            <small class="text-muted">Master database of all charging facilities across operators</small>
        </div>
        <div class="d-flex gap-2">
            <a href="${pageContext.request.contextPath}/admin/pending-stations" class="btn btn-warning text-dark fw-semibold">
                <i class="bi bi-patch-check-fill me-1"></i> Pending Approvals
            </a>
            <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-1"></i> Dashboard
            </a>
        </div>
    </div>

    <% if (stations == null || stations.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <p class="text-muted">No stations registered in the system.</p>
        </div>
    <% } else { %>
        <div class="card shadow-sm border-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr>
                            <th>ID</th>
                            <th>Station Name</th>
                            <th>Operator</th>
                            <th>City &amp; Address</th>
                            <th>Capacities</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (ChargingStation s : stations) {
                            StationChargingType fast = s.getFastCharging();
                            StationChargingType normal = s.getNormalCharging();
                        %>
                            <tr>
                                <td>#<%= s.getId() %></td>
                                <td>
                                    <strong class="text-dark"><%= s.getName() %></strong>
                                    <div class="small text-muted font-monospace"><%= s.getContactNumber() %></div>
                                </td>
                                <td>
                                    <span class="small fw-semibold text-primary"><%= s.getOperatorName() != null ? s.getOperatorName() : "Operator #" + s.getOperatorId() %></span>
                                </td>
                                <td>
                                    <div><%= s.getAddress() %></div>
                                    <span class="badge bg-light text-dark border small"><%= s.getCity() %></span>
                                </td>
                                <td>
                                    <small class="d-block text-warning-emphasis">Fast: <%= fast != null ? fast.getTotalCapacity() : 0 %> ports (₹<%= fast != null ? fast.getPricePerSlot() : "0" %>)</small>
                                    <small class="d-block text-primary">Normal: <%= normal != null ? normal.getTotalCapacity() : 0 %> ports (₹<%= normal != null ? normal.getPricePerSlot() : "0" %>)</small>
                                </td>
                                <td>
                                    <span class="star-rating small">
                                        <i class="bi bi-star-fill text-warning"></i> <%= s.getAverageRating() > 0 ? s.getAverageRating() : '5.0' %>
                                    </span>
                                </td>
                                <td>
                                    <% if ("APPROVED".equalsIgnoreCase(s.getStatus())) { %>
                                        <span class="badge bg-success-subtle text-success border border-success">Approved</span>
                                    <% } else if ("REJECTED".equalsIgnoreCase(s.getStatus())) { %>
                                        <span class="badge bg-danger-subtle text-danger border border-danger">Rejected</span>
                                    <% } else { %>
                                        <span class="badge bg-warning-subtle text-warning border border-warning">Pending</span>
                                    <% } %>
                                </td>
                                <td class="text-end">
                                    <div class="d-inline-flex gap-1">
                                        <a href="${pageContext.request.contextPath}/station-detail?id=<%= s.getId() %>" class="btn btn-sm btn-outline-secondary" title="View Public Page">
                                            <i class="bi bi-eye"></i>
                                        </a>

                                        <% if (!"APPROVED".equalsIgnoreCase(s.getStatus())) { %>
                                            <form action="${pageContext.request.contextPath}/admin/approve-station" method="POST" class="d-inline">
                                                <input type="hidden" name="stationId" value="<%= s.getId() %>">
                                                <button type="submit" class="btn btn-sm btn-success" title="Approve Station">
                                                    <i class="bi bi-check-lg"></i>
                                                </button>
                                            </form>
                                        <% } %>

                                        <form action="${pageContext.request.contextPath}/admin/delete-station" method="POST" class="d-inline" onsubmit="return confirm('Permanently delete station: <%= s.getName() %>?');">
                                            <input type="hidden" name="stationId" value="<%= s.getId() %>">
                                            <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete Station">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <% } %>
                    </tbody>
                </table>
            </div>
        </div>
    <% } %>
</div>

<jsp:include page="/includes/footer.jsp" />

