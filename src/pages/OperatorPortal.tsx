import React, { useState, useMemo } from 'react';
import {
  ChargingStation,
  ChargingPort,
  ConnectorType,
  PortStatus,
  SlotBooking
} from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { formatInr } from '../utils/currency';
import {
  Wrench,
  Plus,
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Trash2,
  Edit2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const OperatorPortal: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [refreshKey, setRefreshKey] = useState(0);

  // Modals
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [editingStation, setEditingStation] = useState<ChargingStation | null>(null);

  const [showAddPortModal, setShowAddPortModal] = useState(false);
  const [targetStationIdForPort, setTargetStationIdForPort] = useState<number | null>(null);

  // New Station Form State
  const [stationName, setStationName] = useState('');
  const [stationAddress, setStationAddress] = useState('');
  const [stationCity, setStationCity] = useState('San Francisco');
  const [stationLat, setStationLat] = useState<number>(37.7749);
  const [stationLng, setStationLng] = useState<number>(-122.4194);
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [amenityWifi, setAmenityWifi] = useState(true);
  const [amenityCafe, setAmenityCafe] = useState(true);
  const [amenityRestroom, setAmenityRestroom] = useState(true);
  const [amenity247, setAmenity247] = useState(false);

  // New Port Form State
  const [portNumber, setPortNumber] = useState('Port A1');
  const [connectorType, setConnectorType] = useState<ConnectorType>('CCS2');
  const [powerOutputKw, setPowerOutputKw] = useState<number>(150);
  const [pricePerKwh, setPricePerKwh] = useState<number>(31.54);
  const [initialStatus, setInitialStatus] = useState<PortStatus>('AVAILABLE');

  // Filter operator's stations
  const operatorStations = useMemo(() => {
    if (!user) return [];
    return storage.getStations().filter((s) => s.operatorId === user.id);
  }, [user, refreshKey]);

  // Operator bookings
  const operatorBookings = useMemo(() => {
    if (!user) return [];
    return storage.getBookingsByOperatorId(user.id);
  }, [user, refreshKey]);

  // Operator metrics
  const { totalPorts, availablePorts, totalRevenue } = useMemo(() => {
    let portsCount = 0;
    let availCount = 0;
    operatorStations.forEach((s) => {
      (s.ports || []).forEach((p) => {
        portsCount++;
        if (p.status === 'AVAILABLE') availCount++;
      });
    });

    const revenue = operatorBookings
      .filter((b) => b.bookingStatus !== 'CANCELLED')
      .reduce((sum, b) => sum + b.estimatedCost, 0);

    return {
      totalPorts: portsCount,
      availablePorts: availCount,
      totalRevenue: Math.round(revenue * 100) / 100,
    };
  }, [operatorStations, operatorBookings]);

  // Handle Station Creation
  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!stationName.trim() || !stationAddress.trim()) {
      showToast('error', 'Validation Error', 'Please complete station name and address.');
      return;
    }

    const amenities: string[] = [];
    if (amenityWifi) amenities.push('High-Speed WiFi');
    if (amenityCafe) amenities.push('Coffee Lounge');
    if (amenityRestroom) amenities.push('Restrooms');
    if (amenity247) amenities.push('24/7 Access');

    if (editingStation) {
      storage.updateStation({
        ...editingStation,
        name: stationName.trim(),
        address: stationAddress.trim(),
        city: stationCity.trim(),
        latitude: Number(stationLat),
        longitude: Number(stationLng),
        openingTime,
        closingTime,
        amenities,
      });
      showToast('success', 'Station Updated', `${stationName} has been updated.`);
      setEditingStation(null);
    } else {
      const newSt = storage.createStation({
        operatorId: user.id,
        operatorName: user.name,
        name: stationName.trim(),
        address: stationAddress.trim(),
        city: stationCity.trim(),
        latitude: Number(stationLat),
        longitude: Number(stationLng),
        openingTime,
        closingTime,
        isVerified: false, // New stations require admin approval
        amenities,
      });

      // Automatically add 2 initial ports for convenience
      storage.createPort({
        stationId: newSt.id,
        portNumber: 'Port 1 (DC Fast)',
        connectorType: 'CCS2',
        powerOutputKw: 150,
        pricePerKwh: 31.54,
        status: 'AVAILABLE',
      });
      storage.createPort({
        stationId: newSt.id,
        portNumber: 'Port 2 (AC Mennekes)',
        connectorType: 'TYPE2',
        powerOutputKw: 22,
        pricePerKwh: 20.75,
        status: 'AVAILABLE',
      });

      showToast(
        'success',
        'Station Submitted',
        `${stationName} submitted! Pending Admin verification before appearing in Driver search.`
      );
    }

    setShowAddStationModal(false);
    setRefreshKey((k) => k + 1);
  };

  // Handle Add Port
  const handleSavePort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStationIdForPort) return;

    storage.createPort({
      stationId: targetStationIdForPort,
      portNumber: portNumber.trim(),
      connectorType,
      powerOutputKw: Number(powerOutputKw),
      pricePerKwh: Number(pricePerKwh),
      status: initialStatus,
    });

    showToast('success', 'Port Added', `${portNumber} added to charging station.`);
    setShowAddPortModal(false);
    setTargetStationIdForPort(null);
    setRefreshKey((k) => k + 1);
  };

  // Toggle Port Status
  const handleTogglePortStatus = (port: ChargingPort, newStatus: PortStatus) => {
    storage.updatePort({
      ...port,
      status: newStatus,
    });
    showToast('info', 'Port Status Updated', `${port.portNumber} is now ${newStatus}.`);
    setRefreshKey((k) => k + 1);
  };

  const openEditModal = (station: ChargingStation) => {
    setEditingStation(station);
    setStationName(station.name);
    setStationAddress(station.address);
    setStationCity(station.city);
    setStationLat(station.latitude);
    setStationLng(station.longitude);
    setOpeningTime(station.openingTime);
    setClosingTime(station.closingTime);
    setAmenityWifi(station.amenities.includes('High-Speed WiFi'));
    setAmenityCafe(station.amenities.includes('Coffee Lounge'));
    setAmenityRestroom(station.amenities.includes('Restrooms'));
    setAmenity247(station.amenities.includes('24/7 Access'));
    setShowAddStationModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Operator Verification Banner if pending */}
      {user?.isApprovedOperator === false && (
        <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Operator Profile Verification Pending</h4>
            <p className="text-xs mt-1 leading-relaxed">
              Your operator account and newly added charging stations are currently under review by platform administrators.
              You can test approving this operator in the <strong>Admin Panel</strong> tab.
            </p>
          </div>
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Wrench className="w-4 h-4" />
              <span>Charge Point Operator (CPO) Management</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              Station & Port Infrastructure Console
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Deploy charging stations, calibrate power and pricing per kWh, and monitor port availability.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingStation(null);
              setStationName('');
              setStationAddress('');
              setStationCity('San Francisco');
              setStationLat(37.785);
              setStationLng(-122.41);
              setOpeningTime('06:00');
              setClosingTime('23:00');
              setShowAddStationModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Station</span>
          </button>
        </div>

        {/* 4-KPI Metric Strip */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              My Stations
            </span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
              {operatorStations.length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              Total Ports
            </span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
              {totalPorts}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              Available Now
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {availablePorts} <span className="text-xs text-slate-400 font-normal">/ {totalPorts}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              Generated Revenue
            </span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1 tabular-nums">
              {formatInr(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Operator Stations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Managed Charging Facilities ({operatorStations.length})
          </span>
        </div>

        {operatorStations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
            <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Stations Added Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Click &quot;Add New Station&quot; to configure your first charging station and ports.
            </p>
          </div>
        ) : (
          operatorStations.map((station) => (
            <div
              key={station.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
            >
              {/* Station Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {station.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        station.isVerified
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {station.isVerified ? 'Verified Active' : 'Pending Verification'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{station.address}</span>
                    <span>·</span>
                    <span className="font-mono">{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</span>
                    <span>·</span>
                    <Clock className="w-3.5 h-3.5 shrink-0 ml-1" />
                    <span>{station.openingTime} - {station.closingTime}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(station)}
                    className="p-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setTargetStationIdForPort(station.id);
                      setPortNumber(`Port ${((station.ports?.length || 0) + 1)}`);
                      setShowAddPortModal(true);
                    }}
                    className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Port</span>
                  </button>
                </div>
              </div>

              {/* Charging Ports Table / Grid */}
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Dispenser Ports ({station.ports?.length || 0})</span>
                  <span>Real-Time Operator Status Override</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {station.ports?.map((port) => (
                    <div
                      key={port.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                          {port.powerOutputKw}k
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {port.portNumber}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {port.connectorType}
                            </span>
                            <span className="text-xs text-slate-400">
                              {port.powerOutputKw >= 50 ? 'DC Fast' : 'AC Standard'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                            Rate: <strong className="text-emerald-600 dark:text-emerald-400">{formatInr(port.pricePerKwh)}</strong> / kWh
                          </p>
                        </div>
                      </div>

                      {/* Port Status Override Buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Mark as:</span>
                        <button
                          onClick={() => handleTogglePortStatus(port, 'AVAILABLE')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            port.status === 'AVAILABLE'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleTogglePortStatus(port, 'IN_USE')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            port.status === 'IN_USE'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          In-Use
                        </button>
                        <button
                          onClick={() => handleTogglePortStatus(port, 'MAINTENANCE')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            port.status === 'MAINTENANCE'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Maintenance
                        </button>

                        <button
                          onClick={() => {
                            storage.deletePort(port.id);
                            showToast('info', 'Port Removed', `${port.portNumber} removed.`);
                            setRefreshKey((k) => k + 1);
                          }}
                          className="p-1.5 ml-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Port"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Station Bookings Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Station Bookings Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reservations across all your station ports
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {operatorBookings.length} Total Sessions
          </span>
        </div>

        {operatorBookings.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
            No bookings recorded for your stations yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-3">Slot Time</th>
                  <th className="py-2.5 px-3">Port</th>
                  <th className="py-2.5 px-3">Estimated Rev</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {operatorBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {b.userName || 'Driver'}
                      <div className="text-[10px] text-slate-400 font-normal">{b.userEmail}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {b.stationName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {b.powerOutputKw} kW ({b.connectorType})
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatInr(b.estimatedCost)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          b.bookingStatus === 'IN_PROGRESS'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : b.bookingStatus === 'CONFIRMED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Station Modal */}
      {showAddStationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingStation ? 'Edit Charging Station' : 'Add New Charging Station'}
              </h3>
              <button
                onClick={() => setShowAddStationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStation} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Station Name
                </label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="e.g. VoltSpot Metro SuperCharger"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={stationAddress}
                    onChange={(e) => setStationAddress(e.target.value)}
                    placeholder="123 Market St"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    City
                  </label>
                  <input
                    type="text"
                    value={stationCity}
                    onChange={(e) => setStationCity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={stationLat}
                    onChange={(e) => setStationLat(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={stationLng}
                    onChange={(e) => setStationLng(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400 block mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={amenityWifi}
                      onChange={(e) => setAmenityWifi(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>High-Speed WiFi</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={amenityCafe}
                      onChange={(e) => setAmenityCafe(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Coffee Lounge</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={amenityRestroom}
                      onChange={(e) => setAmenityRestroom(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Restrooms</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={amenity247}
                      onChange={(e) => setAmenity247(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>24/7 Access</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStationModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {editingStation ? 'Save Changes' : 'Submit Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Port Modal */}
      {showAddPortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add Charging Port
              </h3>
              <button
                onClick={() => setShowAddPortModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePort} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Port Label / Dispenser #
                </label>
                <input
                  type="text"
                  value={portNumber}
                  onChange={(e) => setPortNumber(e.target.value)}
                  placeholder="e.g. Dispenser 3"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Connector
                  </label>
                  <select
                    value={connectorType}
                    onChange={(e) => setConnectorType(e.target.value as ConnectorType)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="CCS2">CCS2 (DC Fast)</option>
                    <option value="TYPE2">Type 2 (AC)</option>
                    <option value="CHADEMO">CHAdeMO</option>
                    <option value="GBT">GB/T</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Power (kW)
                  </label>
                  <input
                    type="number"
                    value={powerOutputKw}
                    onChange={(e) => setPowerOutputKw(Number(e.target.value))}
                    min="7"
                    max="500"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Price / kWh (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    value={pricePerKwh}
                    onChange={(e) => setPricePerKwh(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Status
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as PortStatus)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="IN_USE">IN_USE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPortModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Port
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
