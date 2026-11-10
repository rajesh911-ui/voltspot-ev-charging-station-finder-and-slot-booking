<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.SlotBooking" %>

<%
    List<SlotBooking> bookings = (List<SlotBooking>) request.getAttribute("bookings");
    request.setAttribute("pageTitle", "My Slot Bookings - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">My Charging Slot Bookings</h2>
            <p class="text-muted small">Manage your charging schedules, complete pending payments, and view invoices</p>
        </div>
        <a href="${pageContext.request.contextPath}/stations" class="btn btn-success fw-semibold">
            <i class="bi bi-plus-circle me-1"></i> Book New Slot
        </a>
    </div>

    <% if (bookings == null || bookings.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <i class="bi bi-calendar-x text-muted display-4 mb-3"></i>
            <h4>No bookings found</h4>
            <p class="text-muted">You have not booked any EV charging slots yet.</p>
            <div>
                <a href="${pageContext.request.contextPath}/stations" class="btn btn-success">Find a Charging Station</a>
            </div>
        </div>
    <% } else { %>
        <div class="card shadow-sm border-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr>
                            <th>Ref Number</th>
                            <th>Station &amp; City</th>
                            <th>Type</th>
                            <th>Date &amp; Slot</th>
                            <th>Vehicle</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (SlotBooking b : bookings) { %>
                            <tr>
                                <td>
                                    <span class="font-monospace fw-bold small text-dark"><%= b.getBookingNumber() %></span>
                                    <div class="text-muted opacity-75" style="font-size:0.75rem;"><%= b.getCreatedAt() %></div>
                                </td>
                                <td>
                                    <strong class="text-dark"><%= b.getStationName() %></strong>
                                    <div class="text-muted small"><i class="bi bi-geo-alt"></i> <%= b.getStationCity() %></div>
                                </td>
                                <td>
                                    <span class="badge <%= "FAST".equalsIgnoreCase(b.getChargingType()) ? "bg-warning text-dark" : "bg-info text-dark" %>">
                                        <%= b.getChargingType() %>
                                    </span>
                                </td>
                                <td>
                                    <div class="fw-semibold text-dark"><%= b.getBookingDate() %></div>
                                    <div class="text-muted small"><i class="bi bi-clock me-1"></i><%= b.getTimeSlot() %></div>
                                </td>
                                <td>
                                    <span class="small text-dark d-block"><%= b.getVehicleModel() %></span>
                                    <span class="badge bg-light text-secondary border font-monospace"><%= b.getVehicleNumber() %></span>
                                </td>
                                <td>
                                    <strong class="text-dark">₹<%= b.getAmount() %></strong>
                                </td>
                                <td>
                                    <% if ("BOOKED".equalsIgnoreCase(b.getStatus())) { %>
                                        <span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check-circle me-1"></i> Booked</span>
                                    <% } else if ("COMPLETED".equalsIgnoreCase(b.getStatus())) { %>
                                        <span class="badge bg-primary-subtle text-primary border border-primary"><i class="bi bi-flag-fill me-1"></i> Completed</span>
                                    <% } else if ("CANCELLED".equalsIgnoreCase(b.getStatus())) { %>
                                        <span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-x-circle me-1"></i> Cancelled</span>
                                    <% } else { %>
                                        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning"><i class="bi bi-hourglass-split me-1"></i> Pending Payment</span>
                                    <% } %>
                                </td>
                                <td class="text-end">
                                    <div class="d-inline-flex gap-1">
                                        <% if ("PENDING".equalsIgnoreCase(b.getStatus())) { %>
                                            <a href="${pageContext.request.contextPath}/payment?bookingId=<%= b.getId() %>" class="btn btn-sm btn-warning text-dark fw-bold">
                                                <i class="bi bi-credit-card"></i> Pay Now
                                            </a>
                                        <% } %>

                                        <% if ("BOOKED".equalsIgnoreCase(b.getStatus()) || "COMPLETED".equalsIgnoreCase(b.getStatus())) { %>
                                            <a href="${pageContext.request.contextPath}/invoice?bookingId=<%= b.getId() %>" class="btn btn-sm btn-outline-primary" title="View Tax Invoice">
                                                <i class="bi bi-receipt"></i> Invoice
                                            </a>
                                        <% } %>

                                        <% if ("COMPLETED".equalsIgnoreCase(b.getStatus())) { %>
                                            <a href="${pageContext.request.contextPath}/station-detail?id=<%= b.getStationId() %>" class="btn btn-sm btn-outline-warning text-dark" title="Rate Station">
                                                <i class="bi bi-star"></i> Rate
                                            </a>
                                        <% } %>

                                        <% if ("PENDING".equalsIgnoreCase(b.getStatus()) || "BOOKED".equalsIgnoreCase(b.getStatus())) { %>
                                            <form action="${pageContext.request.contextPath}/cancel-booking" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to cancel this booking?');">
                                                <input type="hidden" name="bookingId" value="<%= b.getId() %>">
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Cancel Booking">
                                                    <i class="bi bi-x-lg"></i>
                                                </button>
                                            </form>
                                        <% } %>
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

