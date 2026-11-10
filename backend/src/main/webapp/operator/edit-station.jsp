<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.voltspot.model.ChargingStation" %>
<%@ page import="com.voltspot.model.StationChargingType" %>

<%
    ChargingStation station = (ChargingStation) request.getAttribute("station");
    if (station == null) {
        response.sendRedirect(request.getContextPath() + "/operator/stations");
        return;
    }
    StationChargingType fast = station.getFastCharging();
    StationChargingType normal = station.getNormalCharging();
    request.setAttribute("pageTitle", "Edit Station - " + station.getName());
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-10">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management</span>
                    <h2 class="fw-bold mb-0">Edit Charging Station</h2>
                    <small class="text-muted"><%= station.getName() %></small>
                </div>
                <a href="${pageContext.request.contextPath}/operator/stations" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left me-1"></i> Back to Stations
                </a>
            </div>

            <div class="card shadow-sm border-0">
                <div class="card-body p-4 p-md-5">
                    <form action="${pageContext.request.contextPath}/operator/edit-station" method="POST">
                        <input type="hidden" name="id" value="<%= station.getId() %>">

                        <h5 class="fw-bold mb-3 border-bottom pb-2">1. Station Details</h5>
                        <div class="row g-3 mb-4">
                            <div class="col-md-8">
                                <label class="form-label fw-semibold">Station Name</label>
                                <input type="text" name="name" class="form-control" value="<%= station.getName() %>" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">City</label>
                                <input type="text" name="city" class="form-control" value="<%= station.getCity() %>" required>
                            </div>
                            <div class="col-md-8">
                                <label class="form-label fw-semibold">Street Address</label>
                                <input type="text" name="address" class="form-control" value="<%= station.getAddress() %>" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Contact Phone</label>
                                <input type="tel" name="contactNumber" class="form-control" value="<%= station.getContactNumber() %>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Opening Time</label>
                                <input type="time" name="openingTime" class="form-control" value="<%= station.getOpeningTime() %>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Closing Time</label>
                                <input type="time" name="closingTime" class="form-control" value="<%= station.getClosingTime() %>" required>
                            </div>
                        </div>

                        <h5 class="fw-bold mb-3 border-bottom pb-2">2. Coordinates (GPS)</h5>
                        <div class="card mb-3 overflow-hidden border">
                            <div id="pickerMap" style="height: 280px; width: 100%;"></div>
                        </div>
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Latitude</label>
                                <input type="text" id="stationLat" name="latitude" class="form-control" value="<%= station.getLatitude() %>" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Longitude</label>
                                <input type="text" id="stationLng" name="longitude" class="form-control" value="<%= station.getLongitude() %>" required>
                            </div>
                        </div>

                        <h5 class="fw-bold mb-3 border-bottom pb-2">3. Capacities &amp; Pricing (₹ INR)</h5>
                        <div class="row g-4 mb-4">
                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded-3 border">
                                    <h6 class="fw-bold mb-3 text-warning-emphasis">FAST CHARGING (DC)</h6>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Capacity (Ports)</label>
                                        <input type="number" name="fastCapacity" class="form-control" value="<%= fast != null ? fast.getTotalCapacity() : 4 %>" min="1" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Power Output (kW)</label>
                                        <input type="number" step="0.1" name="fastPower" class="form-control" value="<%= fast != null ? fast.getPowerKw() : 150.0 %>" required>
                                    </div>
                                    <div>
                                        <label class="form-label small fw-semibold">Price Per 1-Hour Slot (₹ INR)</label>
                                        <input type="number" step="0.01" name="fastPrice" class="form-control" value="<%= fast != null ? fast.getPricePerSlot() : 280.00 %>" required>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded-3 border">
                                    <h6 class="fw-bold mb-3 text-primary">NORMAL CHARGING (AC)</h6>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Capacity (Ports)</label>
                                        <input type="number" name="normalCapacity" class="form-control" value="<%= normal != null ? normal.getTotalCapacity() : 8 %>" min="1" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold">Power Output (kW)</label>
                                        <input type="number" step="0.1" name="normalPower" class="form-control" value="<%= normal != null ? normal.getPowerKw() : 22.0 %>" required>
                                    </div>
                                    <div>
                                        <label class="form-label small fw-semibold">Price Per 1-Hour Slot (₹ INR)</label>
                                        <input type="number" step="0.01" name="normalPrice" class="form-control" value="<%= normal != null ? normal.getPricePerSlot() : 95.00 %>" required>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                            <a href="${pageContext.request.contextPath}/operator/stations" class="btn btn-outline-secondary px-4">Cancel</a>
                            <button type="submit" class="btn btn-primary px-5 fw-bold">
                                <i class="bi bi-save me-1"></i> Update Station Configuration
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
    const initLat = <%= station.getLatitude() != null ? station.getLatitude() : "40.7128" %>;
    const initLng = <%= station.getLongitude() != null ? station.getLongitude() : "-74.0060" %>;
    initCoordinatePicker('pickerMap', 'stationLat', 'stationLng', initLat, initLng);
});
</script>

<jsp:include page="/includes/footer.jsp" />

