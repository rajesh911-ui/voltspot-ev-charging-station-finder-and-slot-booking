<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    request.setAttribute("pageTitle", "Register New Charging Station - VoltSpot EV");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Portal</span>
                    <h2 class="fw-bold mb-0">Register New EV Charging Station</h2>
                    <small class="text-muted">Enter station details, configure FAST &amp; NORMAL slot capacities, and pick GPS coordinates</small>
                </div>
                <a href="${pageContext.request.contextPath}/operator/stations" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left me-1"></i> Back to Stations
                </a>
            </div>

            <div class="card shadow-sm border-0">
                <div class="card-body p-4 p-md-5">
                    <div class="alert alert-info d-flex align-items-center mb-4" role="alert">
                        <i class="bi bi-info-circle-fill fs-4 me-3"></i>
                        <div>
                            <strong>Admin Approval Notice:</strong> Newly registered stations will be placed in the Administrator Review Queue with status <code>PENDING</code>. Once approved by the Admin, the station becomes visible for public search and slot booking.
                        </div>
                    </div>

                    <form action="${pageContext.request.contextPath}/operator/add-station" method="POST">
                        <h5 class="fw-bold mb-3 border-bottom pb-2">1. Station Information</h5>
                        <div class="row g-3 mb-4">
                            <div class="col-md-8">
                                <label class="form-label fw-semibold">Station Name</label>
                                <input type="text" name="name" class="form-control" placeholder="e.g. VoltSpot Central Express Hub" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">City</label>
                                <input type="text" name="city" class="form-control" placeholder="e.g. New York, Chicago, San Francisco" required>
                            </div>
                            <div class="col-md-8">
                                <label class="form-label fw-semibold">Street Address</label>
                                <input type="text" name="address" class="form-control" placeholder="e.g. 500 Grand Ave, Suite 100" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Contact / Helpdesk Phone</label>
                                <input type="tel" name="contactNumber" class="form-control" placeholder="+1-555-0199" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Daily Opening Time</label>
                                <input type="time" name="openingTime" class="form-control" value="06:00" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Daily Closing Time</label>
                                <input type="time" name="closingTime" class="form-control" value="23:00" required>
                            </div>
                        </div>

                        <h5 class="fw-bold mb-3 border-bottom pb-2">2. Geographical Location (Google Maps &amp; GPS Coordinates)</h5>
                        <p class="text-muted small">Search for a landmark or drag the marker on the Google Map below to set the station's exact GPS coordinates.</p>
                        
                        <div class="input-group mb-2">
                            <span class="input-group-text bg-white"><i class="bi bi-search text-success"></i></span>
                            <input type="text" id="stationAddressSearch" class="form-control" placeholder="Search address or area in Google Maps (e.g. Indiranagar Bengaluru, Hitec City Hyderabad)...">
                        </div>

                        <div class="card mb-3 overflow-hidden border">
                            <div id="pickerMap" style="height: 320px; width: 100%;"></div>
                        </div>

                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Latitude</label>
                                <input type="text" id="stationLat" name="latitude" class="form-control font-monospace" value="12.971600" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Longitude</label>
                                <input type="text" id="stationLng" name="longitude" class="form-control font-monospace" value="77.594600" required>
                            </div>
                        </div>

                        <h5 class="fw-bold mb-3 border-bottom pb-2">3. Charging Capacities &amp; Pricing (₹ INR)</h5>
                        <div class="row g-4 mb-4">
                            <!-- FAST Charging Config -->
                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded-3 border h-100">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="fw-bold mb-0 text-warning-emphasis"><i class="bi bi-lightning-charge-fill me-1"></i> FAST CHARGING (DC)</h6>
                                        <span class="badge-fast small">High Speed (CCS2)</span>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Number of Ports / Slots (Capacity)</label>
                                        <input type="number" name="fastCapacity" class="form-control" value="6" min="1" max="50" required>
                                        <small class="text-muted">Maximum simultaneous vehicles that can book</small>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Max Power Output (kW)</label>
                                        <input type="number" step="0.1" name="fastPower" class="form-control" value="150.0" required>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label small fw-semibold">Slot Price (₹ INR per 1-hour slot)</label>
                                        <input type="number" step="0.01" name="fastPrice" class="form-control" value="280.00" required>
                                    </div>
                                </div>
                            </div>

                            <!-- NORMAL Charging Config -->
                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded-3 border h-100">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="fw-bold mb-0 text-primary"><i class="bi bi-plug-fill me-1"></i> NORMAL CHARGING (AC)</h6>
                                        <span class="badge-normal small">Standard (Type 2)</span>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Number of Ports / Slots (Capacity)</label>
                                        <input type="number" name="normalCapacity" class="form-control" value="10" min="1" max="50" required>
                                        <small class="text-muted">Maximum simultaneous vehicles that can book</small>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Max Power Output (kW)</label>
                                        <input type="number" step="0.1" name="normalPower" class="form-control" value="22.0" required>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label small fw-semibold">Slot Price (₹ INR per 1-hour slot)</label>
                                        <input type="number" step="0.01" name="normalPrice" class="form-control" value="95.00" required>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                            <a href="${pageContext.request.contextPath}/operator/stations" class="btn btn-outline-secondary px-4">Cancel</a>
                            <button type="submit" class="btn btn-success px-5 fw-bold">
                                <i class="bi bi-check-circle me-1"></i> Submit Station for Admin Approval
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    initCoordinatePicker('pickerMap', 'stationLat', 'stationLng', 12.9716, 77.5946);
});
</script>

<jsp:include page="/includes/footer.jsp" />

