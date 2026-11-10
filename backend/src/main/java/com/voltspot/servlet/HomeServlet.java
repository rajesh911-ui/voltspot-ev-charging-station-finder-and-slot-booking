package com.voltspot.servlet;

import com.voltspot.dao.ReportDAO;
import com.voltspot.dao.StationDAO;
import com.voltspot.model.ChargingStation;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/home")
public class HomeServlet extends HttpServlet {

    private final StationDAO stationDAO = new StationDAO();
    private final ReportDAO reportDAO = new ReportDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<ChargingStation> approvedStations = stationDAO.findAllApproved();
        List<String> cities = stationDAO.findAllCities();
        Map<String, Object> stats = reportDAO.getAdminDashboardStats();

        req.setAttribute("featuredStations", approvedStations.size() > 6 ? approvedStations.subList(0, 6) : approvedStations);
        req.setAttribute("cities", cities);
        req.setAttribute("stats", stats);

        req.getRequestDispatcher("/index.jsp").forward(req, resp);
    }
}

