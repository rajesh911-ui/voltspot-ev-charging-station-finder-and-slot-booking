package com.voltspot.servlet.operator;

import com.voltspot.dao.ChargingTypeDAO;
import com.voltspot.dao.StationDAO;
import com.voltspot.model.ChargingStation;
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
import java.util.List;

@WebServlet(urlPatterns = {"/operator/stations", "/operator/add-station", "/operator/edit-station"})
public class OperatorStationServlet extends HttpServlet {

    private final StationDAO stationDAO = new StationDAO();
    private final ChargingTypeDAO chargingTypeDAO = new ChargingTypeDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getServletPath();

        if ("/operator/add-station".equals(servletPath)) {
            req.getRequestDispatcher("/operator/add-station.jsp").forward(req, resp);
        } else if ("/operator/edit-station".equals(servletPath)) {
            handleEditView(req, resp);
        } else {
            handleListStations(req, resp);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String servletPath = req.getServletPath();

        if ("/operator/edit-station".equals(servletPath)) {
            handleUpdateStation(req, resp);
        } else {
            handleCreateStation(req, resp);
        }
    }

    private void handleListStations(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        List<ChargingStation> stations = stationDAO.findByOperatorId(user.getId());
        req.setAttribute("stations", stations);
        req.getRequestDispatcher("/operator/stations.jsp").forward(req, resp);
    }

    private void handleCreateStation(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String name = req.getParameter("name");
        String address = req.getParameter("address");
        String city = req.getParameter("city");
        String contactNumber = req.getParameter("contactNumber");
        String latitudeStr = req.getParameter("latitude");
        String longitudeStr = req.getParameter("longitude");
        String openingTime = req.getParameter("openingTime");
        String closingTime = req.getParameter("closingTime");

        // Charging types info
        String fastCapacityStr = req.getParameter("fastCapacity");
        String fastPowerStr = req.getParameter("fastPower");
        String fastPriceStr = req.getParameter("fastPrice");

        String normalCapacityStr = req.getParameter("normalCapacity");
        String normalPowerStr = req.getParameter("normalPower");
        String normalPriceStr = req.getParameter("normalPrice");

        if (name == null || address == null || city == null || contactNumber == null ||
            latitudeStr == null || longitudeStr == null ||
            name.trim().isEmpty() || address.trim().isEmpty() || city.trim().isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/operator/add-station?error=All+station+details+are+required.");
            return;
        }

        try {
            BigDecimal latitude = new BigDecimal(latitudeStr.trim());
            BigDecimal longitude = new BigDecimal(longitudeStr.trim());

            ChargingStation station = new ChargingStation();
            station.setOperatorId(user.getId());
            station.setName(name.trim());
            station.setAddress(address.trim());
            station.setCity(city.trim());
            station.setContactNumber(contactNumber.trim());
            station.setLatitude(latitude);
            station.setLongitude(longitude);
            station.setOpeningTime(openingTime != null ? openingTime : "06:00");
            station.setClosingTime(closingTime != null ? closingTime : "23:00");
            station.setStatus("PENDING"); // Mandatory Admin approval required

            int stationId = stationDAO.insertStation(station);
            if (stationId > 0) {
                // Save FAST charging configuration
                if (fastCapacityStr != null && !fastCapacityStr.isEmpty()) {
                    int fastCap = Integer.parseInt(fastCapacityStr);
                    BigDecimal fastPower = (fastPowerStr != null && !fastPowerStr.isEmpty()) ? new BigDecimal(fastPowerStr) : new BigDecimal("150.00");
                    BigDecimal fastPrice = (fastPriceStr != null && !fastPriceStr.isEmpty()) ? new BigDecimal(fastPriceStr) : new BigDecimal("18.00");
                    StationChargingType fastType = new StationChargingType(0, stationId, "FAST", fastCap, fastPower, fastPrice);
                    chargingTypeDAO.saveOrUpdate(fastType);
                }

                // Save NORMAL charging configuration
                if (normalCapacityStr != null && !normalCapacityStr.isEmpty()) {
                    int normalCap = Integer.parseInt(normalCapacityStr);
                    BigDecimal normalPower = (normalPowerStr != null && !normalPowerStr.isEmpty()) ? new BigDecimal(normalPowerStr) : new BigDecimal("22.00");
                    BigDecimal normalPrice = (normalPriceStr != null && !normalPriceStr.isEmpty()) ? new BigDecimal(normalPriceStr) : new BigDecimal("8.00");
                    StationChargingType normalType = new StationChargingType(0, stationId, "NORMAL", normalCap, normalPower, normalPrice);
                    chargingTypeDAO.saveOrUpdate(normalType);
                }

                resp.sendRedirect(req.getContextPath() + "/operator/stations?success=Station+registered+successfully!+It+is+pending+Admin+approval.");
            } else {
                resp.sendRedirect(req.getContextPath() + "/operator/add-station?error=Database+error+registering+station.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendRedirect(req.getContextPath() + "/operator/add-station?error=" + e.getMessage());
        }
    }

    private void handleEditView(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String idStr = req.getParameter("id");
        if (idStr == null || idStr.isEmpty()) {
            resp.sendRedirect(req.getContextPath() + "/operator/stations");
            return;
        }

        try {
            int stationId = Integer.parseInt(idStr);
            ChargingStation station = stationDAO.findById(stationId);
            if (station == null) {
                resp.sendRedirect(req.getContextPath() + "/operator/stations?error=Station+not+found.");
                return;
            }

            req.setAttribute("station", station);
            req.getRequestDispatcher("/operator/edit-station.jsp").forward(req, resp);
        } catch (NumberFormatException e) {
            resp.sendRedirect(req.getContextPath() + "/operator/stations");
        }
    }

    private void handleUpdateStation(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/login.jsp");
            return;
        }

        String idStr = req.getParameter("id");
        String name = req.getParameter("name");
        String address = req.getParameter("address");
        String city = req.getParameter("city");
        String contactNumber = req.getParameter("contactNumber");
        String latitudeStr = req.getParameter("latitude");
        String longitudeStr = req.getParameter("longitude");
        String openingTime = req.getParameter("openingTime");
        String closingTime = req.getParameter("closingTime");

        String fastCapacityStr = req.getParameter("fastCapacity");
        String fastPowerStr = req.getParameter("fastPower");
        String fastPriceStr = req.getParameter("fastPrice");

        String normalCapacityStr = req.getParameter("normalCapacity");
        String normalPowerStr = req.getParameter("normalPower");
        String normalPriceStr = req.getParameter("normalPrice");

        try {
            int stationId = Integer.parseInt(idStr);
            ChargingStation s = stationDAO.findById(stationId);
            if (s == null || (s.getOperatorId() != user.getId() && !user.isAdmin())) {
                resp.sendRedirect(req.getContextPath() + "/operator/stations?error=Unauthorized.");
                return;
            }

            s.setName(name.trim());
            s.setAddress(address.trim());
            s.setCity(city.trim());
            s.setContactNumber(contactNumber.trim());
            s.setLatitude(new BigDecimal(latitudeStr.trim()));
            s.setLongitude(new BigDecimal(longitudeStr.trim()));
            s.setOpeningTime(openingTime);
            s.setClosingTime(closingTime);

            boolean updated = stationDAO.updateStation(s);
            if (updated) {
                // Update FAST charging type
                if (fastCapacityStr != null && !fastCapacityStr.isEmpty()) {
                    int cap = Integer.parseInt(fastCapacityStr);
                    BigDecimal power = new BigDecimal(fastPowerStr);
                    BigDecimal price = new BigDecimal(fastPriceStr);
                    chargingTypeDAO.saveOrUpdate(new StationChargingType(0, stationId, "FAST", cap, power, price));
                }
                // Update NORMAL charging type
                if (normalCapacityStr != null && !normalCapacityStr.isEmpty()) {
                    int cap = Integer.parseInt(normalCapacityStr);
                    BigDecimal power = new BigDecimal(normalPowerStr);
                    BigDecimal price = new BigDecimal(normalPriceStr);
                    chargingTypeDAO.saveOrUpdate(new StationChargingType(0, stationId, "NORMAL", cap, power, price));
                }

                resp.sendRedirect(req.getContextPath() + "/operator/stations?success=Station+updated+successfully.");
            } else {
                resp.sendRedirect(req.getContextPath() + "/operator/edit-station?id=" + stationId + "&error=Update+failed.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendRedirect(req.getContextPath() + "/operator/stations?error=" + e.getMessage());
        }
    }
}

