<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.StationChargingType" %>
<%@ page import="com.voltspot.model.Feedback" %>
<%@ page import="com.voltspot.model.User" %>

<%
    ChargingStation station = (ChargingStation) request.getAttribute("station");
    List<Feedback> reviews = (List<Feedback>) request.getAttribute("reviews");
    User currentUser = (session != null) ? (User) session.getAttribute("user") : null;

    if (station == null) {
        response.sendRedirect(request.getContextPath() + "/stations");
        return;
    }

    StationChargingType fast = station.getFastCharging();
    StationChargingType normal = station.getNormalCharging();

    request.setAttribute("pageTitle", station.getName() + " - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="${pageContext.request.contextPath}/home">Home</a></li>
            <li class="breadcrumb-item"><a href="${pageContext.request.contextPath}/stations">Stations</a></li>
            <li class="breadcrumb-item active" aria-current="page"><%= station.getName() %></li>
        </ol>
    </nav>

    <div class="row g-4">
        <!-- Station Details Column -->
        <div class="col-lg-7">
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold">
                            <i class="bi bi-patch-check-fill me-1"></i> Verified Station
                        </span>
                        <div class="star-rating">
                            <i class="bi bi-star-fill text-warning"></i> <%= station.getAverageRating() > 0 ? station.getAverageRating() : '5.0' %>
                            <span class="text-muted small">(<%= station.getReviewCount() %> reviews)</span>
                        </div>
                    </div>

                    <h2 class="fw-bold text-dark mb-2"><%= station.getName() %></h2>
                    <p class="text-muted mb-3"><i class="bi bi-geo-alt-fill text-danger me-1"></i> <%= station.getAddress() %>, <strong><%= station.getCity() %></strong></p>

                    <div class="row g-3 py-3 border-top border-bottom my-3">
                        <div class="col-sm-6">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-clock-fill text-primary fs-4 me-3"></i>
                                <div>
                                    <small class="text-muted d-block">Operating Hours</small>
                                    <strong><%= station.getOpeningTime() %> - <%= station.getClosingTime() %></strong>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-telephone-fill text-success fs-4 me-3"></i>
                                <div>
                                    <small class="text-muted d-block">Station Helpdesk</small>
                                    <strong><%= station.getContactNumber() %></strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Charging Types Information Cards -->
                    <h5 class="fw-bold mb-3 mt-4">Available Charging Infrastructure</h5>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="card border p-3 bg-light h-100">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="badge-fast">FAST CHARGING (DC)</span>
                                    <span class="fw-bold text-success fs-5">₹<%= fast != null ? fast.getPricePerSlot() : "280.00" %><small class="text-muted fs-6">/slot</small></span>
                                </div>
                                <ul class="list-unstyled small text-muted mb-0 mt-2">
                                    <li class="mb-1"><i class="bi bi-lightning-charge-fill text-warning me-1"></i> Power Output: <strong><%= fast != null ? fast.getPowerKw() : '150' %> kW</strong></li>
                                    <li class="mb-1"><i class="bi bi-layers-fill text-primary me-1"></i> Dedicated Ports: <strong><%= fast != null ? fast.getTotalCapacity() : '6' %> slots</strong></li>
                                    <li><i class="bi bi-speedometer2 text-danger me-1"></i> Fast Top-Up: 20% to 80% in ~25 mins</li>
                                </ul>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card border p-3 bg-light h-100">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="badge-normal">NORMAL CHARGING (AC)</span>
                                    <span class="fw-bold text-primary fs-5">₹<%= normal != null ? normal.getPricePerSlot() : "95.00" %><small class="text-muted fs-6">/slot</small></span>
                                </div>
                                <ul class="list-unstyled small text-muted mb-0 mt-2">
                                    <li class="mb-1"><i class="bi bi-plug-fill text-info me-1"></i> Power Output: <strong><%= normal != null ? normal.getPowerKw() : '22' %> kW</strong></li>
                                    <li class="mb-1"><i class="bi bi-layers-fill text-primary me-1"></i> Dedicated Ports: <strong><%= normal != null ? normal.getTotalCapacity() : '10' %> slots</strong></li>
                                    <li><i class="bi bi-hourglass-split text-info me-1"></i> Optimal for routine charging &amp; parking</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive Animated EV Battery Charging Simulator -->
                    <div class="ev-battery-box mt-4 mb-2 anim-fade-up" id="evBatterySimulator">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-battery-charging text-success fs-4 me-2 anim-bolt-spark"></i>
                                <div>
                                    <strong class="d-block" style="font-size: 14px;">EV Battery Charging &amp; Cost Simulator</strong>
                                    <small class="text-secondary opacity-75">Interactive estimate for 40.5 kWh EV (Tata Nexon / MG ZS / XUV400)</small>
                                </div>
                            </div>
                            <span class="badge bg-success font-monospace" id="batteryPercentLabel">25%</span>
                        </div>
                        
                        <div class="battery-shell mb-3">
                            <div class="battery-fill" id="batteryFillBar" style="width: 25%;"></div>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between small text-secondary mb-1">
                                <span>Current Battery Level (Slide to Adjust):</span>
                                <span class="text-white fw-bold">Target: 80% Fast-Charge Cap</span>
                            </div>
                            <input type="range" class="form-range" id="batteryCurrentSlider" min="10" max="90" value="25" step="5">
                        </div>

                        <div class="row g-2 text-center pt-2 border-top border-secondary">
                            <div class="col-6 border-end border-secondary">
                                <small class="text-secondary d-block">Est. Charging Time (DC Fast)</small>
                                <strong class="text-warning" id="batteryTimeEstimate">~28 mins to 80%</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-secondary d-block">Est. Energy / Slot Cost</small>
                                <strong class="text-success fs-6" id="batteryCostEstimate">₹280.00</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive Google Map Mini View -->
                    <div class="mt-4">
                        <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                            <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-geo-alt-fill text-danger me-1"></i> Exact Google Location</h6>
                            <div class="d-flex gap-1">
                                <a href="https://www.google.com/maps/dir/?api=1&destination=<%= station.getLatitude() %>,<%= station.getLongitude() %>&travelmode=driving" target="_blank" class="btn btn-sm btn-primary text-white fw-semibold">
                                    <i class="bi bi-cursor-fill me-1"></i> Directions
                                </a>
                                <a href="https://www.google.com/maps/search/?api=1&query=<%= station.getLatitude() %>,<%= station.getLongitude() %>" target="_blank" class="btn btn-sm btn-outline-secondary" title="View exact location pin on Google Maps">
                                    <i class="bi bi-google me-1"></i> Exact Pin
                                </a>
                            </div>
                        </div>
                        <div id="stationDetailMap" class="rounded-3 border overflow-hidden shadow-sm" style="height: 220px; width: 100%;"></div>
                    </div>
                </div>
            </div>

            <!-- Customer Reviews and Feedback List -->
            <div class="card shadow-sm border-0">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold mb-0">Customer Ratings &amp; Reviews</h5>
                        <span class="badge bg-light text-dark border">
                            <i class="bi bi-chat-left-text me-1"></i> <%= reviews != null ? reviews.size() : 0 %> verified reviews
                        </span>
                    </div>

                    <% if (reviews != null && !reviews.isEmpty()) {
                        for (Feedback fb : reviews) { %>
                            <div class="border-bottom pb-3 mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <strong class="text-dark"><i class="bi bi-person-circle text-secondary me-1"></i> <%= fb.getUserName() %></strong>
                                    <div class="star-rating small">
                                        <% for (int i = 1; i <= 5; i++) { %>
                                            <i class="bi <%= i <= fb.getRating() ? "bi-star-fill text-warning" : "bi-star text-muted" %>"></i>
                                        <% } %>
                                    </div>
                                </div>
                                <p class="text-muted small mb-1"><%= fb.getComments() %></p>
                                <small class="text-secondary opacity-75" style="font-size:0.75rem;"><%= fb.getCreatedAt() %></small>
                            </div>
                    <%  }
                       } else { %>
                            <p class="text-muted small">No reviews yet for this station. Be the first to rate your charging experience below!</p>
                    <% } %>

                    <!-- Leave Feedback Form -->
                    <% if (currentUser != null) { %>
                        <div class="mt-4 pt-3 border-top">
                            <h6 class="fw-bold mb-3"><i class="bi bi-pencil-square me-1"></i> Rate This Station</h6>
                            <form action="${pageContext.request.contextPath}/submit-feedback" method="POST">
                                <input type="hidden" name="stationId" value="<%= station.getId() %>">

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Your Rating (1 to 5 Stars)</label>
                                    <select name="rating" class="form-select form-select-sm" required>
                                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Outstanding</option>
                                        <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                                        <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                                        <option value="2">⭐⭐ 2 Stars - Below Average</option>
                                        <option value="1">⭐ 1 Star - Poor Experience</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Review Comments</label>
                                    <textarea name="comments" rows="3" class="form-control form-control-sm" placeholder="Describe charger speed, cleanliness, parking space, and amenities..." required></textarea>
                                </div>

                                <button type="submit" class="btn btn-sm btn-outline-success">
                                    <i class="bi bi-send me-1"></i> Submit Review
                                </button>
                            </form>
                        </div>
                    <% } else { %>
                        <div class="alert alert-light border mt-3 mb-0 small text-center">
                            Please <a href="${pageContext.request.contextPath}/login.jsp" class="fw-bold text-success">sign in</a> to leave a rating and review for this station.
                        </div>
                    <% } %>
                </div>
            </div>
        </div>

        <!-- Real-Time Slot Booking Widget Column -->
        <div class="col-lg-5">
            <div class="card shadow-sm border-0 sticky-top" style="top: 80px;">
                <div class="card-header bg-dark text-white p-3">
                    <h5 class="fw-bold mb-0"><i class="bi bi-calendar2-check-fill text-success me-2"></i> Book A Charging Slot</h5>
                    <small class="text-secondary">Real-time availability checking prevents overbooking</small>
                </div>
                <div class="card-body p-4">
                    <form id="slotBookingForm" action="${pageContext.request.contextPath}/book-slot" method="POST">
                        <input type="hidden" id="bookingStationId" name="stationId" value="<%= station.getId() %>">
                        <input type="hidden" id="selectedTimeSlot" name="timeSlot" value="" required>

                        <!-- Step 1: Select Charging Type -->
                        <div class="mb-3">
                            <label class="form-label fw-semibold small text-muted">1. Select Charging Type</label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="chargingType" id="typeFast" value="FAST" data-price="<%= fast != null ? fast.getPricePerSlot() : '280.00' %>" checked>
                                    <label class="btn btn-outline-warning text-dark w-100 py-2" for="typeFast">
                                        <div class="fw-bold">FAST (DC)</div>
                                        <small class="d-block">₹<%= fast != null ? fast.getPricePerSlot() : '280.00' %>/slot</small>
                                    </label>
                                </div>
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="chargingType" id="typeNormal" value="NORMAL" data-price="<%= normal != null ? normal.getPricePerSlot() : '95.00' %>">
                                    <label class="btn btn-outline-info text-dark w-100 py-2" for="typeNormal">
                                        <div class="fw-bold">NORMAL (AC)</div>
                                        <small class="d-block">₹<%= normal != null ? normal.getPricePerSlot() : '95.00' %>/slot</small>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Select Date -->
                        <div class="mb-3">
                            <label class="form-label fw-semibold small text-muted">2. Select Date</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-calendar3"></i></span>
                                <input type="date" id="bookingDate" name="bookingDate" class="form-control" required>
                            </div>
                        </div>

                        <!-- Step 3: Real-Time Interactive Slot Grid -->
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="form-label fw-semibold small text-muted mb-0">3. Select Time Slot (1 Hour)</label>
                                <span class="badge bg-light text-muted small border">Live Capacity Check</span>
                            </div>
                            <div id="slotGridContainer" class="py-2">
                                <!-- Populated dynamically by app.js via AJAX -->
                            </div>
                            <small class="text-muted d-block mt-1"><i class="bi bi-info-circle"></i> Click an available slot above to select it.</small>
                        </div>

                        <!-- Step 4: EV Vehicle Details -->
                        <div class="mb-3">
                            <label class="form-label fw-semibold small text-muted">4. Vehicle Information</label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <input type="text" name="vehicleModel" class="form-control form-control-sm" placeholder="e.g. Tata Nexon EV" value="Tata Nexon EV" required>
                                </div>
                                <div class="col-6">
                                    <input type="text" name="vehicleNumber" class="form-control form-control-sm" placeholder="e.g. KA-01-EV-2024" value="KA-01-EV-2024" required>
                                </div>
                            </div>
                        </div>

                        <!-- Price Preview Breakdown -->
                        <div class="bg-light p-3 rounded-3 mb-4 border">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-semibold text-muted">Estimated Slot Fee:</span>
                                <span id="totalPricePreview" class="fs-4 fw-bold text-success">₹280.00</span>
                            </div>
                            <small class="text-muted d-block">+ 18% GST (CGST 9% + SGST 9%) at checkout</small>
                        </div>

                        <!-- Submit Button -->
                        <% if (currentUser != null) { %>
                            <button type="submit" class="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm">
                                <i class="bi bi-check-circle-fill me-1"></i> Reserve Slot &amp; Proceed to Pay
                            </button>
                        <% } else { %>
                            <a href="${pageContext.request.contextPath}/login.jsp?redirect=${pageContext.request.requestURI}?id=<%= station.getId() %>" class="btn btn-warning w-100 py-3 fw-bold fs-5 text-dark">
                                <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Reserve Slot
                            </a>
                        <% } %>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    if (window.initStationDetailMap) {
        initStationDetailMap('stationDetailMap', <%= station.getLatitude() %>, <%= station.getLongitude() %>, '<%= station.getName().replace("'", "\\'") %>', '<%= station.getAddress().replace("'", "\\'") %>');
    }
});
</script>

<jsp:include page="/includes/footer.jsp" />

