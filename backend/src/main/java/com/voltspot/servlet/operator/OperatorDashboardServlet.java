package com.voltspot.servlet.operator;

import com.voltspot.dao.BookingDAO;
import com.voltspot.dao.FeedbackDAO;
import com.voltspot.dao.StationDAO;
import com.voltspot.model.ChargingStation;
import com.voltspot.model.Feedback;
import com.voltspot.model.SlotBooking;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@WebServlet("/operator/dashboard")
public class OperatorDashboardServlet extends HttpServlet {

    private final StationDAO stationDAO = new StationDAO();
    private final BookingDAO bookingDAO = new BookingDAO();
    private final FeedbackDAO feedbackDAO = new FeedbackDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || (!user.isOperator() && !user.isAdmin())) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        List<ChargingStation> myStations = stationDAO.findByOperatorId(user.getId());
        List<SlotBooking> myBookings = bookingDAO.findByOperatorId(user.getId());
        List<Feedback> myFeedbacks = feedbackDAO.findByOperatorId(user.getId());

        int totalStations = myStations.size();
        int approvedStations = 0;
        int pendingStations = 0;
        for (ChargingStation s : myStations) {
            if ("APPROVED".equalsIgnoreCase(s.getStatus())) approvedStations++;
            else if ("PENDING".equalsIgnoreCase(s.getStatus())) pendingStations++;
        }

        int totalBookings = myBookings.size();
        int activeBookings = 0;
        int completedBookings = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (SlotBooking b : myBookings) {
            if ("BOOKED".equalsIgnoreCase(b.getStatus())) activeBookings++;
            else if ("COMPLETED".equalsIgnoreCase(b.getStatus())) completedBookings++;

            if ("PAID".equalsIgnoreCase(b.getPaymentStatus()) || "BOOKED".equalsIgnoreCase(b.getStatus()) || "COMPLETED".equalsIgnoreCase(b.getStatus())) {
                if (b.getAmount() != null) {
                    totalRevenue = totalRevenue.add(b.getAmount());
                }
            }
        }

        req.setAttribute("myStations", myStations);
        req.setAttribute("recentBookings", myBookings.size() > 5 ? myBookings.subList(0, 5) : myBookings);
        req.setAttribute("recentFeedbacks", myFeedbacks.size() > 5 ? myFeedbacks.subList(0, 5) : myFeedbacks);

        req.setAttribute("totalStations", totalStations);
        req.setAttribute("approvedStations", approvedStations);
        req.setAttribute("pendingStations", pendingStations);
        req.setAttribute("totalBookings", totalBookings);
        req.setAttribute("activeBookings", activeBookings);
        req.setAttribute("completedBookings", completedBookings);
        req.setAttribute("totalRevenue", totalRevenue);

        req.getRequestDispatcher("/operator/dashboard.jsp").forward(req, resp);
    }
}

