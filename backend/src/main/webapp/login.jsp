<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    request.setAttribute("pageTitle", "Sign In - VoltSpot EV India (₹)");
%>
<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="antigravity-login-wrapper">
    <!-- Centered Flexbox & Grid Container (Perfect Horizontal & Vertical Centering) -->
    <div class="login-center-container">
        <!-- 3. Glassmorphic Login Card with High-Contrast Adjusted Typography -->
        <div class="card antigravity-login-card mx-auto">
            <div class="antigravity-glow-bar"></div>
            <div class="card-body p-4 p-md-5">
            
            <!-- Header with Adjusted Contrast -->
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-2" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);">
                    <i class="bi bi-lightning-charge-fill fs-2" style="color: #10b981;"></i>
                </div>
                <h3 class="fw-bold mb-1">Volt<span style="color: #34d399;">Spot</span> EV India</h3>
                <p class="subtitle mb-2">Real-Time Station Discovery &amp; Slot Booking (₹ / INR)</p>
                <div class="antigravity-engine-badge">
                    <i class="bi bi-cpu"></i>
                    <span>Antigravity Physics Active</span>
                </div>
            </div>

            <!-- Particle Palette Switcher -->
            <div class="d-flex align-items-center justify-content-between mb-3 px-1">
                <span class="small fw-bold" style="color: #94a3b8; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;">Particle Theme:</span>
                <div class="btn-group btn-group-sm palette-btn-group" role="group">
                    <button type="button" class="btn btn-outline-success active" id="btnPaletteEmerald" onclick="switchPalette('emerald')">
                        <i class="bi bi-lightning"></i> Emerald ⚡
                    </button>
                    <button type="button" class="btn btn-outline-info" id="btnPaletteCosmic" onclick="switchPalette('cosmic')">
                        <i class="bi bi-stars"></i> Cosmic 🔥
                    </button>
                </div>
            </div>

            <form action="${pageContext.request.contextPath}/auth" method="POST">
                <input type="hidden" name="action" value="login">
                <input type="hidden" name="redirect" value="<%= request.getParameter("redirect") != null ? request.getParameter("redirect") : "" %>">

                <!-- Email Input with High Contrast -->
                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-envelope-at-fill"></i></span>
                        <input type="email" name="email" id="loginEmail" class="form-control" placeholder="user@voltspot.in" value="user@voltspot.com" required>
                    </div>
                </div>

                <!-- Password Input with High Contrast -->
                <div class="mb-4">
                    <label class="form-label">Password</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-shield-lock-fill"></i></span>
                        <input type="password" name="password" id="loginPassword" class="form-control" placeholder="Enter password" value="user123" required>
                    </div>
                </div>

                <button type="submit" class="btn antigravity-submit-btn w-100 py-2 mb-3">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to VoltSpot
                </button>
            </form>

            <!-- 3. One-Click Instant Demo Profiles with Adjusted Text Contrast -->
            <div class="pt-3 border-top" style="border-color: rgba(51, 65, 85, 0.7) !important;">
                <p class="small mb-2 fw-bold text-center" style="color: #94a3b8; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase;">
                    1-Click Instant Demo Login:
                </p>
                <div class="d-flex flex-column gap-2">
                    <div class="demo-account-chip" onclick="fillDemo('admin@voltspot.com', 'admin123', 'ADMIN')">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-shield-shaded text-danger fs-5"></i>
                            <div>
                                <div class="fw-bold small text-white">Central Administrator</div>
                                <div class="text-white-50" style="font-size: 0.7rem;">Approval authority, audits, reports</div>
                            </div>
                        </div>
                        <span class="badge bg-danger-subtle text-danger border border-danger small">Admin</span>
                    </div>

                    <div class="demo-account-chip" onclick="fillDemo('operator@voltspot.com', 'operator123', 'OPERATOR')">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-ev-station text-primary fs-5"></i>
                            <div>
                                <div class="fw-bold small text-white">VoltPower Hub Operator</div>
                                <div class="text-white-50" style="font-size: 0.7rem;">Manage slots, pricing (₹), live bookings</div>
                            </div>
                        </div>
                        <span class="badge bg-primary-subtle text-primary border border-primary small">Operator</span>
                    </div>

                    <div class="demo-account-chip" onclick="fillDemo('user@voltspot.com', 'user123', 'USER')">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-car-front text-success fs-5"></i>
                            <div>
                                <div class="fw-bold small text-white">EV Driver (Demo Account)</div>
                                <div class="text-white-50" style="font-size: 0.7rem;">Tata Nexon EV &bull; Bengaluru Hubs</div>
                            </div>
                        </div>
                        <span class="badge bg-success-subtle text-success border border-success small">EV User</span>
                    </div>
                </div>
            </div>

            <!-- Registration Link -->
            <div class="text-center mt-4">
                <p class="small mb-0" style="color: #94a3b8;">
                    Don't have an account? 
                    <a href="${pageContext.request.contextPath}/register.jsp" style="color: #34d399; font-weight: 700; text-decoration: none;">
                        Register New Account <i class="bi bi-arrow-right"></i>
                    </a>
                </p>
            </div>
        </div>
    </div>
    </div><!-- /.login-center-container -->
</div><!-- /.antigravity-login-wrapper -->

<!-- Load Antigravity WebGL2 Particle Simulation Engine -->
<script>
function switchPalette(theme) {
    const btnEm = document.getElementById('btnPaletteEmerald');
    const btnCos = document.getElementById('btnPaletteCosmic');
    const inst = window.__globalAntigravityInstance;
    if (theme === 'cosmic') {
        if (inst && inst.updateColors) {
            inst.updateColors(["#ff2727", "#000000", "#a843ff", "#f43f5e", "#8b5cf6"]);
        }
        if (btnCos) { btnCos.classList.add('active'); btnCos.classList.remove('btn-outline-info'); btnCos.classList.add('btn-info'); }
        if (btnEm) { btnEm.classList.remove('active'); btnEm.classList.remove('btn-success'); btnEm.classList.add('btn-outline-success'); }
    } else {
        if (inst && inst.updateColors) {
            inst.updateColors(["#10b981", "#3b82f6", "#a843ff", "#34d399", "#064e3b"]);
        }
        if (btnEm) { btnEm.classList.add('active'); btnEm.classList.remove('btn-outline-success'); btnEm.classList.add('btn-success'); }
        if (btnCos) { btnCos.classList.remove('active'); btnCos.classList.remove('btn-info'); btnCos.classList.add('btn-outline-info'); }
    }
}

function fillDemo(email, pass, role) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = pass;
    // Auto-pulse input border
    const emailInput = document.getElementById('loginEmail');
    emailInput.style.borderColor = '#10b981';
    emailInput.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
    setTimeout(() => {
        emailInput.style.borderColor = '';
        emailInput.style.boxShadow = '';
    }, 1200);
}
</script>

<jsp:include page="/includes/footer.jsp" />
