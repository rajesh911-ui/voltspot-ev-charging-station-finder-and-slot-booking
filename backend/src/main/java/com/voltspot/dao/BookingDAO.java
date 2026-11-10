package com.voltspot.dao;

import com.voltspot.model.SlotBooking;
import com.voltspot.model.StationChargingType;
import com.voltspot.util.DBConnection;

import java.sql.*;
import java.util.*;

public class BookingDAO {

    public static final List<String> STANDARD_TIME_SLOTS = Arrays.asList(
            "06:00 - 07:00",
            "07:00 - 08:00",
            "08:00 - 09:00",
            "09:00 - 10:00",
            "10:00 - 11:00",
            "11:00 - 12:00",
            "12:00 - 13:00",
            "13:00 - 14:00",
            "14:00 - 15:00",
            "15:00 - 16:00",
            "16:00 - 17:00",
            "17:00 - 18:00",
            "18:00 - 19:00",
            "19:00 - 20:00",
            "20:00 - 21:00",
            "21:00 - 22:00",
            "22:00 - 23:00"
    );

    private final ChargingTypeDAO chargingTypeDAO = new ChargingTypeDAO();

    /**
     * Checks if a slot has available capacity for the specified station, charging type, date, and slot.
     */
    public boolean isSlotAvailable(int stationId, String chargingType, java.sql.Date bookingDate, String timeSlot) {
        StationChargingType typeConfig = chargingTypeDAO.findByStationAndType(stationId, chargingType);
        if (typeConfig == null || typeConfig.getTotalCapacity() <= 0) {
            return false;
        }

        int bookedCount = getBookedCount(stationId, chargingType, bookingDate, timeSlot);
        return bookedCount < typeConfig.getTotalCapacity();
    }

    /**
     * Returns count of active (PENDING or BOOKED) bookings for the given slot.
     */
    public int getBookedCount(int stationId, String chargingType, java.sql.Date bookingDate, String timeSlot) {
        String sql = "SELECT COUNT(*) FROM slot_bookings " +
                     "WHERE station_id = ? AND charging_type = ? AND booking_date = ? AND time_slot = ? " +
                     "AND status IN ('PENDING', 'BOOKED')";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, stationId);
            stmt.setString(2, chargingType.toUpperCase());
            stmt.setDate(3, bookingDate);
            stmt.setString(4, timeSlot);
            rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return 0;
    }

    /**
     * Returns slot availability list for a given date and charging type to power the dynamic interactive grid.
     */
    public List<Map<String, Object>> getSlotStatusList(int stationId, String chargingType, java.sql.Date bookingDate) {
        List<Map<String, Object>> result = new ArrayList<>();
        StationChargingType typeConfig = chargingTypeDAO.findByStationAndType(stationId, chargingType);
        int totalCap = (typeConfig != null) ? typeConfig.getTotalCapacity() : 0;

        for (String slot : STANDARD_TIME_SLOTS) {
            int booked = getBookedCount(stationId, chargingType, bookingDate, slot);
            int available = Math.max(0, totalCap - booked);

            Map<String, Object> map = new HashMap<>();
            map.put("slot", slot);
            map.put("totalCapacity", totalCap);
            map.put("booked", booked);
            map.put("available", available);
            map.put("isFull", available <= 0);
            result.add(map);
        }
        return result;
    }

    /**
     * Creates a new booking with automatic availability verification.
     */
    public synchronized boolean createBooking(SlotBooking b) {
        // Double check availability inside synchronized block to prevent race conditions / overbooking
        if (!isSlotAvailable(b.getStationId(), b.getChargingType(), b.getBookingDate(), b.getTimeSlot())) {
            return false;
        }

        String sql = "INSERT INTO slot_bookings " +
                     "(booking_number, user_id, station_id, charging_type, booking_date, time_slot, " +
                     "vehicle_number, vehicle_model, amount, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, b.getBookingNumber());
            stmt.setInt(2, b.getUserId());
            stmt.setInt(3, b.getStationId());
            stmt.setString(4, b.getChargingType().toUpperCase());
            stmt.setDate(5, b.getBookingDate());
            stmt.setString(6, b.getTimeSlot());
            stmt.setString(7, b.getVehicleNumber());
            stmt.setString(8, b.getVehicleModel());
            stmt.setBigDecimal(9, b.getAmount());
            stmt.setString(10, b.getStatus() != null ? b.getStatus() : "PENDING");

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        b.setId(rs.getInt(1));
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

    public SlotBooking findById(int id) {
        String sql = "SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, " +
                     "p.payment_status, p.payment_method, p.transaction_id, i.invoice_number " +
                     "FROM slot_bookings b " +
                     "JOIN users u ON b.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "LEFT JOIN payments p ON b.id = p.booking_id " +
                     "LEFT JOIN invoices i ON b.id = i.booking_id " +
                     "WHERE b.id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
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

    public SlotBooking findByBookingNumber(String bookingNumber) {
        String sql = "SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, " +
                     "p.payment_status, p.payment_method, p.transaction_id, i.invoice_number " +
                     "FROM slot_bookings b " +
                     "JOIN users u ON b.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "LEFT JOIN payments p ON b.id = p.booking_id " +
                     "LEFT JOIN invoices i ON b.id = i.booking_id " +
                     "WHERE b.booking_number = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, bookingNumber);
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

    public List<SlotBooking> findByUserId(int userId) {
        List<SlotBooking> list = new ArrayList<>();
        String sql = "SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, " +
                     "p.payment_status, p.payment_method, p.transaction_id, i.invoice_number " +
                     "FROM slot_bookings b " +
                     "JOIN users u ON b.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "LEFT JOIN payments p ON b.id = p.booking_id " +
                     "LEFT JOIN invoices i ON b.id = i.booking_id " +
                     "WHERE b.user_id = ? " +
                     "ORDER BY b.booking_date DESC, b.time_slot DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
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

    public List<SlotBooking> findByOperatorId(int operatorId) {
        List<SlotBooking> list = new ArrayList<>();
        String sql = "SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, " +
                     "p.payment_status, p.payment_method, p.transaction_id, i.invoice_number " +
                     "FROM slot_bookings b " +
                     "JOIN users u ON b.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "LEFT JOIN payments p ON b.id = p.booking_id " +
                     "LEFT JOIN invoices i ON b.id = i.booking_id " +
                     "WHERE s.operator_id = ? " +
                     "ORDER BY b.id DESC";
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

    public List<SlotBooking> findAll() {
        List<SlotBooking> list = new ArrayList<>();
        String sql = "SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, " +
                     "p.payment_status, p.payment_method, p.transaction_id, i.invoice_number " +
                     "FROM slot_bookings b " +
                     "JOIN users u ON b.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "LEFT JOIN payments p ON b.id = p.booking_id " +
                     "LEFT JOIN invoices i ON b.id = i.booking_id " +
                     "ORDER BY b.id DESC";
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

    public boolean updateStatus(int bookingId, String status) {
        String sql = "UPDATE slot_bookings SET status = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, status.toUpperCase());
            stmt.setInt(2, bookingId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    public boolean cancelBooking(int bookingId, int userId) {
        String sql = "UPDATE slot_bookings SET status = 'CANCELLED' WHERE id = ? AND (user_id = ? OR ? = 0)";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, bookingId);
            stmt.setInt(2, userId);
            stmt.setInt(3, userId); // allows admin cancellation when userId=0
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt);
        }
        return false;
    }

    private SlotBooking mapResultSet(ResultSet rs) throws SQLException {
        SlotBooking b = new SlotBooking();
        b.setId(rs.getInt("id"));
        b.setBookingNumber(rs.getString("booking_number"));
        b.setUserId(rs.getInt("user_id"));
        b.setUserName(rs.getString("user_name"));
        b.setUserEmail(rs.getString("user_email"));
        b.setUserPhone(rs.getString("user_phone"));
        b.setStationId(rs.getInt("station_id"));
        b.setStationName(rs.getString("station_name"));
        b.setStationAddress(rs.getString("station_address"));
        b.setStationCity(rs.getString("station_city"));
        b.setChargingType(rs.getString("charging_type"));
        b.setBookingDate(rs.getDate("booking_date"));
        b.setTimeSlot(rs.getString("time_slot"));
        b.setVehicleNumber(rs.getString("vehicle_number"));
        b.setVehicleModel(rs.getString("vehicle_model"));
        b.setAmount(rs.getBigDecimal("amount"));
        b.setStatus(rs.getString("status"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        b.setPaymentStatus(rs.getString("payment_status"));
        b.setPaymentMethod(rs.getString("payment_method"));
        b.setTransactionId(rs.getString("transaction_id"));
        b.setInvoiceNumber(rs.getString("invoice_number"));
        return b;
    }
}

