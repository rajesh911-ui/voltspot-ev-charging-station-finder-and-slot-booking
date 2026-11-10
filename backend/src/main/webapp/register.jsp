<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String defaultRole = request.getParameter("role");
    if (defaultRole == null || (!"OPERATOR".equalsIgnoreCase(defaultRole) && !"USER".equalsIgnoreCase(defaultRole))) {
        defaultRole = "USER";
    }
    request.setAttribute("pageTitle", "Create Account - VoltSpot EV India (₹)");
%>
<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="antigravity-login-wrapper">
    <!-- Centered Flexbox & Grid Container (Perfect Horizontal & Vertical Centering) -->
    <div class="login-center-container" style="max-width: 550px;">
        <!-- 3. Glassmorphic Registration Card with Adjusted High-Contrast Text Colors -->
        <div class="card antigravity-login-card mx-auto" style="max-width: 540px;">
            <div class="antigravity-glow-bar"></div>
            <div class="card-body p-4 p-md-5">
            
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-2" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);">
                    <i class="bi bi-person-plus-fill fs-2" style="color: #10b981;"></i>
                </div>
                <h3 class="fw-bold mb-1">Join Volt<span style="color: #34d399;">Spot</span> EV</h3>
                <p class="subtitle mb-2">Register as an EV Driver or Charging Hub Operator (₹)</p>
                <div class="antigravity-engine-badge">
                    <i class="bi bi-cpu"></i>
                    <span>Antigravity Physics Active</span>
                </div>
            </div>

            <!-- Direct Quick Navigation for Registered Users -->
            <div class="p-3 mb-4 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-2" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.4) !important;">
                <div>
                    <span class="badge bg-success me-1">ALREADY REGISTERED?</span>
                    <span class="text-white small fw-semibold">Already have an account?</span>
                </div>
                <a href="${pageContext.request.contextPath}/login.jsp" class="btn btn-sm btn-success fw-bold text-nowrap">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Open Login Page
                </a>
            </div>

            <form action="${pageContext.request.contextPath}/auth" method="POST">
                <input type="hidden" name="action" value="register">

                <!-- Role Selector with High Contrast -->
                <div class="mb-4">
                    <label class="form-label">I want to register as:</label>
                    <div class="row g-2">
                        <div class="col-6">
                            <input type="radio" class="btn-check" name="role" id="roleUser" value="USER" <%= "USER".equalsIgnoreCase(defaultRole) ? "checked" : "" %>>
                            <label class="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center" for="roleUser" style="border-width: 1.5px; font-weight: 700;">
                                <i class="bi bi-car-front-fill fs-4 mb-1"></i>
                                <span class="fw-bold">EV Driver</span>
                                <small class="text-white-50" style="font-size: 0.7rem;">Book Charging Slots</small>
                            </label>
                        </div>
                        <div class="col-6">
                            <input type="radio" class="btn-check" name="role" id="roleOperator" value="OPERATOR" <%= "OPERATOR".equalsIgnoreCase(defaultRole) ? "checked" : "" %>>
                            <label class="btn btn-outline-primary w-100 py-2 d-flex flex-column align-items-center" for="roleOperator" style="border-width: 1.5px; font-weight: 700;">
                                <i class="bi bi-ev-station-fill fs-4 mb-1"></i>
                                <span class="fw-bold">Hub Operator</span>
                                <small class="text-white-50" style="font-size: 0.7rem;">Manage EV Hubs</small>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Full Name / Organization</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                        <input type="text" name="name" class="form-control" placeholder="Enter your full name or organization" required>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-envelope-at-fill"></i></span>
                        <input type="email" name="email" class="form-control" placeholder="you@example.com" required>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Mobile Number</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
                        <input type="tel" name="phone" class="form-control" placeholder="+91 98765 00000" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label">Password</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-shield-lock-fill"></i></span>
                        <input type="password" name="password" class="form-control" placeholder="Minimum 6 characters" minlength="6" required>
                    </div>
                </div>

                <button type="submit" class="btn antigravity-submit-btn w-100 py-2 mb-3">
                    <i class="bi bi-check-circle me-1"></i> Complete Registration
                </button>
            </form>

            <div class="text-center mt-3 pt-3 border-top" style="border-color: rgba(51, 65, 85, 0.7) !important;">
                <p class="small mb-0" style="color: #94a3b8;">
                    Already registered? 
                    <a href="${pageContext.request.contextPath}/login.jsp" style="color: #34d399; font-weight: 700; text-decoration: none;">
                        Sign In to Your Account <i class="bi bi-arrow-right"></i>
                    </a>
                </p>
            </div>
        </div>
    </div>
    </div><!-- /.login-center-container -->
</div><!-- /.antigravity-login-wrapper -->

<jsp:include page="/includes/footer.jsp" />
