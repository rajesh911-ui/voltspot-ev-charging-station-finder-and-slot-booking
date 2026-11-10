package com.voltspot.servlet.user;

import com.google.gson.Gson;
import com.voltspot.dao.BookingDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Date;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@WebServlet("/check-slot-availability")
public class SlotAvailabilityServlet extends HttpServlet {

    private final BookingDAO bookingDAO = new BookingDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String stationIdStr = req.getParameter("stationId");
        String chargingType = req.getParameter("chargingType");
        String dateStr = req.getParameter("date");

        if (stationIdStr == null || chargingType == null || dateStr == null ||
            stationIdStr.isEmpty() || chargingType.isEmpty() || dateStr.isEmpty()) {
            resp.getWriter().write(gson.toJson(Collections.emptyList()));
            return;
        }

        try {
            int stationId = Integer.parseInt(stationIdStr);
            Date bookingDate = Date.valueOf(dateStr);

            List<Map<String, Object>> availability = bookingDAO.getSlotStatusList(stationId, chargingType, bookingDate);
            resp.getWriter().write(gson.toJson(availability));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}

