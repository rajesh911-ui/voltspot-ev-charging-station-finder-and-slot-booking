<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.Feedback" %>

<%
    List<Feedback> feedbacks = (List<Feedback>) request.getAttribute("feedbacks");
    request.setAttribute("pageTitle", "Moderate Feedback - Admin Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill">Admin Management</span>
            <h2 class="fw-bold mb-0">Customer Ratings &amp; Reviews Moderation</h2>
            <small class="text-muted">Review feedback and moderate reviews across all charging facilities</small>
        </div>
        <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Dashboard
        </a>
    </div>

    <% if (feedbacks == null || feedbacks.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <p class="text-muted">No reviews recorded in the system.</p>
        </div>
    <% } else { %>
        <div class="card shadow-sm border-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr>
                            <th>Station</th>
                            <th>Driver</th>
                            <th>Rating</th>
                            <th>Feedback Comments</th>
                            <th>Date</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (Feedback fb : feedbacks) { %>
                            <tr>
                                <td><strong class="text-dark"><%= fb.getStationName() %></strong></td>
                                <td><%= fb.getUserName() %></td>
                                <td>
                                    <span class="star-rating small">
                                        <% for (int i = 1; i <= 5; i++) { %>
                                            <i class="bi <%= i <= fb.getRating() ? "bi-star-fill text-warning" : "bi-star text-muted" %>"></i>
                                        <% } %>
                                    </span>
                                    <span class="fw-bold small ms-1">(<%= fb.getRating() %>/5)</span>
                                </td>
                                <td><p class="small text-muted mb-0">"<%= fb.getComments() %>"</p></td>
                                <td><small class="text-muted"><%= fb.getCreatedAt() %></small></td>
                                <td class="text-end">
                                    <form action="${pageContext.request.contextPath}/admin/delete-feedback" method="POST" class="d-inline" onsubmit="return confirm('Delete this feedback review?');">
                                        <input type="hidden" name="id" value="<%= fb.getId() %>">
                                        <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete Review">
                                            <i class="bi bi-trash"></i> Delete
                                        </button>
                                    </form>
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

