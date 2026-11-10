<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.voltspot.model.SlotBooking" %>
<%@ page import="java.math.BigDecimal" %>

<%
    SlotBooking booking = (SlotBooking) request.getAttribute("booking");
    BigDecimal baseAmount = (BigDecimal) request.getAttribute("baseAmount");
    BigDecimal taxAmount = (BigDecimal) request.getAttribute("taxAmount");
    BigDecimal totalAmount = (BigDecimal) request.getAttribute("totalAmount");

    if (booking == null) {
        response.sendRedirect(request.getContextPath() + "/my-bookings");
        return;
    }

    request.setAttribute("pageTitle", "Checkout & Payment - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow-sm border-0 overflow-hidden">
                <div class="card-header bg-dark text-white p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-success-subtle text-success mb-1">Step 2 of 2: Payment Authorization</span>
                            <h4 class="fw-bold mb-0">Complete Your Slot Booking</h4>
                        </div>
                        <div class="text-end">
                            <small class="text-secondary d-block">Booking Ref</small>
                            <span class="badge bg-secondary font-monospace"><%= booking.getBookingNumber() %></span>
                        </div>
                    </div>
                </div>

                <div class="card-body p-4 p-md-5">
                    <div class="row g-4 mb-4">
                        <!-- Order Summary Box -->
                        <div class="col-md-5 order-md-2">
                            <div class="p-4 bg-light rounded-3 border">
                                <h6 class="fw-bold mb-3 border-bottom pb-2">Reservation Summary</h6>
                                <p class="mb-1 fw-bold text-dark"><%= booking.getStationName() %></p>
                                <p class="small text-muted mb-2"><i class="bi bi-geo-alt"></i> <%= booking.getStationAddress() %></p>

                                <div class="small mb-3">
                                    <div class="d-flex justify-content-between py-1">
                                        <span class="text-muted">Type:</span>
                                        <strong><%= booking.getChargingType() %> Charging</strong>
                                    </div>
                                    <div class="d-flex justify-content-between py-1">
                                        <span class="text-muted">Date:</span>
                                        <strong><%= booking.getBookingDate() %></strong>
                                    </div>
                                    <div class="d-flex justify-content-between py-1">
                                        <span class="text-muted">Time Slot:</span>
                                        <strong><%= booking.getTimeSlot() %></strong>
                                    </div>
                                    <div class="d-flex justify-content-between py-1">
                                        <span class="text-muted">Vehicle:</span>
                                        <span><%= booking.getVehicleModel() %> (<%= booking.getVehicleNumber() %>)</span>
                                    </div>
                                </div>

                                <div class="border-top pt-2 small">
                                    <div class="d-flex justify-content-between py-1">
                                        <span class="text-muted">Slot Fee:</span>
                                        <span>₹<%= baseAmount %></span>
                                    </div>
                                    <div class="d-flex justify-content-between py-1">
                                        <span class="text-muted">GST (18% - CGST 9% + SGST 9%):</span>
                                        <span>₹<%= taxAmount %></span>
                                    </div>
                                    <div class="d-flex justify-content-between py-2 border-top mt-2 fs-5 fw-bold text-success">
                                        <span>Total Payable:</span>
                                        <span>₹<%= totalAmount %></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Form -->
                        <div class="col-md-7 order-md-1">
                            <form action="${pageContext.request.contextPath}/process-payment" method="POST">
                                <input type="hidden" name="bookingId" value="<%= booking.getId() %>">
                                <input type="hidden" name="totalAmount" value="<%= totalAmount %>">

                                <h6 class="fw-bold mb-3">Select Payment Method (India)</h6>

                                <div class="row g-2 mb-4">
                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="paymentMethod" id="payUPI" value="UPI" checked>
                                        <label class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center" for="payUPI">
                                            <i class="bi bi-qr-code-scan fs-3 text-success mb-1"></i>
                                            <span class="fw-semibold small">UPI (GPay / PhonePe / QR)</span>
                                        </label>
                                    </div>

                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="paymentMethod" id="payCard" value="CARD">
                                        <label class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center" for="payCard">
                                            <i class="bi bi-credit-card-2-front fs-3 text-primary mb-1"></i>
                                            <span class="fw-semibold small">RuPay / Debit / Credit</span>
                                        </label>
                                    </div>

                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="paymentMethod" id="payNet" value="NET_BANKING">
                                        <label class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center" for="payNet">
                                            <i class="bi bi-bank fs-3 text-info mb-1"></i>
                                            <span class="fw-semibold small">Net Banking (SBI / HDFC)</span>
                                        </label>
                                    </div>

                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="paymentMethod" id="payWallet" value="WALLET">
                                        <label class="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center" for="payWallet">
                                            <i class="bi bi-wallet2 fs-3 text-warning mb-1"></i>
                                            <span class="fw-semibold small">VoltSpot EV Wallet</span>
                                        </label>
                                    </div>
                                </div>

                                <!-- UPI Payment Section (Default for India) -->
                                <div id="upiPaymentSection" class="p-4 border rounded-3 bg-light mb-4 text-center">
                                    <div class="d-flex justify-content-center gap-3 mb-3">
                                        <span class="badge bg-white text-dark border p-2 shadow-sm"><i class="bi bi-google text-primary"></i> GPay</span>
                                        <span class="badge bg-white text-dark border p-2 shadow-sm"><i class="bi bi-phone text-purple"></i> PhonePe</span>
                                        <span class="badge bg-white text-dark border p-2 shadow-sm"><i class="bi bi-wallet text-info"></i> Paytm</span>
                                        <span class="badge bg-white text-dark border p-2 shadow-sm"><i class="bi bi-lightning-charge text-success"></i> BHIM</span>
                                    </div>
                                    <p class="small text-muted mb-2">Scan QR code using any UPI App to pay <strong>₹<%= totalAmount %></strong>:</p>
                                    <div class="bg-white p-3 d-inline-block rounded border shadow-sm mb-3 upi-qr-card position-relative">
                                        <div class="qr-laser-line"></div>
                                        <i class="bi bi-qr-code fs-1 text-dark" style="font-size: 120px !important;"></i>
                                    </div>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-white fw-semibold">UPI ID / VPA</span>
                                        <input type="text" class="form-control font-monospace" placeholder="e.g. yourname@okhdfcbank">
                                        <button class="btn btn-outline-success" type="button">Verify</button>
                                    </div>
                                </div>

                                <!-- Card Payment Details Fields -->
                                <div id="cardPaymentSection" class="p-3 border rounded-3 bg-light mb-4" style="display:none;">
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Cardholder Full Name</label>
                                        <input type="text" class="form-control form-control-sm" placeholder="Cardholder Name">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Card Number (RuPay / Visa / MasterCard)</label>
                                        <div class="input-group input-group-sm">
                                            <span class="input-group-text"><i class="bi bi-credit-card"></i></span>
                                            <input type="text" class="form-control" placeholder="6071 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 1234" value="6071 8901 2345 6789">
                                        </div>
                                    </div>
                                    <div class="row g-2">
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">Expires</label>
                                            <input type="text" class="form-control form-control-sm" placeholder="MM/YY" value="09/29">
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small fw-semibold">CVV</label>
                                            <input type="password" class="form-control form-control-sm" placeholder="123" maxlength="3" value="777">
                                        </div>
                                    </div>
                                </div>

                                <!-- Net Banking Section -->
                                <div id="netbankingPaymentSection" class="p-3 border rounded-3 bg-light mb-4" style="display:none;">
                                    <label class="form-label small fw-semibold">Choose Your Indian Bank</label>
                                    <select class="form-select form-select-sm">
                                        <option>State Bank of India (SBI)</option>
                                        <option>HDFC Bank</option>
                                        <option>ICICI Bank</option>
                                        <option>Axis Bank</option>
                                        <option>Kotak Mahindra Bank</option>
                                        <option>Punjab National Bank (PNB)</option>
                                    </select>
                                </div>

                                <!-- Wallet Section -->
                                <div id="walletPaymentSection" class="p-3 border rounded-3 bg-light mb-4" style="display:none;">
                                    <label class="form-label small fw-semibold">Choose Digital Wallet</label>
                                    <select class="form-select form-select-sm">
                                        <option>VoltSpot EV Fast Wallet (Balance: ₹1,500.00)</option>
                                        <option>Paytm Wallet</option>
                                        <option>Amazon Pay India</option>
                                        <option>Mobikwik</option>
                                    </select>
                                </div>

                                <div class="d-flex align-items-center mb-4 text-muted small">
                                    <i class="bi bi-shield-check text-success fs-5 me-2"></i>
                                    <span>256-Bit SSL Encrypted &bull; 100% Secure Reserve Bank of India (RBI) Compliant</span>
                                </div>

                                <button type="submit" class="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm">
                                    <i class="bi bi-lock-fill me-1"></i> Pay ₹<%= totalAmount %> &amp; Confirm Booking
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<jsp:include page="/includes/footer.jsp" />

