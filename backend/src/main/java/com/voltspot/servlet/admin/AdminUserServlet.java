package com.voltspot.servlet.admin;

import com.voltspot.dao.UserDAO;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

@WebServlet(urlPatterns = {"/admin/users", "/admin/toggle-user-status"})
public class AdminUserServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || !user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        List<User> userList = userDAO.findAll();
        req.setAttribute("users", userList);
        req.getRequestDispatcher("/admin/users.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || !user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String userIdStr = req.getParameter("userId");
        String newStatus = req.getParameter("status");

        if (userIdStr != null && newStatus != null) {
            try {
                int targetId = Integer.parseInt(userIdStr);
                // Prevent admin from deactivating self
                if (targetId == user.getId()) {
                    resp.sendRedirect(req.getContextPath() + "/admin/users?error=Cannot+deactivate+your+own+admin+account.");
                    return;
                }
                boolean updated = userDAO.updateStatus(targetId, newStatus);
                if (updated) {
                    resp.sendRedirect(req.getContextPath() + "/admin/users?success=User+status+updated+to+" + newStatus);
                    return;
                }
            } catch (NumberFormatException ignored) {}
        }
        resp.sendRedirect(req.getContextPath() + "/admin/users?error=Failed+to+update+user+status.");
    }
}

