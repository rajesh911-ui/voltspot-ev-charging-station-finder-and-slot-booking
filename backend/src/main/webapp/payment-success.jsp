<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.voltspot.model.SlotBooking" %>
<%@ page import="com.voltspot.model.Payment" %>
<%@ page import="com.voltspot.model.Invoice" %>

<%
    SlotBooking booking = (SlotBooking) request.getAttribute("booking");
    Payment payment = (Payment) request.getAttribute("payment");
    Invoice invoice = (Invoice) request.getAttribute("invoice");

    if (booking == null) {
        response.sendRedirect(request.getContextPath() + "/my-bookings");
        return;
    }

    request.setAttribute("pageTitle", "Booking Confirmed - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-7 col-lg-6">
            <div class="card shadow-sm border-0 text-center p-4 p-md-5">
                <div class="mb-4">
                    <div class="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style="width: 80px; height: 80px;">
                        <i class="bi bi-check2-circle fs-1"></i>
                    </div>
                </div>

                <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold mx-auto mb-2">Slot Reserved &amp; Paid</span>
                <h3 class="fw-bold text-dark">Charging Slot Confirmed!</h3>
                <p class="text-muted small mb-4">Your EV charging port is locked and ready for your scheduled arrival.</p>

                <div class="p-4 bg-light rounded-3 border text-start mb-4 small">
                    <div class="d-flex justify-content-between py-1 border-bottom">
                        <span class="text-muted">Booking Reference:</span>
                        <strong class="font-monospace text-dark"><%= booking.getBookingNumber() %></strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom">
                        <span class="text-muted">Station:</span>
                        <strong class="text-dark"><%= booking.getStationName() %></strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom">
                        <span class="text-muted">Scheduled Slot:</span>
                        <strong><%= booking.getBookingDate() %> | <%= booking.getTimeSlot() %></strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom">
                        <span class="text-muted">Charging Speed:</span>
                        <span class="badge bg-warning text-dark"><%= booking.getChargingType() %></span>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom">
                        <span class="text-muted">Transaction ID:</span>
                        <span class="font-monospace"><%= payment != null ? payment.getTransactionId() : "TXN-CONFIRMED" %></span>
                    </div>
                    <div class="d-flex justify-content-between py-1 pt-2">
                        <span class="fw-bold text-dark">Total Amount Paid:</span>
                        <strong class="text-success fs-6">₹<%= payment != null ? payment.getAmount() : booking.getAmount() %></strong>
                    </div>
                </div>

                <div class="d-grid gap-2">
                    <a href="${pageContext.request.contextPath}/invoice?bookingId=<%= booking.getId() %>" class="btn btn-success py-2 fw-semibold">
                        <i class="bi bi-file-earmark-arrow-down-fill me-1"></i> View / Download Tax Invoice
                    </a>
                    <a href="${pageContext.request.contextPath}/my-bookings" class="btn btn-outline-secondary py-2">
                        <i class="bi bi-calendar-check me-1"></i> Go to My Bookings
                    </a>
                    <a href="${pageContext.request.contextPath}/stations" class="btn btn-link text-decoration-none small text-muted">
                        Find another station
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/includes/footer.jsp" />

