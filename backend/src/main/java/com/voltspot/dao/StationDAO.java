package com.voltspot.dao;

import com.voltspot.model.ChargingStation;
import com.voltspot.model.StationChargingType;
import com.voltspot.util.DBConnection;
import com.voltspot.util.GeoUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class StationDAO {

    private final ChargingTypeDAO chargingTypeDAO = new ChargingTypeDAO();

    public List<ChargingStation> findAllApproved() {
        List<ChargingStation> list = new ArrayList<>();
        String sql = "SELECT s.*, u.name as operator_name " +
                     "FROM charging_stations s " +
                     "JOIN users u ON s.operator_id = u.id " +
                     "WHERE s.status = 'APPROVED' " +
                     "ORDER BY s.id DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            while (rs.next()) {
                ChargingStation s = mapResultSet(rs);
                loadDetails(s);
                list.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public List<ChargingStation> searchStations(String city, String keyword, String chargingType) {
        List<ChargingStation> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT DISTINCT s.*, u.name as operator_name " +
                "FROM charging_stations s " +
                "JOIN users u ON s.operator_id = u.id " +
                "LEFT JOIN station_charging_types t ON s.id = t.station_id " +
                "WHERE s.status = 'APPROVED' "
        );

        List<Object> params = new ArrayList<>();

        if (city != null && !city.trim().isEmpty() && !"ALL".equalsIgnoreCase(city.trim())) {
            sql.append("AND LOWER(s.city) = LOWER(?) ");
            params.add(city.trim());
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            sql.append("AND (LOWER(s.name) LIKE ? OR LOWER(s.address) LIKE ? OR LOWER(s.city) LIKE ?) ");
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        if (chargingType != null && !chargingType.trim().isEmpty() && !"ALL".equalsIgnoreCase(chargingType.trim())) {
            sql.append("AND t.charging_type = ? ");
            params.add(chargingType.trim().toUpperCase());
        }

        sql.append("ORDER BY s.id DESC");

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            rs = stmt.executeQuery();
            while (rs.next()) {
                ChargingStation s = mapResultSet(rs);
                loadDetails(s);
                list.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public List<ChargingStation> findNearbyStations(double userLat, double userLng, double radiusKm) {
        List<ChargingStation> all = findAllApproved();
        List<ChargingStation> nearby = new ArrayList<>();
        for (ChargingStation s : all) {
            if (s.getLatitude() != null && s.getLongitude() != null) {
                double dist = GeoUtil.calculateDistanceKm(
                        userLat, userLng,
                        s.getLatitude().doubleValue(),
                        s.getLongitude().doubleValue()
                );
                s.setDistanceKm(dist);
                if (radiusKm <= 0 || dist <= radiusKm) {
                    nearby.add(s);
                }
            }
        }
        nearby.sort(Comparator.comparingDouble(ChargingStation::getDistanceKm));
        return nearby;
    }

    public ChargingStation findById(int id) {
        String sql = "SELECT s.*, u.name as operator_name " +
                     "FROM charging_stations s " +
                     "JOIN users u ON s.operator_id = u.id " +
                     "WHERE s.id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next()) {
                ChargingStation s = mapResultSet(rs);
                loadDetails(s);
                return s;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return null;
    }

    public List<ChargingStation> findByOperatorId(int operatorId) {
        List<ChargingStation> list = new ArrayList<>();
        String sql = "SELECT s.*, u.name as operator_name " +
                     "FROM charging_stations s " +
                     "JOIN users u ON s.operator_id = u.id " +
                     "WHERE s.operator_id = ? " +
                     "ORDER BY s.id DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, operatorId);
            rs = stmt.executeQuery();
            while (rs.next()) {
                ChargingStation s = mapResultSet(rs);
                loadDetails(s);
                list.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public List<ChargingStation> findAll() {
        List<ChargingStation> list = new ArrayList<>();
        String sql = "SELECT s.*, u.name as operator_name " +
                     "FROM charging_stations s " +
                     "JOIN users u ON s.operator_id = u.id " +
                     "ORDER BY s.id DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            while (rs.next()) {
                ChargingStation s = mapResultSet(rs);
                loadDetails(s);
                list.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public List<ChargingStation> findPendingStations() {
        List<ChargingStation> list = new ArrayList<>();
        String sql = "SELECT s.*, u.name as operator_name " +
                     "FROM charging_stations s " +
                     "JOIN users u ON s.operator_id = u.id " +
                     "WHERE s.status = 'PENDING' " +
                     "ORDER BY s.id ASC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            while (rs.next()) {
                ChargingStation s = mapResultSet(rs);
                loadDetails(s);
                list.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return list;
    }

    public int insertStation(ChargingStation s) {
        String sql = "INSERT INTO charging_stations " +
                     "(operator_id, name, address, city, contact_number, latitude, longitude, opening_time, closing_time, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setInt(1, s.getOperatorId());
            stmt.setString(2, s.getName());
            stmt.setString(3, s.getAddress());
            stmt.setString(4, s.getCity());
            stmt.setString(5, s.getContactNumber());
            stmt.setBigDecimal(6, s.getLatitude());
            stmt.setBigDecimal(7, s.getLongitude());
            stmt.setString(8, s.getOpeningTime() != null ? s.getOpeningTime() : "06:00");
            stmt.setString(9, s.getClosingTime() != null ? s.getClosingTime() : "23:00");
            stmt.setString(10, s.getStatus() != null ? s.getStatus() : "PENDING");

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        int id = rs.getInt(1);
                        s.setId(id);
                        return id;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return -1;
    }

    public boolean updateStation(ChargingStation s) {
        String sql = "UPDATE charging_stations SET name = ?, address = ?, city = ?, contact_number = ?, " +
                     "latitude = ?, longitude = ?, opening_time = ?, closing_time = ? " +
                     "WHERE id = ? AND (operator_id = ? OR ? = true)";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, s.getName());
            stmt.setString(2, s.getAddress());
            stmt.setString(3, s.getCity());
            stmt.setString(4, s.getContactNumber());
            stmt.setBigDecimal(5, s.getLatitude());
            stmt.setBigDecimal(6, s.getLongitude());
            stmt.setString(7, s.getOpeningTime());
            stmt.setString(8, s.getClosingTime());
            stmt.setInt(9, s.getId());
            stmt.setInt(10, s.getOperatorId());
            stmt.setBoolean(11, true); // Allow admin update bypass
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    public boolean updateStatus(int stationId, String status, String rejectionReason) {
        String sql = "UPDATE charging_stations SET status = ?, rejection_reason = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, status.toUpperCase());
            stmt.setString(2, rejectionReason);
            stmt.setInt(3, stationId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    public boolean deleteStation(int stationId) {
        String sql = "DELETE FROM charging_stations WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, stationId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    public List<String> findAllCities() {
        List<String> cities = new ArrayList<>();
        String sql = "SELECT DISTINCT city FROM charging_stations WHERE status = 'APPROVED' ORDER BY city ASC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            while (rs.next()) {
                cities.add(rs.getString("city"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return cities;
    }

    private void loadDetails(ChargingStation s) {
        // Load charging types
        List<StationChargingType> types = chargingTypeDAO.findByStationId(s.getId());
        s.setChargingTypes(types);

        // Load average rating and count
        String sql = "SELECT AVG(rating) as avg_rating, COUNT(*) as rev_count FROM station_feedback WHERE station_id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, s.getId());
            rs = stmt.executeQuery();
            if (rs.next()) {
                double avg = rs.getDouble("avg_rating");
                int count = rs.getInt("rev_count");
                s.setAverageRating(Math.round(avg * 10.0) / 10.0);
                s.setReviewCount(count);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
    }

    private ChargingStation mapResultSet(ResultSet rs) throws SQLException {
        ChargingStation s = new ChargingStation();
        s.setId(rs.getInt("id"));
        s.setOperatorId(rs.getInt("operator_id"));
        try {
            s.setOperatorName(rs.getString("operator_name"));
        } catch (SQLException ignored) {}
        s.setName(rs.getString("name"));
        s.setAddress(rs.getString("address"));
        s.setCity(rs.getString("city"));
        s.setContactNumber(rs.getString("contact_number"));
        s.setLatitude(rs.getBigDecimal("latitude"));
        s.setLongitude(rs.getBigDecimal("longitude"));
        s.setOpeningTime(rs.getString("opening_time"));
        s.setClosingTime(rs.getString("closing_time"));
        s.setStatus(rs.getString("status"));
        s.setRejectionReason(rs.getString("rejection_reason"));
        s.setCreatedAt(rs.getTimestamp("created_at"));
        return s;
    }
}

