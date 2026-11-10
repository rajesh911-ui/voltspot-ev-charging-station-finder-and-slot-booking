package com.voltspot.model;

import java.sql.Timestamp;

public class Feedback {
    private int id;
    private int stationId;
    private String stationName;
    private int userId;
    private String userName;
    private Integer bookingId;
    private int rating; // 1 to 5
    private String comments;
    private Timestamp createdAt;

    public Feedback() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStationId() { return stationId; }
    public void setStationId(int stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}

