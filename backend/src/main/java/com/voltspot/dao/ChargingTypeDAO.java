package com.voltspot.dao;

import com.voltspot.model.StationChargingType;
import com.voltspot.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChargingTypeDAO {

    public List<StationChargingType> findByStationId(int stationId) {
        List<StationChargingType> list = new ArrayList<>();
        String sql = "SELECT * FROM station_charging_types WHERE station_id = ? ORDER BY charging_type ASC";
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

    public StationChargingType findByStationAndType(int stationId, String chargingType) {
        String sql = "SELECT * FROM station_charging_types WHERE station_id = ? AND charging_type = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, stationId);
            stmt.setString(2, chargingType.toUpperCase());
            rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSet(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return null;
    }

    public boolean saveOrUpdate(StationChargingType type) {
        String sql = "INSERT INTO station_charging_types (station_id, charging_type, total_capacity, power_kw, price_per_slot) " +
                     "VALUES (?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE total_capacity = VALUES(total_capacity), " +
                     "power_kw = VALUES(power_kw), price_per_slot = VALUES(price_per_slot)";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, type.getStationId());
            stmt.setString(2, type.getChargingType().toUpperCase());
            stmt.setInt(3, type.getTotalCapacity());
            stmt.setBigDecimal(4, type.getPowerKw());
            stmt.setBigDecimal(5, type.getPricePerSlot());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    public boolean deleteByStationId(int stationId) {
        String sql = "DELETE FROM station_charging_types WHERE station_id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, stationId);
            return stmt.executeUpdate() >= 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    private StationChargingType mapResultSet(ResultSet rs) throws SQLException {
        StationChargingType t = new StationChargingType();
        t.setId(rs.getInt("id"));
        t.setStationId(rs.getInt("station_id"));
        t.setChargingType(rs.getString("charging_type"));
        t.setTotalCapacity(rs.getInt("total_capacity"));
        t.setPowerKw(rs.getBigDecimal("power_kw"));
        t.setPricePerSlot(rs.getBigDecimal("price_per_slot"));
        return t;
    }
}

