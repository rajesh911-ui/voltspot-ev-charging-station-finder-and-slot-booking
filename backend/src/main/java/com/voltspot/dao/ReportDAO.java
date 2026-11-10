package com.voltspot.dao;

import com.voltspot.util.DBConnection;

import java.math.BigDecimal;
import java.sql.*;
import java.util.*;

public class ReportDAO {

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.createStatement();

            // Total Drivers / Users
            rs = stmt.executeQuery("SELECT COUNT(*) FROM users WHERE role = 'USER'");
            stats.put("totalUsers", rs.next() ? rs.getInt(1) : 0);
            rs.close();

            // Total Operators
            rs = stmt.executeQuery("SELECT COUNT(*) FROM users WHERE role = 'OPERATOR'");
            stats.put("totalOperators", rs.next() ? rs.getInt(1) : 0);
            rs.close();

            // Total Approved Stations
            rs = stmt.executeQuery("SELECT COUNT(*) FROM charging_stations WHERE status = 'APPROVED'");
            stats.put("approvedStations", rs.next() ? rs.getInt(1) : 0);
            rs.close();

            // Pending Stations
            rs = stmt.executeQuery("SELECT COUNT(*) FROM charging_stations WHERE status = 'PENDING'");
            stats.put("pendingStations", rs.next() ? rs.getInt(1) : 0);
            rs.close();

            // Total Bookings
            rs = stmt.executeQuery("SELECT COUNT(*) FROM slot_bookings");
            stats.put("totalBookings", rs.next() ? rs.getInt(1) : 0);
            rs.close();

            // Completed Bookings
            rs = stmt.executeQuery("SELECT COUNT(*) FROM slot_bookings WHERE status = 'COMPLETED'");
            stats.put("completedBookings", rs.next() ? rs.getInt(1) : 0);
            rs.close();

            // Active / Booked Bookings
            rs = stmt.executeQuery("SELECT COUNT(*) FROM slot_bookings WHERE status = 'BOOKED'");
            stats.put("activeBookings", rs.next() ? rs.getInt(1) : 0);
            rs.close();

            // Total Gross Revenue
            rs = stmt.executeQuery("SELECT SUM(amount) FROM payments WHERE payment_status = 'PAID'");
            BigDecimal totalRev = (rs.next() && rs.getBigDecimal(1) != null) ? rs.getBigDecimal(1) : BigDecimal.ZERO;
            stats.put("totalRevenue", totalRev);
            rs.close();

            // Total Feedback Count and Average Rating
            rs = stmt.executeQuery("SELECT COUNT(*), AVG(rating) FROM station_feedback");
            if (rs.next()) {
                stats.put("totalFeedbacks", rs.getInt(1));
                stats.put("averageRating", Math.round(rs.getDouble(2) * 10.0) / 10.0);
            } else {
                stats.put("totalFeedbacks", 0);
                stats.put("averageRating", 0.0);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return stats;
    }

    public List<Map<String, Object>> getPopularStations() {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT s.id, s.name, s.city, COUNT(b.id) as booking_count, " +
                     "COALESCE(SUM(b.amount), 0) as total_revenue, " +
                     "COALESCE(AVG(f.rating), 0) as avg_rating " +
                     "FROM charging_stations s " +
                     "LEFT JOIN slot_bookings b ON s.id = b.station_id AND b.status IN ('BOOKED', 'COMPLETED') " +
                     "LEFT JOIN station_feedback f ON s.id = f.station_id " +
                     "WHERE s.status = 'APPROVED' " +
                     "GROUP BY s.id, s.name, s.city " +
                     "ORDER BY booking_count DESC, total_revenue DESC LIMIT 10";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("name", rs.getString("name"));
                row.put("city", rs.getString("city"));
                row.put("bookingCount", rs.getInt("booking_count"));
                row.put("totalRevenue", rs.getBigDecimal("total_revenue"));
                row.put("avgRating", Math.round(rs.getDouble("avg_rating") * 10.0) / 10.0);
                list.add(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public List<Map<String, Object>> getRevenueByPaymentMethod() {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT payment_method, COUNT(*) as tx_count, SUM(amount) as total_amount " +
                     "FROM payments WHERE payment_status = 'PAID' GROUP BY payment_method ORDER BY total_amount DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("method", rs.getString("payment_method"));
                row.put("count", rs.getInt("tx_count"));
                row.put("amount", rs.getBigDecimal("total_amount"));
                list.add(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }
}

