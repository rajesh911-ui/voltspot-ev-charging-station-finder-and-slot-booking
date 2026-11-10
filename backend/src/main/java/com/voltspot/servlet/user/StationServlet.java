package com.voltspot.servlet.user;

import com.google.gson.Gson;
import com.voltspot.dao.FeedbackDAO;
import com.voltspot.dao.StationDAO;
import com.voltspot.model.ChargingStation;
import com.voltspot.model.Feedback;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(urlPatterns = {"/stations", "/nearby-stations", "/station-detail"})
public class StationServlet extends HttpServlet {

    private final StationDAO stationDAO = new StationDAO();
    private final FeedbackDAO feedbackDAO = new FeedbackDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getServletPath();

        if ("/station-detail".equals(servletPath)) {
            handleStationDetail(req, resp);
        } else if ("/nearby-stations".equals(servletPath)) {
            handleNearbyStations(req, resp);
        } else {
            handleStationSearch(req, resp);
        }
    }

    private void handleStationSearch(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String city = req.getParameter("city");
        String keyword = req.getParameter("keyword");
        String type = req.getParameter("type");

        List<ChargingStation> stations = stationDAO.searchStations(city, keyword, type);
        List<String> cities = stationDAO.findAllCities();

        req.setAttribute("stations", stations);
        req.setAttribute("cities", cities);
        req.setAttribute("selectedCity", city);
        req.setAttribute("keyword", keyword);
        req.setAttribute("selectedType", type);

        // Also pass stations as JSON for Leaflet map markers
        req.setAttribute("stationsJson", gson.toJson(stations));

        req.getRequestDispatcher("/stations.jsp").forward(req, resp);
    }

    private void handleNearbyStations(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String latStr = req.getParameter("lat");
        String lngStr = req.getParameter("lng");
        String radiusStr = req.getParameter("radius");
        String format = req.getParameter("format");

        double lat = 40.7128; // Default to NYC if not provided
        double lng = -74.0060;
        double radius = 25.0; // 25 km

        try {
            if (latStr != null && !latStr.isEmpty()) lat = Double.parseDouble(latStr);
            if (lngStr != null && !lngStr.isEmpty()) lng = Double.parseDouble(lngStr);
            if (radiusStr != null && !radiusStr.isEmpty()) radius = Double.parseDouble(radiusStr);
        } catch (NumberFormatException ignored) {}

        List<ChargingStation> nearby = stationDAO.findNearbyStations(lat, lng, radius);

        if ("json".equalsIgnoreCase(format)) {
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(gson.toJson(nearby));
            return;
        }

        List<String> cities = stationDAO.findAllCities();
        req.setAttribute("stations", nearby);
        req.setAttribute("cities", cities);
        req.setAttribute("userLat", lat);
        req.setAttribute("userLng", lng);
        req.setAttribute("radius", radius);
        req.setAttribute("isNearbySearch", true);
        req.setAttribute("stationsJson", gson.toJson(nearby));

        req.getRequestDispatcher("/stations.jsp").forward(req, resp);
    }

    private void handleStationDetail(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String idStr = req.getParameter("id");
        if (idStr == null || idStr.isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/stations");
            return;
        }

        try {
            int stationId = Integer.parseInt(idStr);
            ChargingStation station = stationDAO.findById(stationId);
            if (station == null) {
                resp.sendRedirect(req.getContextPath() + "/stations?error=Station+not+found.");
                return;
            }

            List<Feedback> reviews = feedbackDAO.findByStationId(stationId);
            req.setAttribute("station", station);
            req.setAttribute("reviews", reviews);

            req.getRequestDispatcher("/station-details.jsp").forward(req, resp);
        } catch (NumberFormatException e) {
            resp.sendRedirect(req.getContextPath() + "/stations");
        }
    }
}

