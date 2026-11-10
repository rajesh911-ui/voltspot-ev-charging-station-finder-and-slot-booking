package com.voltspot.util;

/**
 * Geographical utility for calculating distance between coordinates using the Haversine formula.
 */
public class GeoUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates great-circle distance between two GPS coordinates in kilometers.
     *
     * @param lat1 Latitude of point 1
     * @param lon1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lon2 Longitude of point 2
     * @return Distance in kilometers rounded to 1 decimal place
     */
    public static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        double distance = EARTH_RADIUS_KM * c;

        return Math.round(distance * 10.0) / 10.0;
    }
}

