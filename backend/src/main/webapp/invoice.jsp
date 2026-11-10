<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.voltspot.model.Invoice" %>

<%
    Invoice invoice = (Invoice) request.getAttribute("invoice");
    if (invoice == null) {
        response.sendRedirect(request.getContextPath() + "/my-bookings");
        return;
    }
    request.setAttribute("pageTitle", "Tax Invoice " + invoice.getInvoiceNumber() + " - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />

<div class="container py-4">
    <!-- Action Bar (Hidden in Print) -->
    <div class="d-flex justify-content-between align-items-center mb-4 no-print">
        <a href="${pageContext.request.contextPath}/my-bookings" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Back to My Bookings
        </a>
        <div class="d-flex gap-2">
            <button onclick="window.print()" class="btn btn-success fw-semibold">
                <i class="bi bi-printer-fill me-1"></i> Print / Download PDF
            </button>
        </div>
    </div>

    <!-- Official Printable Invoice Box -->
    <div class="invoice-box mx-auto" style="max-width: 820px;">
        <!-- Invoice Header -->
        <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
            <div>
                <h3 class="fw-bold text-success mb-1">
                    <i class="bi bi-lightning-charge-fill me-1"></i> VoltSpot EV India
                </h3>
                <p class="small text-muted mb-0">VoltSpot Technologies India Pvt Ltd</p>
                <p class="small text-muted mb-0">GSTIN: <strong class="text-dark">36AABCV8910M1Z5</strong> &bull; SAC: <strong class="text-dark">998714</strong></p>
                <p class="small text-muted mb-0">support@voltspot.in &bull; +91 98000 12345</p>
            </div>
            <div class="text-end">
                <div class="mb-2">
                    <span class="paid-stamp">PAID IN FULL</span>
                </div>
                <h4 class="fw-bold text-dark mb-1">TAX INVOICE (GST)</h4>
                <div class="text-muted small">Invoice No: <strong class="text-dark font-monospace"><%= invoice.getInvoiceNumber() %></strong></div>
                <div class="text-muted small">Date: <strong><%= invoice.getInvoiceDate() %></strong></div>
                <div class="text-muted small">Status: <span class="badge bg-success">PAID (INR)</span></div>
            </div>
        </div>

        <!-- Billing Parties -->
        <div class="row g-4 mb-4 pb-3 border-bottom">
            <div class="col-6">
                <h6 class="text-uppercase text-muted fw-bold small mb-2">Billed To (EV Driver):</h6>
                <strong class="text-dark fs-6"><%= invoice.getCustomerName() %></strong>
                <div class="small text-muted"><i class="bi bi-envelope"></i> <%= invoice.getCustomerEmail() %></div>
                <div class="small text-muted"><i class="bi bi-telephone"></i> <%= invoice.getCustomerPhone() %></div>
            </div>
            <div class="col-6 text-end">
                <h6 class="text-uppercase text-muted fw-bold small mb-2">Charging Facility:</h6>
                <strong class="text-dark fs-6"><%= invoice.getStationName() %></strong>
                <div class="small text-muted"><%= invoice.getStationAddress() %>, <%= invoice.getStationCity() %></div>
                <div class="small text-muted">Facility Contact: <%= invoice.getStationContact() %></div>
            </div>
        </div>

        <!-- Service Itemization -->
        <div class="table-responsive mb-4">
            <table class="table table-bordered mb-0">
                <thead class="table-light small text-uppercase">
                    <tr>
                        <th>#</th>
                        <th>Service Description (SAC 998714)</th>
                        <th>Slot Schedule</th>
                        <th>EV Vehicle</th>
                        <th class="text-end">Amount (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>
                            <strong class="text-dark">EV Charging Slot Reservation (<%= invoice.getChargingType() %> Speed)</strong>
                            <div class="small text-muted">Booking Reference: <span class="font-monospace"><%= invoice.getBookingNumber() %></span></div>
                        </td>
                        <td>
                            <div><%= invoice.getBookingDate() %></div>
                            <small class="text-muted"><%= invoice.getTimeSlot() %></small>
                        </td>
                        <td>
                            <div><%= invoice.getVehicleModel() %></div>
                            <small class="text-muted font-monospace"><%= invoice.getVehicleNumber() %></small>
                        </td>
                        <td class="text-end fw-bold text-dark">₹<%= invoice.getBaseAmount() %></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Financial Summary -->
        <div class="row g-4 align-items-center mb-4">
            <div class="col-sm-6">
                <div class="p-3 bg-light rounded-3 border small">
                    <div class="text-muted mb-1"><strong>Payment Authorization:</strong></div>
                    <div>Method: <span class="badge bg-success"><%= invoice.getPaymentMethod() %></span></div>
                    <div>Transaction ID: <span class="font-monospace text-dark"><%= invoice.getTransactionId() %></span></div>
                    <div class="text-success mt-1"><i class="bi bi-shield-check"></i> RBI Compliant UPI / RuPay Electronic Gateway</div>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="ms-auto" style="max-width: 300px;">
                    <div class="d-flex justify-content-between py-1 small">
                        <span class="text-muted">Base Service Fee:</span>
                        <span>₹<%= invoice.getBaseAmount() %></span>
                    </div>
                    <div class="d-flex justify-content-between py-1 small">
                        <span class="text-muted">CGST (9%):</span>
                        <span>₹<%= invoice.getTaxAmount() != null ? invoice.getTaxAmount().divide(new java.math.BigDecimal(2), 2, java.math.RoundingMode.HALF_UP) : "0.00" %></span>
                    </div>
                    <div class="d-flex justify-content-between py-1 small">
                        <span class="text-muted">SGST (9%):</span>
                        <span>₹<%= invoice.getTaxAmount() != null ? invoice.getTaxAmount().divide(new java.math.BigDecimal(2), 2, java.math.RoundingMode.HALF_UP) : "0.00" %></span>
                    </div>
                    <div class="d-flex justify-content-between py-2 border-top border-bottom mt-2 fs-5 fw-bold text-success">
                        <span>Total Paid (INR):</span>
                        <span>₹<%= invoice.getTotalAmount() %></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Invoice Footer & Stamp -->
        <div class="border-top pt-4 mt-4 d-flex justify-content-between align-items-end text-muted small">
            <div>
                <p class="mb-1"><strong>Terms &amp; Conditions:</strong></p>
                <p class="mb-0 text-secondary" style="font-size: 0.75rem;">
                    1. Slot cancellations are refundable up to 1 hour prior to scheduled slot.<br>
                    2. Overstaying past your 1-hour reservation may incur idle fees.<br>
                    3. This is a computer-generated tax invoice and requires no physical signature.
                </p>
            </div>
            <div class="text-end" style="min-width: 140px;">
                <div class="border-bottom pb-4 mb-1 text-center font-monospace text-success fw-bold">
                    [E-SIGNED]
                </div>
                <small class="d-block text-center">Authorized Signatory</small>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/includes/footer.jsp" />

