package com.voltspot.model;

import java.math.BigDecimal;

public class StationChargingType {
    private int id;
    private int stationId;
    private String chargingType; // 'FAST', 'NORMAL'
    private int totalCapacity; // e.g. 4 slots
    private BigDecimal powerKw; // e.g. 50.00 kW
    private BigDecimal pricePerSlot; // e.g. 18.00 USD/INR

    public StationChargingType() {}

    public StationChargingType(int id, int stationId, String chargingType, int totalCapacity, BigDecimal powerKw, BigDecimal pricePerSlot) {
        this.id = id;
        this.stationId = stationId;
        this.chargingType = chargingType;
        this.totalCapacity = totalCapacity;
        this.powerKw = powerKw;
        this.pricePerSlot = pricePerSlot;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStationId() { return stationId; }
    public void setStationId(int stationId) { this.stationId = stationId; }

    public String getChargingType() { return chargingType; }
    public void setChargingType(String chargingType) { this.chargingType = chargingType; }

    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }

    public BigDecimal getPowerKw() { return powerKw; }
    public void setPowerKw(BigDecimal powerKw) { this.powerKw = powerKw; }

    public BigDecimal getPricePerSlot() { return pricePerSlot; }
    public void setPricePerSlot(BigDecimal pricePerSlot) { this.pricePerSlot = pricePerSlot; }
}

