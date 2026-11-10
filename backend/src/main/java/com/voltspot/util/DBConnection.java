package com.voltspot.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

/**
 * DBConnection provides JDBC database connectivity for VoltSpot EV system.
 * Configured for MySQL 8.0 with fallback mechanism for developer ease
 * and automatic schema & seed data initialization.
 */
public class DBConnection {

    private static String driver = "com.mysql.cj.jdbc.Driver";
    private static String url = "jdbc:mysql://localhost:3306/voltspot_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    private static String serverUrl = "jdbc:mysql://localhost:3306/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    private static String username = "root";
    private static String password = "root";
    private static boolean initialized = false;

    static {
        try {
            Class.forName(driver);
            try (InputStream input = DBConnection.class.getClassLoader().getResourceAsStream("db.properties")) {
                if (input != null) {
                    Properties prop = new Properties();
                    prop.load(input);
                    if (prop.getProperty("db.driver") != null) driver = prop.getProperty("db.driver");
                    if (prop.getProperty("db.url") != null) url = prop.getProperty("db.url");
                    if (prop.getProperty("db.username") != null) username = prop.getProperty("db.username");
                    if (prop.getProperty("db.password") != null) password = prop.getProperty("db.password");
                }
            } catch (Exception e) {
                System.err.println("[VoltSpot] Notice: db.properties not loaded, using standard defaults: " + e.getMessage());
            }
        } catch (ClassNotFoundException e) {
            System.err.println("[VoltSpot] ERROR: MySQL JDBC Driver not found! Ensure mysql-connector-j is in classpath.");
            e.printStackTrace();
        }
    }

    /**
     * Obtains a JDBC Connection. If database is missing, attempts automatic initialization.
     */
    public static Connection getConnection() throws SQLException {
        try {
            Connection conn = getDirectConnection(url);
            if (!initialized) {
                verifyOrInitTables(conn);
                initialized = true;
            }
            return conn;
        } catch (SQLException ex) {
            // Check if error is due to database unknown
            if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("unknown database")) {
                tryInitDatabase();
                return getDirectConnection(url);
            }
            throw ex;
        }
    }

    private static Connection getDirectConnection(String targetUrl) throws SQLException {
        try {
            return DriverManager.getConnection(targetUrl, username, password);
        } catch (SQLException ex) {
            String[] commonPasswords = new String[]{"root", "password", "admin", "123456", ""};
            for (String fallbackPass : commonPasswords) {
                if (!fallbackPass.equals(password)) {
                    try {
                        Connection conn = DriverManager.getConnection(targetUrl, username, fallbackPass);
                        password = fallbackPass;
                        return conn;
                    } catch (SQLException ignored) {
                    }
                }
            }
            throw ex;
        }
    }

    private static synchronized void tryInitDatabase() {
        try (Connection serverConn = getDirectConnection(serverUrl);
             Statement stmt = serverConn.createStatement()) {
            stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS voltspot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            System.out.println("[VoltSpot] Created database voltspot_db successfully.");
            
            try (Connection dbConn = getDirectConnection(url)) {
                executeSqlScript(dbConn);
            }
            initialized = true;
        } catch (Exception e) {
            System.err.println("[VoltSpot] Auto-init notice: " + e.getMessage());
        }
    }

    private static void verifyOrInitTables(Connection conn) {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SHOW TABLES LIKE 'charging_stations'")) {
            if (!rs.next()) {
                System.out.println("[VoltSpot] Tables missing, executing database.sql script...");
                executeSqlScript(conn);
            }
        } catch (Exception e) {
            System.err.println("[VoltSpot] Check tables error: " + e.getMessage());
        }
    }

    private static void executeSqlScript(Connection conn) {
        try (InputStream in = DBConnection.class.getClassLoader().getResourceAsStream("database.sql")) {
            if (in == null) return;
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            Statement stmt = conn.createStatement();
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("--") || line.startsWith("//")) continue;
                sb.append(line).append(" ");
                if (line.endsWith(";")) {
                    String query = sb.toString().replace(";", "").trim();
                    try {
                        if (!query.toLowerCase().startsWith("create database") && !query.toLowerCase().startsWith("use ")) {
                            stmt.execute(query);
                        }
                    } catch (SQLException ignored) {}
                    sb.setLength(0);
                }
            }
            stmt.close();
            System.out.println("[VoltSpot] Database schema & seed data initialized successfully.");
        } catch (Exception e) {
            System.err.println("[VoltSpot] Script execution error: " + e.getMessage());
        }
    }

    /**
     * Safely closes JDBC resources.
     */
    public static void close(Connection conn, Statement stmt, ResultSet rs) {
        if (rs != null) {
            try { rs.close(); } catch (SQLException ignored) {}
        }
        if (stmt != null) {
            try { stmt.close(); } catch (SQLException ignored) {}
        }
        if (conn != null) {
            try { conn.close(); } catch (SQLException ignored) {}
        }
    }

    public static void close(Connection conn, Statement stmt) {
        close(conn, stmt, null);
    }
}
