<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.SlotBooking" %>
<%@ page import="com.voltspot.model.Feedback" %>
<%@ page import="com.voltspot.model.User" %>

<%
    User currentUser = (User) session.getAttribute("user");
    List<ChargingStation> myStations = (List<ChargingStation>) request.getAttribute("myStations");
    List<SlotBooking> recentBookings = (List<SlotBooking>) request.getAttribute("recentBookings");
    List<Feedback> recentFeedbacks = (List<Feedback>) request.getAttribute("recentFeedbacks");

    request.setAttribute("pageTitle", "Operator Dashboard - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <!-- Operator Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management Portal</span>
            <h2 class="fw-bold mb-0">Charging Hubs Overview</h2>
            <small class="text-muted">Welcome, <%= currentUser != null ? currentUser.getName() : "Station Operator" %></small>
        </div>
        <div class="d-flex gap-2">
            <a href="${pageContext.request.contextPath}/operator/add-station" class="btn btn-success fw-semibold">
                <i class="bi bi-plus-circle me-1"></i> Register New Station
            </a>
            <a href="${pageContext.request.contextPath}/operator/bookings" class="btn btn-outline-primary fw-semibold">
                <i class="bi bi-calendar-check me-1"></i> View Bookings
            </a>
        </div>
    </div>

    <!-- Metrics Cards Row -->
    <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
            <div class="card p-3 border-0 shadow-sm bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted fw-semibold d-block">Total Stations</small>
                        <h3 class="fw-bold mb-0 text-dark">${totalStations != null ? totalStations : 0}</h3>
                        <small class="text-success"><i class="bi bi-check-circle"></i> ${approvedStations} Approved &bull; ${pendingStations} Pending</small>
                    </div>
                    <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                        <i class="bi bi-ev-station-fill fs-3"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 col-sm-6">
            <div class="card p-3 border-0 shadow-sm bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted fw-semibold d-block">Active Booked Slots</small>
                        <h3 class="fw-bold mb-0 text-success">${activeBookings != null ? activeBookings : 0}</h3>
                        <small class="text-muted">Scheduled by drivers</small>
                    </div>
                    <div class="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                        <i class="bi bi-lightning-charge-fill fs-3"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 col-sm-6">
            <div class="card p-3 border-0 shadow-sm bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted fw-semibold d-block">Total Bookings</small>
                        <h3 class="fw-bold mb-0 text-dark">${totalBookings != null ? totalBookings : 0}</h3>
                        <small class="text-info"><i class="bi bi-flag-fill"></i> ${completedBookings} Completed</small>
                    </div>
                    <div class="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                        <i class="bi bi-calendar-event-fill fs-3"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-3 col-sm-6">
            <div class="card p-3 border-0 shadow-sm bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted fw-semibold d-block">Gross Revenue</small>
                        <h3 class="fw-bold mb-0 text-success">₹${totalRevenue != null ? totalRevenue : '0.00'}</h3>
                        <small class="text-muted">Processed payments</small>
                    </div>
                    <div class="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                        <i class="bi bi-cash-stack fs-3"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Bookings Table -->
    <div class="row g-4 mb-4">
        <div class="col-lg-8">
            <div class="card shadow-sm border-0">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-list-check me-2 text-primary"></i> Incoming Customer Bookings</h5>
                    <a href="${pageContext.request.contextPath}/operator/bookings" class="btn btn-sm btn-outline-primary">View All</a>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small">
                            <tr>
                                <th>Booking Ref</th>
                                <th>Station</th>
                                <th>Driver</th>
                                <th>Date &amp; Slot</th>
                                <th>Status</th>
                                <th class="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% if (recentBookings != null && !recentBookings.isEmpty()) {
                                for (SlotBooking b : recentBookings) { %>
                                    <tr>
                                        <td><span class="font-monospace small fw-bold"><%= b.getBookingNumber() %></span></td>
                                        <td><%= b.getStationName() %></td>
                                        <td>
                                            <div class="small fw-semibold"><%= b.getUserName() %></div>
                                            <small class="text-muted"><%= b.getUserPhone() %></small>
                                        </td>
                                        <td>
                                            <div class="small"><%= b.getBookingDate() %></div>
                                            <span class="badge bg-light text-dark border small"><%= b.getTimeSlot() %></span>
                                        </td>
                                        <td>
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
                                        <td class="text-end">
                                            <form action="${pageContext.request.contextPath}/operator/update-booking-status" method="POST" class="d-inline">
                                                <input type="hidden" name="bookingId" value="<%= b.getId() %>">
                                                <% if ("BOOKED".equalsIgnoreCase(b.getStatus())) { %>
                                                    <input type="hidden" name="status" value="COMPLETED">
                                                    <button type="submit" class="btn btn-sm btn-success" title="Mark Completed">
                                                        <i class="bi bi-check2"></i> Complete
                                                    </button>
                                                <% } else if ("PENDING".equalsIgnoreCase(b.getStatus())) { %>
                                                    <input type="hidden" name="status" value="BOOKED">
                                                    <button type="submit" class="btn btn-sm btn-primary" title="Confirm Booking">
                                                        <i class="bi bi-check"></i> Confirm
                                                    </button>
                                                <% } %>
                                            </form>
                                        </td>
                                    </tr>
                            <%  }
                               } else { %>
                                <tr>
                                    <td colspan="6" class="text-center py-4 text-muted">No customer bookings recorded yet.</td>
                                </tr>
                            <% } %>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Recent Customer Feedback Column -->
        <div class="col-lg-4">
            <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-star-fill text-warning me-2"></i> Recent Feedback</h5>
                    <a href="${pageContext.request.contextPath}/operator/feedback" class="btn btn-sm btn-outline-warning text-dark">View All</a>
                </div>
                <div class="card-body p-3">
                    <% if (recentFeedbacks != null && !recentFeedbacks.isEmpty()) {
                        for (Feedback fb : recentFeedbacks) { %>
                            <div class="border-bottom pb-2 mb-2">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <strong class="small text-dark"><%= fb.getUserName() %></strong>
                                    <span class="star-rating small">
                                        <% for (int i = 1; i <= fb.getRating(); i++) { %><i class="bi bi-star-fill text-warning"></i><% } %>
                                    </span>
                                </div>
                                <p class="small text-muted mb-1"><%= fb.getComments() %></p>
                                <small class="text-secondary opacity-75" style="font-size:0.7rem;"><%= fb.getStationName() %> &bull; <%= fb.getCreatedAt() %></small>
                            </div>
                    <%  }
                       } else { %>
                            <p class="text-muted small text-center py-4">No reviews submitted yet.</p>
                    <% } %>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/includes/footer.jsp" />

