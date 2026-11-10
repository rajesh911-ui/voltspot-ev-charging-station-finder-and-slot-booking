export type UserRole = 'DRIVER' | 'OPERATOR' | 'ADMIN';

export type ConnectorType = 'CCS2' | 'TYPE2' | 'CHADEMO' | 'GBT';

export type PortStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

export type BookingStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isApprovedOperator?: boolean;
  createdAt?: string;
}

export interface Vehicle {
  id: number;
  userId: number;
  model: string;
  make: string;
  batteryCapacityKwh: number;
  connectorType: ConnectorType;
  licensePlate: string;
  currentSocPercent?: number;
}

export interface ChargingPort {
  id: number;
  stationId: number;
  portNumber: string;
  connectorType: ConnectorType;
  powerOutputKw: number; // e.g. 22 (AC), 50, 150, 350 (DC Fast)
  pricePerKwh: number; // in USD or local currency
  status: PortStatus;
}

export interface ChargingStation {
  id: number;
  operatorId: number;
  operatorName?: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openingTime: string; // HH:mm format, e.g. "06:00"
  closingTime: string; // HH:mm format, e.g. "23:00"
  isVerified: boolean;
  amenities: string[]; // e.g. ["WiFi", "Cafe", "Restroom", "24/7"]
  imageUrl?: string;
  rating?: number;
  distanceKm?: number; // Calculated dynamically via Haversine formula
  ports?: ChargingPort[];
}

export interface SlotBooking {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  portId: number;
  stationId: number;
  stationName?: string;
  stationAddress?: string;
  connectorType?: ConnectorType;
  powerOutputKw?: number;
  vehicleModel?: string;
  startTime: string; // ISO String, e.g. "2026-10-30T10:00:00"
  endTime: string;   // ISO String, e.g. "2026-10-30T11:00:00"
  durationHours: number;
  energyKwh: number;
  estimatedCost: number;
  bookingStatus: BookingStatus;
  createdAt: string;
  cancellationReason?: string;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  connectorType?: ConnectorType | 'ALL';
  minPowerKw?: number;
  onlyAvailable?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalOperators: number;
  totalStations: number;
  verifiedStations: number;
  pendingStations: number;
  totalPorts: number;
  availablePorts: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalKwhDelivered: number;
}
