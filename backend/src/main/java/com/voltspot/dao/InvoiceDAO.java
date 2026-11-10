package com.voltspot.dao;

import com.voltspot.model.Invoice;
import com.voltspot.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class InvoiceDAO {

    public Invoice findByBookingId(int bookingId) {
        String sql = "SELECT i.*, b.booking_number, b.charging_type, b.booking_date, b.time_slot, " +
                     "b.vehicle_number, b.vehicle_model, p.payment_method, p.transaction_id, " +
                     "u.name as customer_name, u.email as customer_email, u.phone as customer_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, s.contact_number as station_contact " +
                     "FROM invoices i " +
                     "JOIN slot_bookings b ON i.booking_id = b.id " +
                     "JOIN payments p ON i.payment_id = p.id " +
                     "JOIN users u ON i.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "WHERE i.booking_id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, bookingId);
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

    public Invoice findByInvoiceNumber(String invoiceNumber) {
        String sql = "SELECT i.*, b.booking_number, b.charging_type, b.booking_date, b.time_slot, " +
                     "b.vehicle_number, b.vehicle_model, p.payment_method, p.transaction_id, " +
                     "u.name as customer_name, u.email as customer_email, u.phone as customer_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, s.contact_number as station_contact " +
                     "FROM invoices i " +
                     "JOIN slot_bookings b ON i.booking_id = b.id " +
                     "JOIN payments p ON i.payment_id = p.id " +
                     "JOIN users u ON i.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "WHERE i.invoice_number = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, invoiceNumber);
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

    public List<Invoice> findByUserId(int userId) {
        List<Invoice> list = new ArrayList<>();
        String sql = "SELECT i.*, b.booking_number, b.charging_type, b.booking_date, b.time_slot, " +
                     "b.vehicle_number, b.vehicle_model, p.payment_method, p.transaction_id, " +
                     "u.name as customer_name, u.email as customer_email, u.phone as customer_phone, " +
                     "s.name as station_name, s.address as station_address, s.city as station_city, s.contact_number as station_contact " +
                     "FROM invoices i " +
                     "JOIN slot_bookings b ON i.booking_id = b.id " +
                     "JOIN payments p ON i.payment_id = p.id " +
                     "JOIN users u ON i.user_id = u.id " +
                     "JOIN charging_stations s ON b.station_id = s.id " +
                     "WHERE i.user_id = ? " +
                     "ORDER BY i.invoice_date DESC";
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

    private Invoice mapResultSet(ResultSet rs) throws SQLException {
        Invoice inv = new Invoice();
        inv.setId(rs.getInt("id"));
        inv.setInvoiceNumber(rs.getString("invoice_number"));
        inv.setBookingId(rs.getInt("booking_id"));
        inv.setPaymentId(rs.getInt("payment_id"));
        inv.setUserId(rs.getInt("user_id"));
        inv.setBaseAmount(rs.getBigDecimal("base_amount"));
        inv.setTaxAmount(rs.getBigDecimal("tax_amount"));
        inv.setTotalAmount(rs.getBigDecimal("total_amount"));
        inv.setInvoiceDate(rs.getTimestamp("invoice_date"));
        inv.setBookingNumber(rs.getString("booking_number"));
        inv.setTransactionId(rs.getString("transaction_id"));
        inv.setPaymentMethod(rs.getString("payment_method"));
        inv.setCustomerName(rs.getString("customer_name"));
        inv.setCustomerEmail(rs.getString("customer_email"));
        inv.setCustomerPhone(rs.getString("customer_phone"));
        inv.setStationName(rs.getString("station_name"));
        inv.setStationAddress(rs.getString("station_address"));
        inv.setStationCity(rs.getString("station_city"));
        inv.setStationContact(rs.getString("station_contact"));
        inv.setChargingType(rs.getString("charging_type"));
        inv.setBookingDate(rs.getDate("booking_date"));
        inv.setTimeSlot(rs.getString("time_slot"));
        inv.setVehicleNumber(rs.getString("vehicle_number"));
        inv.setVehicleModel(rs.getString("vehicle_model"));
        return inv;
    }
}

