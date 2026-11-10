package com.voltspot.servlet.admin;

import com.voltspot.dao.BookingDAO;
import com.voltspot.dao.ReportDAO;
import com.voltspot.dao.StationDAO;
import com.voltspot.model.ChargingStation;
import com.voltspot.model.SlotBooking;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/admin/dashboard")
public class AdminDashboardServlet extends HttpServlet {

    private final ReportDAO reportDAO = new ReportDAO();
    private final StationDAO stationDAO = new StationDAO();
    private final BookingDAO bookingDAO = new BookingDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || !user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        Map<String, Object> stats = reportDAO.getAdminDashboardStats();
        List<ChargingStation> pendingStations = stationDAO.findPendingStations();
        List<SlotBooking> recentBookings = bookingDAO.findAll();
        List<Map<String, Object>> popularStations = reportDAO.getPopularStations();

        req.setAttribute("stats", stats);
        req.setAttribute("pendingStations", pendingStations);
        req.setAttribute("recentBookings", recentBookings.size() > 6 ? recentBookings.subList(0, 6) : recentBookings);
        req.setAttribute("popularStations", popularStations);

        req.getRequestDispatcher("/admin/dashboard.jsp").forward(req, resp);
    }
}

