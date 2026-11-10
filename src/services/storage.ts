import {
  User,
  Vehicle,
  ChargingStation,
  ChargingPort,
  SlotBooking,
  NearbySearchParams,
  AdminStats
} from '../types';

const STORAGE_KEYS = {
  USERS: 'voltspot_users',
  VEHICLES: 'voltspot_vehicles',
  STATIONS: 'voltspot_stations',
  PORTS: 'voltspot_ports',
  BOOKINGS: 'voltspot_bookings',
  CURRENT_USER: 'voltspot_current_user',
  THEME: 'voltspot_theme',
};

// Initial Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'driver@voltspot.io',
    phone: '+1 (555) 234-5678',
    role: 'DRIVER',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 2,
    name: 'Marcus Vance (VoltGrid Energy)',
    email: 'operator@voltspot.io',
    phone: '+1 (555) 876-5432',
    role: 'OPERATOR',
    isApprovedOperator: true,
    createdAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 3,
    name: 'Sarah Chen (Platform Admin)',
    email: 'admin@voltspot.io',
    phone: '+1 (555) 999-0000',
    role: 'ADMIN',
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'Elena Rostova (GreenCharge Networks)',
    email: 'elena@greencharge.com',
    phone: '+1 (555) 345-6789',
    role: 'OPERATOR',
    isApprovedOperator: false, // Pending verification in Admin console
    createdAt: '2026-03-20T14:15:00Z',
  },
];

// Initial Seed Vehicles
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 1,
    userId: 1, // Alex Rivera
    make: 'Hyundai',
    model: 'Ioniq 5 AWD',
    batteryCapacityKwh: 77.4,
    connectorType: 'CCS2',
    licensePlate: 'EV-892-CA',
    currentSocPercent: 32,
  },
  {
    id: 2,
    userId: 1,
    make: 'Tesla',
    model: 'Model Y Long Range',
    batteryCapacityKwh: 75.0,
    connectorType: 'CCS2',
    licensePlate: 'VOLT-770',
    currentSocPercent: 18,
  },
];

// Initial Seed Stations
const INITIAL_STATIONS: ChargingStation[] = [
  {
    id: 1,
    operatorId: 2,
    operatorName: 'VoltGrid Energy',
    name: 'VoltSpot UltraHub - Downtown Financial District',
    address: '450 Mission St, San Francisco, CA 94105',
    city: 'San Francisco',
    latitude: 37.7905,
    longitude: -122.3995,
    openingTime: '00:00',
    closingTime: '23:59',
    isVerified: true,
    amenities: ['24/7 Access', 'Restrooms', 'High-Speed WiFi', 'Coffee Lounge', 'Covered Canopy'],
    imageUrl: '/src/assets/images/ev_charging_station_hero_1793370397856.jpg',
    rating: 4.9,
  },
  {
    id: 2,
    operatorId: 2,
    operatorName: 'VoltGrid Energy',
    name: 'GreenMotion Plaza Charging Hub',
    address: '888 Brannan St, San Francisco, CA 94103',
    city: 'San Francisco',
    latitude: 37.7712,
    longitude: -122.4048,
    openingTime: '06:00',
    closingTime: '23:00',
    isVerified: true,
    amenities: ['Restrooms', 'Shopping Center', 'WiFi', 'Wheelchair Accessible'],
    imageUrl: '/src/assets/images/ev_station_urban_hub_1793370398688.jpg',
    rating: 4.8,
  },
  {
    id: 3,
    operatorId: 2,
    operatorName: 'VoltGrid Energy',
    name: 'Presidio EcoCharge Gateway',
    address: '103 Montgomery St, San Francisco, CA 94129',
    city: 'San Francisco',
    latitude: 37.7989,
    longitude: -122.4556,
    openingTime: '07:00',
    closingTime: '21:00',
    isVerified: true,
    amenities: ['Park View', 'Restrooms', 'Bicycle Racks', 'Solar Powered'],
    rating: 4.7,
  },
  {
    id: 4,
    operatorId: 2,
    operatorName: 'VoltGrid Energy',
    name: 'Embarcadero Waterfront SuperChargers',
    address: 'Pier 14, The Embarcadero, San Francisco, CA 94105',
    city: 'San Francisco',
    latitude: 37.7937,
    longitude: -122.3905,
    openingTime: '06:00',
    closingTime: '23:59',
    isVerified: true,
    amenities: ['Waterfront Promenade', 'Dining', '24/7 Access'],
    rating: 4.9,
  },
  {
    id: 5,
    operatorId: 4, // Elena Rostova (pending verification)
    operatorName: 'GreenCharge Networks',
    name: 'Sunset District FastCharge Express',
    address: '1900 Irving St, San Francisco, CA 94122',
    city: 'San Francisco',
    latitude: 37.7634,
    longitude: -122.4789,
    openingTime: '06:00',
    closingTime: '22:00',
    isVerified: false, // Requires Admin verification to appear for Drivers
    amenities: ['Supermarket Adjacent', 'Restroom', 'ATM'],
    rating: 4.5,
  },
];

// Initial Seed Ports
const INITIAL_PORTS: ChargingPort[] = [
  // Station 1: Downtown Financial District (UltraHub)
  {
    id: 1,
    stationId: 1,
    portNumber: 'Port A1',
    connectorType: 'CCS2',
    powerOutputKw: 350,
    pricePerKwh: 0.42,
    status: 'AVAILABLE',
  },
  {
    id: 2,
    stationId: 1,
    portNumber: 'Port A2',
    connectorType: 'CCS2',
    powerOutputKw: 150,
    pricePerKwh: 0.38,
    status: 'AVAILABLE',
  },
  {
    id: 3,
    stationId: 1,
    portNumber: 'Port B1',
    connectorType: 'CHADEMO',
    powerOutputKw: 50,
    pricePerKwh: 0.32,
    status: 'AVAILABLE',
  },
  {
    id: 4,
    stationId: 1,
    portNumber: 'Port B2',
    connectorType: 'TYPE2',
    powerOutputKw: 22,
    pricePerKwh: 0.25,
    status: 'AVAILABLE',
  },

  // Station 2: GreenMotion Plaza
  {
    id: 5,
    stationId: 2,
    portNumber: 'Dispenser 1',
    connectorType: 'CCS2',
    powerOutputKw: 150,
    pricePerKwh: 0.36,
    status: 'AVAILABLE',
  },
  {
    id: 6,
    stationId: 2,
    portNumber: 'Dispenser 2',
    connectorType: 'CCS2',
    powerOutputKw: 150,
    pricePerKwh: 0.36,
    status: 'IN_USE',
  },
  {
    id: 7,
    stationId: 2,
    portNumber: 'Dispenser 3',
    connectorType: 'TYPE2',
    powerOutputKw: 22,
    pricePerKwh: 0.24,
    status: 'AVAILABLE',
  },

  // Station 3: Presidio EcoCharge Gateway
  {
    id: 8,
    stationId: 3,
    portNumber: 'Solar Stall 1',
    connectorType: 'CCS2',
    powerOutputKw: 100,
    pricePerKwh: 0.34,
    status: 'AVAILABLE',
  },
  {
    id: 9,
    stationId: 3,
    portNumber: 'Solar Stall 2',
    connectorType: 'TYPE2',
    powerOutputKw: 22,
    pricePerKwh: 0.22,
    status: 'MAINTENANCE',
  },

  // Station 4: Embarcadero Waterfront
  {
    id: 10,
    stationId: 4,
    portNumber: 'Pier Pod 1',
    connectorType: 'CCS2',
    powerOutputKw: 200,
    pricePerKwh: 0.45,
    status: 'AVAILABLE',
  },
  {
    id: 11,
    stationId: 4,
    portNumber: 'Pier Pod 2',
    connectorType: 'CHADEMO',
    powerOutputKw: 50,
    pricePerKwh: 0.35,
    status: 'AVAILABLE',
  },

  // Station 5: Sunset District (Pending verification)
  {
    id: 12,
    stationId: 5,
    portNumber: 'Bay 1',
    connectorType: 'CCS2',
    powerOutputKw: 120,
    pricePerKwh: 0.33,
    status: 'AVAILABLE',
  },
];

// Initial Seed Bookings
const INITIAL_BOOKINGS: SlotBooking[] = [
  {
    id: 1,
    userId: 1,
    userName: 'Alex Rivera',
    userEmail: 'driver@voltspot.io',
    userPhone: '+1 (555) 234-5678',
    portId: 6,
    stationId: 2,
    stationName: 'GreenMotion Plaza Charging Hub',
    stationAddress: '888 Brannan St, San Francisco, CA 94103',
    connectorType: 'CCS2',
    powerOutputKw: 150,
    vehicleModel: 'Hyundai Ioniq 5 AWD',
    startTime: new Date(Date.now() - 30 * 60000).toISOString(),
    endTime: new Date(Date.now() + 30 * 60000).toISOString(),
    durationHours: 1.0,
    energyKwh: 55.0,
    estimatedCost: 19.80,
    bookingStatus: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    userName: 'Alex Rivera',
    userEmail: 'driver@voltspot.io',
    userPhone: '+1 (555) 234-5678',
    portId: 1,
    stationId: 1,
    stationName: 'VoltSpot UltraHub - Downtown Financial District',
    stationAddress: '450 Mission St, San Francisco, CA 94105',
    connectorType: 'CCS2',
    powerOutputKw: 350,
    vehicleModel: 'Tesla Model Y Long Range',
    startTime: new Date(Date.now() + 2 * 3600000).toISOString(),
    endTime: new Date(Date.now() + 2.75 * 3600000).toISOString(),
    durationHours: 0.75,
    energyKwh: 45.0,
    estimatedCost: 18.90,
    bookingStatus: 'CONFIRMED',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

// Haversine distance calculator in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Storage Helpers
class StorageManager {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // Initialize defaults if empty
  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      this.set(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STATIONS)) {
      this.set(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PORTS)) {
      this.set(STORAGE_KEYS.PORTS, INITIAL_PORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      this.set(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    }
  }

  // Users
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(id: number): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      createdAt: new Date().toISOString(),
      isApprovedOperator: user.role === 'OPERATOR' ? false : undefined,
    };
    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  public updateUser(user: User): User {
    const users = this.getUsers().map((u) => (u.id === user.id ? user : u));
    this.set(STORAGE_KEYS.USERS, users);
    return user;
  }

  // Vehicles
  public getVehiclesByUserId(userId: number): Vehicle[] {
    return this.get<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES).filter(
      (v) => v.userId === userId
    );
  }

  public addVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
    const vehicles = this.get<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Math.max(0, ...vehicles.map((v) => v.id)) + 1,
    };
    vehicles.push(newVehicle);
    this.set(STORAGE_KEYS.VEHICLES, vehicles);
    return newVehicle;
  }

  public deleteVehicle(id: number): void {
    const vehicles = this.get<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES).filter(
      (v) => v.id !== id
    );
    this.set(STORAGE_KEYS.VEHICLES, vehicles);
  }

  // Stations
  public getStations(): ChargingStation[] {
    const stations = this.get<ChargingStation[]>(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    const ports = this.getPorts();
    return stations.map((s) => ({
      ...s,
      ports: ports.filter((p) => p.stationId === s.id),
    }));
  }

  public getStationById(id: number): ChargingStation | undefined {
    return this.getStations().find((s) => s.id === id);
  }

  public createStation(station: Omit<ChargingStation, 'id' | 'ports'>): ChargingStation {
    const stations = this.get<ChargingStation[]>(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    const newStation: ChargingStation = {
      ...station,
      id: Math.max(0, ...stations.map((s) => s.id)) + 1,
      isVerified: false, // New stations require admin approval
    };
    stations.push(newStation);
    this.set(STORAGE_KEYS.STATIONS, stations);
    return newStation;
  }

  public updateStation(station: ChargingStation): ChargingStation {
    const stations = this.get<ChargingStation[]>(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    const updated = stations.map((s) => (s.id === station.id ? { ...s, ...station } : s));
    this.set(STORAGE_KEYS.STATIONS, updated);
    return station;
  }

  public verifyStation(id: number, verified: boolean): ChargingStation | undefined {
    const stations = this.get<ChargingStation[]>(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    const target = stations.find((s) => s.id === id);
    if (target) {
      target.isVerified = verified;
      this.set(STORAGE_KEYS.STATIONS, stations);
    }
    return target;
  }

  // Ports
  public getPorts(): ChargingPort[] {
    return this.get<ChargingPort[]>(STORAGE_KEYS.PORTS, INITIAL_PORTS);
  }

  public getPortsByStationId(stationId: number): ChargingPort[] {
    return this.getPorts().filter((p) => p.stationId === stationId);
  }

  public createPort(port: Omit<ChargingPort, 'id'>): ChargingPort {
    const ports = this.getPorts();
    const newPort: ChargingPort = {
      ...port,
      id: Math.max(0, ...ports.map((p) => p.id)) + 1,
    };
    ports.push(newPort);
    this.set(STORAGE_KEYS.PORTS, ports);
    return newPort;
  }

  public updatePort(port: ChargingPort): ChargingPort {
    const ports = this.getPorts().map((p) => (p.id === port.id ? port : p));
    this.set(STORAGE_KEYS.PORTS, ports);
    return port;
  }

  public deletePort(portId: number): void {
    const ports = this.getPorts().filter((p) => p.id !== portId);
    this.set(STORAGE_KEYS.PORTS, ports);
  }

  // Double-booking check & Overlap detection logic
  // Mathematical logic: two intervals [startA, endA) and [startB, endB) overlap if:
  // startA < endB && endA > startB
  public hasOverlappingBooking(
    portId: number,
    startTime: string,
    endTime: string,
    excludeBookingId?: number
  ): boolean {
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    const bookings = this.getBookings();
    return bookings.some((b) => {
      if (b.portId !== portId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.bookingStatus === 'CANCELLED') return false;

      const existingStart = new Date(b.startTime).getTime();
      const existingEnd = new Date(b.endTime).getTime();

      return newStart < existingEnd && newEnd > existingStart;
    });
  }

  // Bookings
  public getBookings(): SlotBooking[] {
    return this.get<SlotBooking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }

  public getBookingsByUserId(userId: number): SlotBooking[] {
    return this.getBookings().filter((b) => b.userId === userId);
  }

  public getBookingsByOperatorId(operatorId: number): SlotBooking[] {
    const stations = this.getStations().filter((s) => s.operatorId === operatorId);
    const stationIds = new Set(stations.map((s) => s.id));
    return this.getBookings().filter((b) => stationIds.has(b.stationId));
  }

  public createBooking(bookingData: {
    userId: number;
    userName: string;
    userEmail: string;
    userPhone?: string;
    portId: number;
    stationId: number;
    vehicleModel?: string;
    startTime: string;
    endTime: string;
  }): { success: boolean; booking?: SlotBooking; error?: string } {
    const { portId, startTime, endTime } = bookingData;

    // Strict validation
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return { success: false, error: 'End time must be after start time' };
    }

    if (start.getTime() < Date.now() - 5 * 60000) {
      return { success: false, error: 'Booking cannot be scheduled in the past' };
    }

    // Double-booking conflict check
    if (this.hasOverlappingBooking(portId, startTime, endTime)) {
      return {
        success: false,
        error: 'This charging port is already booked for the selected time window. Please select another slot or port.',
      };
    }

    const port = this.getPorts().find((p) => p.id === portId);
    const station = this.getStations().find((s) => s.id === bookingData.stationId);

    if (!port || !station) {
      return { success: false, error: 'Port or Station not found' };
    }

    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;

    // Energy delivered estimate (capped at realistic battery charge or max delivery)
    // Energy (kWh) = power kW * hours * 0.85 (average charging curve efficiency)
    const energyKwh = Math.round(port.powerOutputKw * durationHours * 0.85 * 10) / 10;
    const estimatedCost = Math.round(energyKwh * port.pricePerKwh * 100) / 100;

    const bookings = this.getBookings();
    const newBooking: SlotBooking = {
      id: Math.max(0, ...bookings.map((b) => b.id)) + 1,
      userId: bookingData.userId,
      userName: bookingData.userName,
      userEmail: bookingData.userEmail,
      userPhone: bookingData.userPhone,
      portId: bookingData.portId,
      stationId: bookingData.stationId,
      stationName: station.name,
      stationAddress: station.address,
      connectorType: port.connectorType,
      powerOutputKw: port.powerOutputKw,
      vehicleModel: bookingData.vehicleModel || 'Electric Vehicle',
      startTime,
      endTime,
      durationHours,
      energyKwh,
      estimatedCost,
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    this.set(STORAGE_KEYS.BOOKINGS, bookings);

    return { success: true, booking: newBooking };
  }

  public cancelBooking(bookingId: number, reason?: string): boolean {
    const bookings = this.getBookings();
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    target.bookingStatus = 'CANCELLED';
    target.cancellationReason = reason || 'Cancelled by user';
    this.set(STORAGE_KEYS.BOOKINGS, bookings);
    return true;
  }

  // Haversine Nearby Search
  public searchNearbyStations(params: NearbySearchParams): ChargingStation[] {
    const { latitude, longitude, radiusKm, connectorType, minPowerKw, onlyAvailable } = params;

    const allStations = this.getStations();
    const results: ChargingStation[] = [];

    for (const station of allStations) {
      // Drivers only see verified stations
      if (!station.isVerified) continue;

      const distanceKm = calculateHaversineDistanceKm(
        latitude,
        longitude,
        station.latitude,
        station.longitude
      );

      if (distanceKm <= radiusKm) {
        let matchingPorts = station.ports || [];

        if (connectorType && connectorType !== 'ALL') {
          matchingPorts = matchingPorts.filter((p) => p.connectorType === connectorType);
        }

        if (minPowerKw && minPowerKw > 0) {
          matchingPorts = matchingPorts.filter((p) => p.powerOutputKw >= minPowerKw);
        }

        if (onlyAvailable) {
          matchingPorts = matchingPorts.filter((p) => p.status === 'AVAILABLE');
        }

        // If filtering by port specs, only include stations that have matching ports
        if ((connectorType && connectorType !== 'ALL') || (minPowerKw && minPowerKw > 0) || onlyAvailable) {
          if (matchingPorts.length === 0) continue;
        }

        results.push({
          ...station,
          distanceKm,
          ports: matchingPorts,
        });
      }
    }

    // Sort by distance ascending
    return results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  // Admin stats
  public getAdminStats(): AdminStats {
    const users = this.getUsers();
    const stations = this.getStations();
    const ports = this.getPorts();
    const bookings = this.getBookings();

    const verifiedStations = stations.filter((s) => s.isVerified).length;
    const pendingStations = stations.filter((s) => !s.isVerified).length;
    const availablePorts = ports.filter((p) => p.status === 'AVAILABLE').length;

    const activeBookings = bookings.filter(
      (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'IN_PROGRESS'
    ).length;

    const totalRevenue = bookings
      .filter((b) => b.bookingStatus !== 'CANCELLED')
      .reduce((sum, b) => sum + b.estimatedCost, 0);

    const totalKwhDelivered = bookings
      .filter((b) => b.bookingStatus !== 'CANCELLED')
      .reduce((sum, b) => sum + b.energyKwh, 0);

    return {
      totalUsers: users.length,
      totalDrivers: users.filter((u) => u.role === 'DRIVER').length,
      totalOperators: users.filter((u) => u.role === 'OPERATOR').length,
      totalStations: stations.length,
      verifiedStations,
      pendingStations,
      totalPorts: ports.length,
      availablePorts,
      totalBookings: bookings.length,
      activeBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalKwhDelivered: Math.round(totalKwhDelivered * 10) / 10,
    };
  }
}

export const storage = new StorageManager();
storage.init();
