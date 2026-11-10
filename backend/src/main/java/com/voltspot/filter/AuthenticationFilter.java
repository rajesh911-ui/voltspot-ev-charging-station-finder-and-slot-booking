package com.voltspot.filter;

import com.voltspot.model.User;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebFilter("/*")
public class AuthenticationFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String path = req.getRequestURI().substring(req.getContextPath().length());

        // Allow static assets (css, js, images, fonts)
        if (path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/images/") || path.endsWith(".css") || path.endsWith(".js") || path.endsWith(".png") || path.endsWith(".jpg")) {
            chain.doFilter(request, response);
            return;
        }

        // Allow public pages & auth actions
        if (path.equals("/") || path.equals("/index.jsp") || path.equals("/home") ||
            path.equals("/login.jsp") || path.equals("/register.jsp") || path.equals("/auth") ||
            path.startsWith("/stations") || path.startsWith("/station-detail") || path.startsWith("/nearby-stations") ||
            path.startsWith("/check-slot-availability")) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = req.getSession(false);
        User currentUser = (session != null) ? (User) session.getAttribute("user") : null;

        // Check if user is logged in for protected areas
        if (currentUser == null) {
            String redirectUrl = req.getContextPath() + "/login.jsp?msg=Please+login+to+continue&redirect=" + req.getRequestURI();
            res.sendRedirect(redirectUrl);
            return;
        }

        // Admin-only route protection
        if (path.startsWith("/admin/") || path.startsWith("/admin-")) {
            if (!currentUser.isAdmin()) {
                res.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Administrator role required.");
                return;
            }
        }

        // Operator route protection
        if (path.startsWith("/operator/") || path.startsWith("/operator-")) {
            if (!currentUser.isOperator() && !currentUser.isAdmin()) {
                res.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Charging Station Operator role required.");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}

