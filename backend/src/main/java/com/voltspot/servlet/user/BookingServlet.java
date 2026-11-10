package com.voltspot.servlet.user;

import com.voltspot.dao.BookingDAO;
import com.voltspot.dao.ChargingTypeDAO;
import com.voltspot.dao.StationDAO;
import com.voltspot.model.ChargingStation;
import com.voltspot.model.SlotBooking;
import com.voltspot.model.StationChargingType;
import com.voltspot.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;

@WebServlet(urlPatterns = {"/book-slot", "/my-bookings", "/cancel-booking"})
public class BookingServlet extends HttpServlet {

    private final BookingDAO bookingDAO = new BookingDAO();
    private final StationDAO stationDAO = new StationDAO();
    private final ChargingTypeDAO chargingTypeDAO = new ChargingTypeDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getServletPath();

        if ("/my-bookings".equals(servletPath)) {
            handleMyBookings(req, resp);
        } else if ("/book-slot".equals(servletPath)) {
            handleBookSlotView(req, resp);
        } else {
            resp.sendRedirect(req.getContextPath() + "/my-bookings");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getServletPath();

        if ("/cancel-booking".equals(servletPath)) {
            handleCancelBooking(req, resp);
        } else {
            handleCreateBooking(req, resp);
        }
    }

    private void handleBookSlotView(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String stationIdStr = req.getParameter("stationId");
        if (stationIdStr == null || stationIdStr.isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/stations");
            return;
        }

        try {
            int stationId = Integer.parseInt(stationIdStr);
            ChargingStation station = stationDAO.findById(stationId);
            if (station == null) {
                resp.sendRedirect(req.getContextPath() + "/stations?error=Station+not+found.");
                return;
            }

            req.setAttribute("station", station);
            req.setAttribute("timeSlots", BookingDAO.STANDARD_TIME_SLOTS);
            req.getRequestDispatcher("/station-details.jsp").forward(req, resp);
        } catch (NumberFormatException e) {
            resp.sendRedirect(req.getContextPath() + "/stations");
        }
    }

    private void handleCreateBooking(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp?msg=Please+login+to+book+a+slot.");
            return;
        }

        String stationIdStr = req.getParameter("stationId");
        String chargingType = req.getParameter("chargingType");
        String bookingDateStr = req.getParameter("bookingDate");
        String timeSlot = req.getParameter("timeSlot");
        String vehicleNumber = req.getParameter("vehicleNumber");
        String vehicleModel = req.getParameter("vehicleModel");

        if (stationIdStr == null || chargingType == null || bookingDateStr == null ||
            timeSlot == null || vehicleNumber == null || vehicleModel == null ||
            stationIdStr.isEmpty() || chargingType.isEmpty() || bookingDateStr.isEmpty() ||
            timeSlot.isEmpty() || vehicleNumber.trim().isEmpty() || vehicleModel.trim().isEmpty()) {

            resp.sendRedirect(req.getContextPath() + "/station-detail?id=" + stationIdStr + "&error=All+booking+fields+are+required.");
            return;
        }

        try {
            int stationId = Integer.parseInt(stationIdStr);
            Date bookingDate = Date.valueOf(bookingDateStr);

            // Fetch pricing for selected charging type
            StationChargingType typeConfig = chargingTypeDAO.findByStationAndType(stationId, chargingType);
            if (typeConfig == null) {
                resp.sendRedirect(req.getContextPath() + "/station-detail?id=" + stationId + "&error=Invalid+charging+type+selected.");
                return;
            }

            BigDecimal slotPrice = typeConfig.getPricePerSlot();

            // Validate slot availability in real-time
            boolean available = bookingDAO.isSlotAvailable(stationId, chargingType, bookingDate, timeSlot);
            if (!available) {
                resp.sendRedirect(req.getContextPath() + "/station-detail?id=" + stationId + "&error=Slot+" + timeSlot + "+is+fully+booked.+Please+select+another+time+slot.");
                return;
            }

            // Create slot booking record
            SlotBooking booking = new SlotBooking();
            String bookingNumber = "VS-BK-" + (System.currentTimeMillis() % 10000000);
            booking.setBookingNumber(bookingNumber);
            booking.setUserId(user.getId());
            booking.setStationId(stationId);
            booking.setChargingType(chargingType.toUpperCase());
            booking.setBookingDate(bookingDate);
            booking.setTimeSlot(timeSlot);
            booking.setVehicleNumber(vehicleNumber.trim().toUpperCase());
            booking.setVehicleModel(vehicleModel.trim());
            booking.setAmount(slotPrice);
            booking.setStatus("PENDING");

            boolean success = bookingDAO.createBooking(booking);
            if (success) {
                // Redirect user to integrated payment page
                resp.sendRedirect(req.getContextPath() + "/payment?bookingId=" + booking.getId());
            } else {
                resp.sendRedirect(req.getContextPath() + "/station-detail?id=" + stationId + "&error=Failed+to+reserve+slot.+It+may+have+just+been+booked+by+another+user.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendRedirect(req.getContextPath() + "/stations?error=Error+processing+booking:+" + e.getMessage());
        }
    }

    private void handleMyBookings(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        List<SlotBooking> bookings = bookingDAO.findByUserId(user.getId());
        req.setAttribute("bookings", bookings);
        req.getRequestDispatcher("/my-bookings.jsp").forward(req, resp);
    }

    private void handleCancelBooking(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String bookingIdStr = req.getParameter("bookingId");
        if (bookingIdStr != null && !bookingIdStr.isEmpty()) {
            try {
                int bookingId = Integer.parseInt(bookingIdStr);
                boolean cancelled = bookingDAO.cancelBooking(bookingId, user.getId());
                if (cancelled) {
                    resp.sendRedirect(req.getContextPath() + "/my-bookings?success=Booking+has+been+cancelled+successfully.");
                    return;
                }
            } catch (NumberFormatException ignored) {}
        }
        resp.sendRedirect(req.getContextPath() + "/my-bookings?error=Failed+to+cancel+booking.");
    }
}

