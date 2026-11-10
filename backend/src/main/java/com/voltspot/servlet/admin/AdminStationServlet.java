package com.voltspot.servlet.admin;

import com.voltspot.dao.StationDAO;
import com.voltspot.model.ChargingStation;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

@WebServlet(urlPatterns = {
        "/admin/stations",
        "/admin/pending-stations",
        "/admin/approve-station",
        "/admin/reject-station",
        "/admin/delete-station"
})
public class AdminStationServlet extends HttpServlet {

    private final StationDAO stationDAO = new StationDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getServletPath();

        if ("/admin/pending-stations".equals(servletPath)) {
            List<ChargingStation> pendingList = stationDAO.findPendingStations();
            req.setAttribute("pendingStations", pendingList);
            req.getRequestDispatcher("/admin/pending-stations.jsp").forward(req, resp);
        } else {
            List<ChargingStation> allStations = stationDAO.findAll();
            req.setAttribute("stations", allStations);
            req.getRequestDispatcher("/admin/stations.jsp").forward(req, resp);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || !user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String servletPath = req.getServletPath();
        String stationIdStr = req.getParameter("stationId");

        if (stationIdStr == null || stationIdStr.isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/admin/stations");
            return;
        }

        try {
            int stationId = Integer.parseInt(stationIdStr);

            if ("/admin/approve-station".equals(servletPath)) {
                boolean success = stationDAO.updateStatus(stationId, "APPROVED", null);
                if (success) {
                    resp.sendRedirect(req.getContextPath() + "/admin/pending-stations?success=Station+approved+successfully!+It+is+now+live+for+users.");
                } else {
                    resp.sendRedirect(req.getContextPath() + "/admin/pending-stations?error=Failed+to+approve+station.");
                }
            } else if ("/admin/reject-station".equals(servletPath)) {
                String reason = req.getParameter("reason");
                if (reason == null || reason.trim().isEmpty()) {
                    reason = "Information incomplete or does not meet compliance standards.";
                }
                boolean success = stationDAO.updateStatus(stationId, "REJECTED", reason.trim());
                if (success) {
                    resp.sendRedirect(req.getContextPath() + "/admin/pending-stations?success=Station+has+been+rejected.");
                } else {
                    resp.sendRedirect(req.getContextPath() + "/admin/pending-stations?error=Failed+to+reject+station.");
                }
            } else if ("/admin/delete-station".equals(servletPath)) {
                boolean success = stationDAO.deleteStation(stationId);
                if (success) {
                    resp.sendRedirect(req.getContextPath() + "/admin/stations?success=Station+deleted+successfully.");
                } else {
                    resp.sendRedirect(req.getContextPath() + "/admin/stations?error=Failed+to+delete+station.");
                }
            }
        } catch (NumberFormatException e) {
            resp.sendRedirect(req.getContextPath() + "/admin/stations");
        }
    }
}

