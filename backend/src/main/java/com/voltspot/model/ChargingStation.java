package com.voltspot.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class ChargingStation {
    private int id;
    private int operatorId;
    private String operatorName;
    private String name;
    private String address;
    private String city;
    private String contactNumber;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String openingTime;
    private String closingTime;
    private String status; // 'PENDING', 'APPROVED', 'REJECTED'
    private String rejectionReason;
    private Timestamp createdAt;

    // Derived / UI fields
    private double averageRating;
    private int reviewCount;
    private Double distanceKm; // Populated when searching nearby
    private List<StationChargingType> chargingTypes = new ArrayList<>();

    public ChargingStation() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getOperatorId() { return operatorId; }
    public void setOperatorId(int operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getOpeningTime() { return openingTime; }
    public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }

    public String getClosingTime() { return closingTime; }
    public void setClosingTime(String closingTime) { this.closingTime = closingTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public List<StationChargingType> getChargingTypes() { return chargingTypes; }
    public void setChargingTypes(List<StationChargingType> chargingTypes) { this.chargingTypes = chargingTypes; }

    public StationChargingType getFastCharging() {
        for (StationChargingType type : chargingTypes) {
            if ("FAST".equalsIgnoreCase(type.getChargingType())) return type;
        }
        return null;
    }

    public StationChargingType getNormalCharging() {
        for (StationChargingType type : chargingTypes) {
            if ("NORMAL".equalsIgnoreCase(type.getChargingType())) return type;
        }
        return null;
    }
}

