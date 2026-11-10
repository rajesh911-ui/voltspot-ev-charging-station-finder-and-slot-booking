<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.SlotBooking" %>

<%
    List<SlotBooking> bookings = (List<SlotBooking>) request.getAttribute("bookings");
    request.setAttribute("pageTitle", "Customer Bookings - Operator Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management</span>
            <h2 class="fw-bold mb-0">Customer Slot Bookings</h2>
            <small class="text-muted">Monitor and update slot reservation statuses across your charging facilities</small>
        </div>
        <a href="${pageContext.request.contextPath}/operator/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Dashboard
        </a>
    </div>

    <% if (bookings == null || bookings.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <i class="bi bi-calendar-x text-muted display-4 mb-3"></i>
            <h4>No customer bookings yet</h4>
            <p class="text-muted">Bookings created by drivers for your charging stations will appear here.</p>
        </div>
    <% } else { %>
        <div class="card shadow-sm border-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr>
                            <th>Ref Number</th>
                            <th>Station</th>
                            <th>Customer &amp; Contact</th>
                            <th>Charging Type</th>
                            <th>Slot Date &amp; Time</th>
                            <th>Vehicle</th>
                            <th>Status</th>
                            <th class="text-end">Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (SlotBooking b : bookings) { %>
                            <tr>
                                <td><span class="font-monospace small fw-bold"><%= b.getBookingNumber() %></span></td>
                                <td><strong><%= b.getStationName() %></strong></td>
                                <td>
                                    <div class="fw-semibold small"><%= b.getUserName() %></div>
                                    <small class="text-muted"><i class="bi bi-telephone"></i> <%= b.getUserPhone() %></small>
                                </td>
                                <td>
                                    <span class="badge <%= "FAST".equalsIgnoreCase(b.getChargingType()) ? "bg-warning text-dark" : "bg-info text-dark" %>">
                                        <%= b.getChargingType() %>
                                    </span>
                                </td>
                                <td>
                                    <div class="small fw-semibold"><%= b.getBookingDate() %></div>
                                    <span class="badge bg-light text-dark border small"><%= b.getTimeSlot() %></span>
                                </td>
                                <td>
                                    <div class="small text-dark"><%= b.getVehicleModel() %></div>
                                    <small class="text-muted font-monospace"><%= b.getVehicleNumber() %></small>
                                </td>
                                <td>
                                    <% if ("BOOKED".equalsIgnoreCase(b.getStatus())) { %>
                                        <span class="badge bg-success-subtle text-success border border-success">Booked</span>
                                    <% } else if ("COMPLETED".equalsIgnoreCase(b.getStatus())) { %>
                                        <span class="badge bg-primary-subtle text-primary border border-primary">Completed</span>
                                    <% } else if ("CANCELLED".equalsIgnoreCase(b.getStatus())) { %>
                                        <span class="badge bg-danger-subtle text-danger border border-danger">Cancelled</span>
                                    <% } else { %>
                                        <span class="badge bg-warning-subtle text-warning border border-warning">Pending</span>
                                    <% } %>
                                </td>
                                <td class="text-end">
                                    <form action="${pageContext.request.contextPath}/operator/update-booking-status" method="POST" class="d-inline-flex gap-1">
                                        <input type="hidden" name="bookingId" value="<%= b.getId() %>">
                                        
                                        <select name="status" class="form-select form-select-sm" style="width: auto;">
                                            <option value="PENDING" <%= "PENDING".equalsIgnoreCase(b.getStatus()) ? "selected" : "" %>>Pending</option>
                                            <option value="BOOKED" <%= "BOOKED".equalsIgnoreCase(b.getStatus()) ? "selected" : "" %>>Booked</option>
                                            <option value="COMPLETED" <%= "COMPLETED".equalsIgnoreCase(b.getStatus()) ? "selected" : "" %>>Completed</option>
                                            <option value="CANCELLED" <%= "CANCELLED".equalsIgnoreCase(b.getStatus()) ? "selected" : "" %>>Cancelled</option>
                                        </select>

                                        <button type="submit" class="btn btn-sm btn-primary" title="Save Status">
                                            <i class="bi bi-check-lg"></i>
                                        </button>
                                    </form>
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

