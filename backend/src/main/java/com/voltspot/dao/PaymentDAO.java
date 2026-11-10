package com.voltspot.dao;

import com.voltspot.model.Payment;
import com.voltspot.util.DBConnection;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PaymentDAO {

    /**
     * Executes payment processing, updates booking status to 'BOOKED',
     * and auto-generates invoice in an atomic database transaction.
     */
    public boolean processPayment(Payment payment) {
        String paymentSql = "INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, payment_status) "
                +
                "VALUES (?, ?, ?, ?, ?, ?)";
        String updateBookingSql = "UPDATE slot_bookings SET status = 'BOOKED' WHERE id = ?";
        String invoiceSql = "INSERT INTO invoices (invoice_number, booking_id, payment_id, user_id, base_amount, tax_amount, total_amount) "
                +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement pStmt = null;
        PreparedStatement bStmt = null;
        PreparedStatement iStmt = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Begin transaction

            // 1. Insert payment record
            pStmt = conn.prepareStatement(paymentSql, Statement.RETURN_GENERATED_KEYS);
            pStmt.setInt(1, payment.getBookingId());
            pStmt.setInt(2, payment.getUserId());
            pStmt.setBigDecimal(3, payment.getAmount());
            pStmt.setString(4, payment.getPaymentMethod().toUpperCase());
            pStmt.setString(5, payment.getTransactionId());
            pStmt.setString(6, payment.getPaymentStatus() != null ? payment.getPaymentStatus() : "PAID");

            int pRows = pStmt.executeUpdate();
            if (pRows == 0) {
                conn.rollback();
                return false;
            }

            int paymentId = 0;
            try (ResultSet rs = pStmt.getGeneratedKeys()) {
                if (rs.next()) {
                    paymentId = rs.getInt(1);
                    payment.setId(paymentId);
                }
            }

            // 2. Update booking status to 'BOOKED'
            bStmt = conn.prepareStatement(updateBookingSql);
            bStmt.setInt(1, payment.getBookingId());
            bStmt.executeUpdate();

            // 3. Compute Tax and Base Amount (18% GST/Tax)
            BigDecimal total = payment.getAmount();
            // base = total / 1.18
            BigDecimal base = total.divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
            BigDecimal tax = total.subtract(base);

            String invoiceNumber = "INV-" + (System.currentTimeMillis() % 10000000);

            // 4. Insert Invoice
            iStmt = conn.prepareStatement(invoiceSql);
            iStmt.setString(1, invoiceNumber);
            iStmt.setInt(2, payment.getBookingId());
            iStmt.setInt(3, paymentId);
            iStmt.setInt(4, payment.getUserId());
            iStmt.setBigDecimal(5, base);
            iStmt.setBigDecimal(6, tax);
            iStmt.setBigDecimal(7, total);
            iStmt.executeUpdate();

            conn.commit(); // Commit transaction
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ignored) {
                }
            }
            e.printStackTrace();
        } finally {
            if (pStmt != null)
                try {
                    pStmt.close();
                } catch (SQLException ignored) {
                }
            if (bStmt != null)
                try {
                    bStmt.close();
                } catch (SQLException ignored) {
                }
            if (iStmt != null)
                try {
                    iStmt.close();
                } catch (SQLException ignored) {
                }
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ignored) {
                }
            }
        }
        return false;
    }

    public Payment findByBookingId(int bookingId) {
        String sql = "SELECT p.*, b.booking_number, u.name as user_name FROM payments p " +
                "JOIN slot_bookings b ON p.booking_id = b.id " +
                "JOIN users u ON p.user_id = u.id " +
                "WHERE p.booking_id = ?";
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

    public List<Payment> findAll() {
        List<Payment> list = new ArrayList<>();
        String sql = "SELECT p.*, b.booking_number, u.name as user_name FROM payments p " +
                "JOIN slot_bookings b ON p.booking_id = b.id " +
                "JOIN users u ON p.user_id = u.id " +
                "ORDER BY p.payment_date DESC";
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

    public BigDecimal getTotalRevenue() {
        String sql = "SELECT SUM(amount) FROM payments WHERE payment_status = 'PAID'";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            if (rs.next() && rs.getBigDecimal(1) != null) {
                return rs.getBigDecimal(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBConnection.close(conn, stmt, rs);
        }
        return BigDecimal.ZERO;
    }

    private Payment mapResultSet(ResultSet rs) throws SQLException {
        Payment p = new Payment();
        p.setId(rs.getInt("id"));
        p.setBookingId(rs.getInt("booking_id"));
        p.setUserId(rs.getInt("user_id"));
        p.setAmount(rs.getBigDecimal("amount"));
        p.setPaymentMethod(rs.getString("payment_method"));
        p.setTransactionId(rs.getString("transaction_id"));
        p.setPaymentStatus(rs.getString("payment_status"));
        p.setPaymentDate(rs.getTimestamp("payment_date"));
        try {
            p.setBookingNumber(rs.getString("booking_number"));
            p.setUserName(rs.getString("user_name"));
        } catch (SQLException ignored) {
        }
        return p;
    }
}
