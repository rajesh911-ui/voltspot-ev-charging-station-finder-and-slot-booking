<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.Feedback" %>

<%
    List<Feedback> feedbacks = (List<Feedback>) request.getAttribute("feedbacks");
    request.setAttribute("pageTitle", "Customer Reviews - Operator Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill">Operator Management</span>
            <h2 class="fw-bold mb-0">Customer Ratings &amp; Reviews</h2>
            <small class="text-muted">Direct user feedback received across your charging stations</small>
        </div>
        <a href="${pageContext.request.contextPath}/operator/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Dashboard
        </a>
    </div>

    <% if (feedbacks == null || feedbacks.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <i class="bi bi-chat-quote text-muted display-4 mb-3"></i>
            <h4>No feedback received yet</h4>
            <p class="text-muted">When drivers charge their vehicles at your stations and submit reviews, they will be listed here.</p>
        </div>
    <% } else { %>
        <div class="row g-4">
            <% for (Feedback fb : feedbacks) { %>
                <div class="col-md-6">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-light text-dark border">
                                    <i class="bi bi-ev-station me-1"></i> <%= fb.getStationName() %>
                                </span>
                                <div class="star-rating">
                                    <% for (int i = 1; i <= 5; i++) { %>
                                        <i class="bi <%= i <= fb.getRating() ? "bi-star-fill text-warning" : "bi-star text-muted" %>"></i>
                                    <% } %>
                                </div>
                            </div>
                            <h6 class="fw-bold text-dark mt-2 mb-1"><i class="bi bi-person-circle text-secondary me-1"></i> <%= fb.getUserName() %></h6>
                            <p class="text-muted small mb-3">"<%= fb.getComments() %>"</p>
                            <small class="text-secondary opacity-75 d-block text-end" style="font-size:0.75rem;"><i class="bi bi-clock me-1"></i><%= fb.getCreatedAt() %></small>
                        </div>
                    </div>
                </div>
            <% } %>
        </div>
    <% } %>
</div>

<jsp:include page="/includes/footer.jsp" />

