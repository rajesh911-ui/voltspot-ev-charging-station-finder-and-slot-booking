<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.math.BigDecimal" %>
<%@ page import="com.voltspot.model.Payment" %>

<%
    List<Payment> payments = (List<Payment>) request.getAttribute("payments");
    BigDecimal totalRevenue = (BigDecimal) request.getAttribute("totalRevenue");
    List<Map<String, Object>> methodBreakdown = (List<Map<String, Object>>) request.getAttribute("methodBreakdown");

    request.setAttribute("pageTitle", "Payments Ledger - Admin Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill">Admin Management</span>
            <h2 class="fw-bold mb-0">Payments &amp; Transactions Ledger</h2>
            <small class="text-muted">Audit trail of all incoming slot booking payments</small>
        </div>
        <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Dashboard
        </a>
    </div>

    <!-- Revenue Summary Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card p-3 border-0 shadow-sm bg-white">
                <small class="text-muted fw-semibold d-block">Total Platform Revenue</small>
                <h2 class="fw-bold text-success mb-0">₹<%= totalRevenue != null ? totalRevenue : '0.00' %></h2>
                <small class="text-muted">Settled via payment gateway</small>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card p-3 border-0 shadow-sm bg-white">
                <small class="text-muted fw-semibold d-block">Completed Transactions</small>
                <h2 class="fw-bold text-dark mb-0"><%= payments != null ? payments.size() : 0 %></h2>
                <small class="text-success"><i class="bi bi-shield-check"></i> 100% Verified records</small>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card p-3 border-0 shadow-sm bg-white">
                <small class="text-muted fw-semibold d-block">Accepted Gateways</small>
                <div class="d-flex gap-2 mt-2">
                    <span class="badge bg-primary">Card</span>
                    <span class="badge bg-success">UPI QR</span>
                    <span class="badge bg-info">Net Banking</span>
                    <span class="badge bg-warning text-dark">Wallet</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Methods Breakdown Cards -->
    <% if (methodBreakdown != null && !methodBreakdown.isEmpty()) { %>
        <div class="card p-3 border-0 shadow-sm mb-4 bg-white">
            <h6 class="fw-bold mb-3">Revenue by Payment Method</h6>
            <div class="row g-2 text-center">
                <% for (Map<String, Object> mb : methodBreakdown) { %>
                    <div class="col-md-3 col-6">
                        <div class="p-2 border rounded bg-light">
                            <div class="fw-bold text-secondary small"><%= mb.get("method") %></div>
                            <div class="fs-5 fw-bold text-dark">₹<%= mb.get("amount") %></div>
                            <small class="text-muted"><%= mb.get("count") %> transactions</small>
                        </div>
                    </div>
                <% } %>
            </div>
        </div>
    <% } %>

    <!-- Transactions Table -->
    <% if (payments == null || payments.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <p class="text-muted">No payment transactions recorded.</p>
        </div>
    <% } else { %>
        <div class="card shadow-sm border-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr>
                            <th>Transaction ID</th>
                            <th>Booking Ref</th>
                            <th>Customer Name</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Date &amp; Time</th>
                            <th>Status</th>
                            <th class="text-end">Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (Payment p : payments) { %>
                            <tr>
                                <td><span class="font-monospace fw-bold small text-dark"><%= p.getTransactionId() %></span></td>
                                <td><span class="font-monospace small"><%= p.getBookingNumber() %></span></td>
                                <td><strong><%= p.getUserName() %></strong></td>
                                <td><strong class="text-success">₹<%= p.getAmount() %></strong></td>
                                <td><span class="badge bg-secondary"><%= p.getPaymentMethod() %></span></td>
                                <td><small class="text-muted"><%= p.getPaymentDate() %></small></td>
                                <td><span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check2"></i> <%= p.getPaymentStatus() %></span></td>
                                <td class="text-end">
                                    <a href="${pageContext.request.contextPath}/invoice?bookingId=<%= p.getBookingId() %>" class="btn btn-sm btn-outline-primary" title="View Tax Invoice">
                                        <i class="bi bi-receipt"></i>
                                    </a>
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

