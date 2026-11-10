package com.voltspot.servlet.admin;

import com.voltspot.dao.BookingDAO;
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

@WebServlet(urlPatterns = {"/admin/bookings", "/admin/update-booking"})
public class AdminBookingServlet extends HttpServlet {

    private final BookingDAO bookingDAO = new BookingDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || !user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        List<SlotBooking> allBookings = bookingDAO.findAll();
        req.setAttribute("bookings", allBookings);
        req.getRequestDispatcher("/admin/bookings.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null || !user.isAdmin()) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String bookingIdStr = req.getParameter("bookingId");
        String newStatus = req.getParameter("status");

        if (bookingIdStr != null && newStatus != null) {
            try {
                int bookingId = Integer.parseInt(bookingIdStr);
                boolean updated = bookingDAO.updateStatus(bookingId, newStatus);
                if (updated) {
                    resp.sendRedirect(req.getContextPath() + "/admin/bookings?success=Booking+status+updated+to+" + newStatus);
                    return;
                }
            } catch (NumberFormatException ignored) {}
        }
        resp.sendRedirect(req.getContextPath() + "/admin/bookings?error=Failed+to+update+booking.");
    }
}

