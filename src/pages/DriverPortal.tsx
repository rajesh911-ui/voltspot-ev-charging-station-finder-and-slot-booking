import React, { useState, useMemo } from 'react';
import {
  ChargingStation,
  ConnectorType,
  SlotBooking
} from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { StationMap } from '../components/Map/StationMap';
import { BookingModal } from '../components/Booking/BookingModal';
import { VehicleGarageModal } from '../components/Vehicle/VehicleGarageModal';
import {
  Search,
  Filter,
  Navigation,
  Zap,
  Clock,
  Car,
  ChevronRight,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DriverPortalProps {
  onOpenBackendExplorer: () => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({ onOpenBackendExplorer }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Location state (default San Francisco coordinates)
  const [userLocation, setUserLocation] = useState<[number, number]>([37.7885, -122.4075]);
  const [locationName, setLocationName] = useState('San Francisco, CA');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [connectorType, setConnectorType] = useState<ConnectorType | 'ALL'>('ALL');
  const [powerFilter, setPowerFilter] = useState<'ALL' | 'AC' | 'DC_FAST' | 'ULTRA_FAST'>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Selected station for details & booking
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [bookingStation, setBookingStation] = useState<ChargingStation | null>(null);
  const [isGarageOpen, setIsGarageOpen] = useState(false);

  // User's vehicles for badge
  const [garageRefreshKey, setGarageRefreshKey] = useState(0);
  const driverVehicles = useMemo(() => {
    return user ? storage.getVehiclesByUserId(user.id) : [];
  }, [user, garageRefreshKey]);

  // Handle Geolocation
  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setLocationName('Your Current GPS Location');
          showToast('success', 'Location Updated', 'Map centered to your real-time coordinates.');
        },
        (error) => {
          showToast('error', 'Location Error', error.message || 'Unable to retrieve location.');
        }
      );
    } else {
      showToast('error', 'Unsupported', 'Geolocation is not supported by your browser.');
    }
  };

  // Perform Haversine Nearby Search
  const nearbyStations = useMemo(() => {
    let minPowerKw = 0;
    if (powerFilter === 'DC_FAST') minPowerKw = 50;
    if (powerFilter === 'ULTRA_FAST') minPowerKw = 150;

    let stations = storage.searchNearbyStations({
      latitude: userLocation[0],
      longitude: userLocation[1],
      radiusKm,
      connectorType: connectorType === 'ALL' ? undefined : connectorType,
      minPowerKw: powerFilter === 'AC' ? 0 : minPowerKw,
      onlyAvailable,
    });

    if (powerFilter === 'AC') {
      stations = stations.filter((s) => s.ports?.some((p) => p.powerOutputKw <= 22));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      stations = stations.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }

    return stations;
  }, [userLocation, radiusKm, connectorType, powerFilter, onlyAvailable, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Driver Header & EV Garage Quick Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" />
              <span>Driver Station Finder & Slot Booking</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              Find & Reserve EV Charging Slots
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Real-time station locator powered by Haversine distance search, zero double-booking conflict guarantee, and automatic charging cost estimator.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsGarageOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all shadow-sm"
            >
              <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                My Garage ({driverVehicles.length} {driverVehicles.length === 1 ? 'EV' : 'EVs'})
              </span>
            </button>
          </div>
        </div>

        {/* Search & Location Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station by name, street, or neighborhood..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Presets / GPS */}
          <div className="md:col-span-4 flex items-center gap-2">
            <button
              onClick={handleUseMyLocation}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>My GPS</span>
            </button>

            <select
              value={locationName}
              onChange={(e) => {
                const val = e.target.value;
                setLocationName(val);
                if (val === 'San Francisco, CA') setUserLocation([37.7885, -122.4075]);
                if (val === 'Mission Bay / SoMa') setUserLocation([37.7712, -122.4048]);
                if (val === 'Presidio / Marina') setUserLocation([37.7989, -122.4556]);
                if (val === 'Embarcadero Waterfront') setUserLocation([37.7937, -122.3905]);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="San Francisco, CA">San Francisco Downtown</option>
              <option value="Mission Bay / SoMa">Mission Bay / SoMa Hub</option>
              <option value="Presidio / Marina">Presidio / Marina EcoPark</option>
              <option value="Embarcadero Waterfront">Embarcadero Pier Area</option>
            </select>
          </div>

          {/* Radius Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={15}>Within 15 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          {/* Connector Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['ALL', 'CCS2', 'TYPE2', 'CHADEMO'] as const).map((ct) => (
              <button
                key={ct}
                onClick={() => setConnectorType(ct)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  connectorType === ct
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {ct === 'ALL' ? 'All Plugs' : ct}
              </button>
            ))}
          </div>

          {/* Power Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: 'ALL', label: 'All Power' },
              { id: 'AC', label: 'AC (≤22kW)' },
              { id: 'DC_FAST', label: 'Fast DC (≥50kW)' },
              { id: 'ULTRA_FAST', label: 'Ultra (≥150kW)' },
            ].map((pf) => (
              <button
                key={pf.id}
                onClick={() => setPowerFilter(pf.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  powerFilter === pf.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>

          {/* Available Ports Toggle */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              onlyAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Available Now Only
          </button>
        </div>
      </div>

      {/* Main Content: Split Map + Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Station Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {nearbyStations.length} Verified {nearbyStations.length === 1 ? 'Station' : 'Stations'} Found
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Haversine Distance Sorted
            </span>
          </div>

          {nearbyStations.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No stations match your criteria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try widening your search radius or clearing connector/power filters.
              </p>
              <button
                onClick={() => {
                  setConnectorType('ALL');
                  setPowerFilter('ALL');
                  setRadiusKm(25);
                  setOnlyAvailable(false);
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            nearbyStations.map((station) => {
              const isSelected = selectedStation?.id === station.id;
              const availableCount = station.ports?.filter((p) => p.status === 'AVAILABLE').length || 0;
              const totalPorts = station.ports?.length || 0;

              return (
                <div
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  {/* Top Bar: Name & Distance */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified EV Hub</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                        {station.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{station.address}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                        {station.distanceKm} km
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase">Away</p>
                    </div>
                  </div>

                  {/* Ports Grid Breakdown */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Ports ({availableCount}/{totalPorts} Available)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Hours: {station.openingTime} - {station.closingTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {station.ports?.map((port) => (
                        <div
                          key={port.id}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {port.powerOutputKw} kW
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1 font-mono">
                              {port.connectorType}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              port.status === 'AVAILABLE'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : port.status === 'IN_USE'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            }`}
                          >
                            {port.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  {station.amenities && station.amenities.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span>Amenities:</span>
                      {station.amenities.slice(0, 3).map((a, idx) => (
                        <span key={idx} className="font-medium text-slate-600 dark:text-slate-300">
                          {a}{idx < Math.min(2, station.amenities.length - 1) ? ' · ' : ''}
                        </span>
                      ))}
                      {station.amenities.length > 3 && (
                        <span>+{station.amenities.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      From ${Math.min(...(station.ports?.map((p) => p.pricePerKwh) || [0.35])).toFixed(2)}/kWh
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookingStation(station);
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 h-[600px] lg:h-auto min-h-[500px]">
          <StationMap
            stations={nearbyStations}
            center={
              selectedStation
                ? [selectedStation.latitude, selectedStation.longitude]
                : userLocation
            }
            zoom={selectedStation ? 15 : 13}
            selectedStationId={selectedStation?.id}
            userLocation={userLocation}
            onSelectStation={(st) => setSelectedStation(st)}
            onBookSlot={(st) => setBookingStation(st)}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {bookingStation && (
        <BookingModal
          station={bookingStation}
          onClose={() => setBookingStation(null)}
          onBookingSuccess={(b) => {
            setBookingStation(null);
          }}
        />
      )}

      {/* Vehicle Garage Modal */}
      {isGarageOpen && (
        <VehicleGarageModal
          onClose={() => setIsGarageOpen(false)}
          onVehicleUpdated={() => setGarageRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
};
