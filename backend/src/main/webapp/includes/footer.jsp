</div><!-- /.main-content -->

<!-- Google Maps API Key Modal -->
<div class="modal fade" id="gmapsApiKeyModal" tabindex="-1" aria-labelledby="gmapsApiKeyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-dark text-white">
                <h5 class="modal-title fw-bold" id="gmapsApiKeyModalLabel">
                    <i class="bi bi-google text-success me-2"></i> Connect Google Maps API
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <p class="text-muted small mb-3">
                    Enter your Google Maps JavaScript API key below to unlock real-time Google Maps satellite/terrain views, Google Places street autocomplete, live traffic, and turn-by-turn directions.
                </p>
                <div class="mb-3">
                    <label class="form-label fw-semibold small text-dark">Google Maps JavaScript API Key</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light"><i class="bi bi-key-fill text-warning"></i></span>
                        <input type="text" id="gmapsApiKeyInput" class="form-control" placeholder="AIzaSy..." autocomplete="off">
                    </div>
                    <div class="form-text small">Your key is stored locally in your browser (<code>localStorage</code>) and used for map requests.</div>
                </div>
                <div class="p-3 bg-light rounded-3 border small mb-3">
                    <div class="fw-bold mb-1"><i class="bi bi-info-circle text-primary me-1"></i> Quick Tips:</div>
                    <ul class="mb-0 ps-3 text-secondary">
                        <li>Requires <strong>Maps JavaScript API</strong> enabled in Google Cloud Console.</li>
                        <li>Recommended APIs: <em>Places API</em>, <em>Geocoding API</em>, <em>Geometry Library</em>.</li>
                        <li>If no key is entered, an interactive fallback map continues to operate seamlessly.</li>
                    </ul>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-outline-danger" onclick="clearGoogleMapsKey()">Clear Key</button>
                <button type="button" class="btn btn-success fw-bold px-4" onclick="saveGoogleMapsKeyFromModal()">
                    <i class="bi bi-check2-circle me-1"></i> Save &amp; Connect Key
                </button>
            </div>
        </div>
    </div>
</div>

<script>
function openGoogleMapsKeyModal() {
    const existingKey = localStorage.getItem('voltspot_google_maps_api_key') || '';
    const input = document.getElementById('gmapsApiKeyInput');
    if (input) input.value = existingKey;
    
    // Check if Bootstrap modal is available
    if (typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('gmapsApiKeyModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
            return;
        }
    }
    
    // Fallback prompt
    const key = prompt("Enter your Google Maps JavaScript API Key:", existingKey);
    if (key !== null) {
        setGoogleMapsApiKey(key);
    }
}

function saveGoogleMapsKeyFromModal() {
    const input = document.getElementById('gmapsApiKeyInput');
    if (!input) return;
    const key = input.value.trim();
    if (!key) {
        alert('Please enter a valid Google Maps API Key or click Clear Key.');
        return;
    }
    setGoogleMapsApiKey(key);
}

function clearGoogleMapsKey() {
    localStorage.removeItem('voltspot_google_maps_api_key');
    window.location.reload();
}
</script>

<footer class="bg-dark text-white pt-5 pb-4 mt-5 border-top border-secondary">
    <div class="container">
        <div class="row g-4">
            <div class="col-lg-4 col-md-6">
                <h5 class="fw-bold text-success mb-3">
                    <i class="bi bi-lightning-charge-fill me-1"></i> VoltSpot EV India
                </h5>
                <p class="text-secondary small">
                    India's leading Electric Vehicle Charging Station Finder &amp; Real-Time Slot Booking Network. Providing seamless station discovery, live Google Maps tracking, transparent Indian Rupee (₹) pricing, and instant UPI payments.
                </p>
                <div class="d-flex gap-3 fs-5 text-secondary">
                    <a href="#" class="text-secondary"><i class="bi bi-twitter-x"></i></a>
                    <a href="#" class="text-secondary"><i class="bi bi-linkedin"></i></a>
                    <a href="#" class="text-secondary"><i class="bi bi-github"></i></a>
                </div>
            </div>

            <div class="col-lg-2 col-md-6">
                <h6 class="fw-bold mb-3 text-light">Quick Links</h6>
                <ul class="list-unstyled small">
                    <li class="mb-2"><a href="${pageContext.request.contextPath}/home" class="text-secondary text-decoration-none">Home</a></li>
                    <li class="mb-2"><a href="${pageContext.request.contextPath}/stations" class="text-secondary text-decoration-none">Find Stations</a></li>
                    <li class="mb-2"><a href="${pageContext.request.contextPath}/login.jsp" class="text-secondary text-decoration-none">User Login</a></li>
                    <li class="mb-2"><a href="${pageContext.request.contextPath}/register.jsp" class="text-secondary text-decoration-none">Register Account</a></li>
                    <li class="mb-2"><button type="button" onclick="openGoogleMapsKeyModal()" class="btn btn-outline-warning btn-sm py-1 px-2 d-inline-flex align-items-center mt-1"><i class="bi bi-google me-1"></i> Maps API Key</button></li>
                </ul>
            </div>

            <div class="col-lg-3 col-md-6">
                <h6 class="fw-bold mb-3 text-light">Charging Types (India)</h6>
                <ul class="list-unstyled small text-secondary">
                    <li class="mb-2"><i class="bi bi-lightning-fill text-warning me-1"></i> <strong>FAST DC (CCS2):</strong> 50 - 180 kW (₹240 - ₹320 / slot)</li>
                    <li class="mb-2"><i class="bi bi-plug-fill text-info me-1"></i> <strong>NORMAL AC (Type 2):</strong> 7.4 - 22 kW (₹80 - ₹120 / slot)</li>
                    <li class="mb-1"><i class="bi bi-currency-rupee text-success me-1"></i> <strong>Currency:</strong> Indian Rupees (INR / ₹) with 18% GST</li>
                </ul>
            </div>

            <div class="col-lg-3 col-md-6">
                <h6 class="fw-bold mb-3 text-light">Technology Stack</h6>
                <p class="small text-secondary mb-1"><strong>Language:</strong> Java (JDK 23 / 17)</p>
                <p class="small text-secondary mb-1"><strong>Backend:</strong> Java Servlets + JDBC</p>
                <p class="small text-secondary mb-1"><strong>Frontend:</strong> JSP, HTML5, CSS3, JavaScript</p>
                <p class="small text-secondary mb-1"><strong>Maps:</strong> Google Maps JavaScript API</p>
                <p class="small text-secondary mb-1"><strong>Database:</strong> MySQL 8.0 &amp; Workbench</p>
                <p class="small text-secondary mb-0"><strong>Server:</strong> Apache Tomcat 9.0.84</p>
            </div>
        </div>

        <hr class="border-secondary my-4">

        <div class="row align-items-center small text-secondary">
            <div class="col-md-6 text-center text-md-start">
                &copy; 2026 VoltSpot EV Technologies India Pvt Ltd. All rights reserved.
            </div>
            <div class="col-md-6 text-center text-md-end mt-2 mt-md-0">
                <span>Designed for Apache NetBeans IDE 24 &amp; Apache Tomcat 9</span>
            </div>
        </div>
    </div>
</footer>

<!-- Bootstrap 5 Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<!-- Leaflet JS for Fallback -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<!-- Custom JS -->
<script src="${pageContext.request.contextPath}/js/map.js"></script>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
<script src="${pageContext.request.contextPath}/js/antigravity.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const globalBg = document.getElementById('antigravity-global-bg');
    if (globalBg && window.initAntigravity && !window.__antigravityInitialized) {
        window.__antigravityInitialized = true;
        window.__globalAntigravityInstance = window.initAntigravity(globalBg, {
            colors: ["#10b981", "#3b82f6", "#a843ff", "#34d399", "#064e3b"],
            count: 1400,
            magnetRadius: 7.0,
            ringRadius: 5.5,
            particleSize: 0.9,
            waveSpeed: 0.10,
            autoAnimate: false,
            clickBurst: true,
            opacity: 0.85
        });
    }
});
</script>

</body>
</html>
