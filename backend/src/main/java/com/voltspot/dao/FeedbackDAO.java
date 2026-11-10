package com.voltspot.dao;

import com.voltspot.model.Feedback;
import com.voltspot.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDAO {

    public boolean addFeedback(Feedback f) {
        String sql = "INSERT INTO station_feedback (station_id, user_id, booking_id, rating, comments) VALUES (?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setInt(1, f.getStationId());
            stmt.setInt(2, f.getUserId());
            if (f.getBookingId() != null && f.getBookingId() > 0) {
                stmt.setInt(3, f.getBookingId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            stmt.setInt(4, f.getRating());
            stmt.setString(5, f.getComments());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        f.setId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    public List<Feedback> findByStationId(int stationId) {
        List<Feedback> list = new ArrayList<>();
        String sql = "SELECT f.*, u.name as user_name, s.name as station_name " +
                     "FROM station_feedback f " +
                     "JOIN users u ON f.user_id = u.id " +
                     "JOIN charging_stations s ON f.station_id = s.id " +
                     "WHERE f.station_id = ? " +
                     "ORDER BY f.created_at DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, stationId);
            rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public List<Feedback> findByOperatorId(int operatorId) {
        List<Feedback> list = new ArrayList<>();
        String sql = "SELECT f.*, u.name as user_name, s.name as station_name " +
                     "FROM station_feedback f " +
                     "JOIN users u ON f.user_id = u.id " +
                     "JOIN charging_stations s ON f.station_id = s.id " +
                     "WHERE s.operator_id = ? " +
                     "ORDER BY f.created_at DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, operatorId);
            rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public List<Feedback> findAll() {
        List<Feedback> list = new ArrayList<>();
        String sql = "SELECT f.*, u.name as user_name, s.name as station_name " +
                     "FROM station_feedback f " +
                     "JOIN users u ON f.user_id = u.id " +
                     "JOIN charging_stations s ON f.station_id = s.id " +
                     "ORDER BY f.created_at DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public boolean deleteFeedback(int id) {
        String sql = "DELETE FROM station_feedback WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    private Feedback mapResultSet(ResultSet rs) throws SQLException {
        Feedback f = new Feedback();
        f.setId(rs.getInt("id"));
        f.setStationId(rs.getInt("station_id"));
        f.setStationName(rs.getString("station_name"));
        f.setUserId(rs.getInt("user_id"));
        f.setUserName(rs.getString("user_name"));
        int bId = rs.getInt("booking_id");
        f.setBookingId(rs.wasNull() ? null : bId);
        f.setRating(rs.getInt("rating"));
        f.setComments(rs.getString("comments"));
        f.setCreatedAt(rs.getTimestamp("created_at"));
        return f;
    }
}

