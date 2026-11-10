<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.voltspot.model.User" %>

<%
    List<User> users = (List<User>) request.getAttribute("users");
    User currentAdmin = (User) session.getAttribute("user");
    request.setAttribute("pageTitle", "Manage Users - Admin Portal");
%>

<jsp:include page="/includes/header.jsp" />
<jsp:include page="/includes/messages.jsp" />

<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-1 rounded-pill">Admin Management</span>
            <h2 class="fw-bold mb-0">Manage User Accounts</h2>
            <small class="text-muted">EV Drivers, Charging Station Operators, and System Administrators</small>
        </div>
        <a href="${pageContext.request.contextPath}/admin/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Dashboard
        </a>
    </div>

    <% if (users == null || users.isEmpty()) { %>
        <div class="card p-5 text-center border-0 shadow-sm bg-white">
            <p class="text-muted">No users found.</p>
        </div>
    <% } else { %>
        <div class="card shadow-sm border-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr>
                            <th>User ID</th>
                            <th>Name &amp; Role</th>
                            <th>Email Address</th>
                            <th>Phone</th>
                            <th>Registered On</th>
                            <th>Account Status</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <% for (User u : users) { %>
                            <tr>
                                <td>#<%= u.getId() %></td>
                                <td>
                                    <strong class="text-dark"><%= u.getName() %></strong>
                                    <div>
                                        <% if (u.isAdmin()) { %>
                                            <span class="badge bg-danger">ADMINISTRATOR</span>
                                        <% } else if (u.isOperator()) { %>
                                            <span class="badge bg-primary">STATION OPERATOR</span>
                                        <% } else { %>
                                            <span class="badge bg-success">EV DRIVER</span>
                                        <% } %>
                                    </div>
                                </td>
                                <td><%= u.getEmail() %></td>
                                <td><%= u.getPhone() %></td>
                                <td><small class="text-muted"><%= u.getCreatedAt() %></small></td>
                                <td>
                                    <% if ("ACTIVE".equalsIgnoreCase(u.getStatus())) { %>
                                        <span class="badge bg-success-subtle text-success border border-success">Active</span>
                                    <% } else { %>
                                        <span class="badge bg-secondary-subtle text-secondary border">Inactive</span>
                                    <% } %>
                                </td>
                                <td class="text-end">
                                    <% if (currentAdmin != null && currentAdmin.getId() != u.getId()) { %>
                                        <form action="${pageContext.request.contextPath}/admin/toggle-user-status" method="POST" class="d-inline">
                                            <input type="hidden" name="userId" value="<%= u.getId() %>">
                                            <% if ("ACTIVE".equalsIgnoreCase(u.getStatus())) { %>
                                                <input type="hidden" name="status" value="INACTIVE">
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Deactivate Account" onclick="return confirm('Deactivate user <%= u.getName() %>?');">
                                                    <i class="bi bi-person-x"></i> Deactivate
                                                </button>
                                            <% } else { %>
                                                <input type="hidden" name="status" value="ACTIVE">
                                                <button type="submit" class="btn btn-sm btn-outline-success" title="Activate Account">
                                                    <i class="bi bi-person-check"></i> Activate
                                                </button>
                                            <% } %>
                                        </form>
                                    <% } else { %>
                                        <span class="badge bg-light text-muted border small">Current Session</span>
                                    <% } %>
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

