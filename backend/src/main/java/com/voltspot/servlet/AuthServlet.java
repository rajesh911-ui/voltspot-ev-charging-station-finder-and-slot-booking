package com.voltspot.servlet;

import com.voltspot.dao.UserDAO;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/auth")
public class AuthServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String action = req.getParameter("action");
        if ("logout".equalsIgnoreCase(action)) {
            HttpSession session = req.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            resp.sendRedirect(req.getContextPath() + "/login.jsp?success=You+have+been+logged+out+successfully.");
            return;
        }
        resp.sendRedirect(req.getContextPath() + "/login.jsp");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String action = req.getParameter("action");

        if ("login".equalsIgnoreCase(action)) {
            handleLogin(req, resp);
        } else if ("register".equalsIgnoreCase(action)) {
            handleRegister(req, resp);
        } else {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String email = req.getParameter("email");
        String password = req.getParameter("password");
        String redirect = req.getParameter("redirect");

        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp?error=Email+and+password+are+required.");
            return;
        }

        User user = userDAO.authenticate(email, password);
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp?error=Invalid+email+or+password.");
            return;
        }

        if ("INACTIVE".equalsIgnoreCase(user.getStatus())) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp?error=Your+account+has+been+deactivated.+Please+contact+administrator.");
            return;
        }

        // Establish session
        HttpSession session = req.getSession(true);
        session.setAttribute("user", user);

        // Redirect based on role or original URL
        if (redirect != null && !redirect.trim().isEmpty() && !redirect.contains("login") && !redirect.contains("auth")) {
            resp.sendRedirect(redirect);
            return;
        }

        if (user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/admin/dashboard");
        } else if (user.isOperator()) {
            resp.sendRedirect(req.getContextPath() + "/operator/dashboard");
        } else {
            resp.sendRedirect(req.getContextPath() + "/stations");
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String name = req.getParameter("name");
        String email = req.getParameter("email");
        String password = req.getParameter("password");
        String phone = req.getParameter("phone");
        String role = req.getParameter("role"); // 'USER' or 'OPERATOR'

        if (name == null || email == null || password == null || phone == null ||
            name.trim().isEmpty() || email.trim().isEmpty() || password.trim().isEmpty() || phone.trim().isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/register.jsp?error=All+fields+are+required.");
            return;
        }

        if (password.length() < 6) {
            resp.sendRedirect(req.getContextPath() + "/register.jsp?error=Password+must+be+at+least+6+characters+long.");
            return;
        }

        if (userDAO.emailExists(email)) {
            resp.sendRedirect(req.getContextPath() + "/register.jsp?error=An+account+with+this+email+already+exists.");
            return;
        }

        if (!"OPERATOR".equalsIgnoreCase(role) && !"USER".equalsIgnoreCase(role)) {
            role = "USER";
        }

        User user = new User();
        user.setName(name.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setPassword(password.trim());
        user.setPhone(phone.trim());
        user.setRole(role.toUpperCase());
        user.setStatus("ACTIVE");

        boolean created = userDAO.register(user);
        if (created) {
            // Auto login
            HttpSession session = req.getSession(true);
            session.setAttribute("user", user);

            if (user.isOperator()) {
                resp.sendRedirect(req.getContextPath() + "/operator/dashboard?success=Welcome!+Your+operator+account+has+been+registered.");
            } else {
                resp.sendRedirect(req.getContextPath() + "/stations?success=Welcome+to+VoltSpot!+Find+your+nearest+charging+station.");
            }
        } else {
            resp.sendRedirect(req.getContextPath() + "/register.jsp?error=Registration+failed.+Please+try+again.");
        }
    }
}

