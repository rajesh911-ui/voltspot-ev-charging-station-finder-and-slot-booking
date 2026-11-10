import React, { useState, useMemo } from 'react';
import {
  ChargingStation,
  ChargingPort,
  Vehicle,
  SlotBooking
} from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import {
  X,
  Zap,
  Calendar,
  Clock,
  Car,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  BatteryCharging,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface BookingModalProps {
  station: ChargingStation;
  onClose: () => void;
  onBookingSuccess: (booking: SlotBooking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  station,
  onClose,
  onBookingSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const userVehicles = useMemo(() => {
    return user ? storage.getVehiclesByUserId(user.id) : [];
  }, [user]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(
    userVehicles[0]?.id || 0
  );

  const availablePorts = useMemo(() => {
    return station.ports || [];
  }, [station.ports]);

  const [selectedPortId, setSelectedPortId] = useState<number>(
    availablePorts[0]?.id || 0
  );

  // Date selection: default today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Time slot selection: default to next clean hour
  const [startHour, setStartHour] = useState<number>(() => {
    const now = new Date();
    return Math.min(22, now.getHours() + 1);
  });

  const [startMinute, setStartMinute] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);

  const selectedPort = availablePorts.find((p) => p.id === selectedPortId);
  const selectedVehicle = userVehicles.find((v) => v.id === selectedVehicleId);

  // Compute calculated start and end ISO strings
  const { startIso, endIso, isPastTime } = useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(start.getTime() + durationMinutes * 60000);

    const now = new Date();
    const isPast = start.getTime() < now.getTime() - 2 * 60000;

    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      isPastTime: isPast,
    };
  }, [selectedDate, startHour, startMinute, durationMinutes]);

  // Check double-booking conflict
  const hasConflict = useMemo(() => {
    if (!selectedPortId || isPastTime) return false;
    return storage.hasOverlappingBooking(selectedPortId, startIso, endIso);
  }, [selectedPortId, startIso, endIso, isPastTime]);

  // Existing bookings on this port today (to show conflict timeline to user)
  const existingPortBookingsToday = useMemo(() => {
    if (!selectedPortId) return [];
    return storage
      .getBookings()
      .filter(
        (b) =>
          b.portId === selectedPortId &&
          b.bookingStatus !== 'CANCELLED' &&
          b.startTime.startsWith(selectedDate)
      );
  }, [selectedPortId, selectedDate]);

  // Energy & Cost Estimation calculation
  const { durationHours, estimatedEnergyKwh, estimatedCost } = useMemo(() => {
    const hours = durationMinutes / 60;
    if (!selectedPort) return { durationHours: hours, estimatedEnergyKwh: 0, estimatedCost: 0 };

    // Real-world charging physics:
    // Power (kW) delivered over time with battery acceptance curve (~85% average speed efficiency)
    let energyKwh = selectedPort.powerOutputKw * hours * 0.85;

    // If vehicle capacity is known, cap at the vehicle battery capacity
    if (selectedVehicle) {
      const batteryNeededKwh =
        (selectedVehicle.batteryCapacityKwh * (100 - (selectedVehicle.currentSocPercent || 20))) / 100;
      energyKwh = Math.min(energyKwh, batteryNeededKwh);
    }

    energyKwh = Math.round(energyKwh * 10) / 10;
    const cost = Math.round(energyKwh * selectedPort.pricePerKwh * 100) / 100;

    return {
      durationHours: hours,
      estimatedEnergyKwh: energyKwh,
      estimatedCost: cost,
    };
  }, [durationMinutes, selectedPort, selectedVehicle]);

  const handleConfirmBooking = () => {
    if (!user) {
      showToast('error', 'Authentication Required', 'Please log in to book a charging slot.');
      return;
    }

    if (isPastTime) {
      showToast('error', 'Invalid Time', 'Cannot book a charging slot in the past.');
      return;
    }

    if (hasConflict) {
      showToast(
        'error',
        'Slot Conflict Detected',
        'This port has already been reserved for the selected timeframe. Please pick another time or port.'
      );
      return;
    }

    const vehicleDesc = selectedVehicle
      ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.licensePlate})`
      : 'Electric Vehicle';

    const result = storage.createBooking({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      portId: selectedPortId,
      stationId: station.id,
      vehicleModel: vehicleDesc,
      startTime: startIso,
      endTime: endIso,
    });

    if (result.success && result.booking) {
      showToast(
        'success',
        'Booking Confirmed!',
        `Slot reserved at ${station.name} on ${new Date(startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
      onBookingSuccess(result.booking);
      onClose();
    } else {
      showToast('error', 'Booking Failed', result.error || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              <span>EV Charging Slot Reservation</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {station.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {station.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Vehicle Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Select Vehicle
            </label>
            {userVehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userVehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                      selectedVehicleId === v.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {v.make} {v.model}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {v.batteryCapacityKwh} kWh Battery · {v.connectorType}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Plate: {v.licensePlate}
                      </p>
                    </div>
                    {selectedVehicleId === v.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>No registered vehicle selected. Using default EV profile (60 kWh CCS2).</span>
              </div>
            )}
          </div>

          {/* Step 2: Choose Charging Port */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              2. Select Charging Port
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePorts.map((port) => {
                const isSelected = selectedPortId === port.id;
                const isMaintenance = port.status === 'MAINTENANCE';

                return (
                  <button
                    key={port.id}
                    type="button"
                    disabled={isMaintenance}
                    onClick={() => setSelectedPortId(port.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                        : isMaintenance
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {port.portNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          port.status === 'AVAILABLE'
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                            : port.status === 'IN_USE'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {port.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                        {port.powerOutputKw} kW
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {port.powerOutputKw >= 50 ? 'DC Fast' : 'AC Standard'} · {port.connectorType}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      ${port.pricePerKwh.toFixed(2)} / kWh
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Date, Time & Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              3. Date & Time Window
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date */}
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Date</span>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Time */}
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Start Time</span>
                <div className="flex items-center gap-1 mt-1">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  >
                    <option value={0}>00 min</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Duration</span>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>1 hour (60m)</option>
                  <option value={90}>1.5 hours (90m)</option>
                  <option value={120}>2 hours (120m)</option>
                </select>
              </div>
            </div>

            {/* Existing Reserved Slots Today for Transparency */}
            {existingPortBookingsToday.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reserved Slots on {selectedPort?.portNumber} for {selectedDate}:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {existingPortBookingsToday.map((b) => (
                    <span
                      key={b.id}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Double Booking Warning / Conflict Alert */}
          {hasConflict && (
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Double-Booking Conflict Detected
                </p>
                <p className="text-xs mt-1 leading-relaxed">
                  The selected port ({selectedPort?.portNumber}) is already reserved during this time window.
                  Please adjust the start time or choose another charging port to proceed.
                </p>
              </div>
            </div>
          )}

          {isPastTime && (
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Invalid Booking Window</p>
                <p className="text-xs mt-1">You cannot reserve a time slot that has already passed.</p>
              </div>
            </div>
          )}

          {/* Cost Estimation Summary Card */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Dynamic Cost Estimation</span>
              <span className="font-mono">{durationHours}h × {selectedPort?.powerOutputKw}kW</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Est. Energy</span>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                  {estimatedEnergyKwh} kWh
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Rate / kWh</span>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                  ${selectedPort?.pricePerKwh.toFixed(2)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Est. Total Cost</span>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  ${estimatedCost.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Formula: Power (kW) × Hours × Efficiency factor (85%) × Rate/kWh. Final charge billed per actual meter telemetry.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={hasConflict || isPastTime}
            onClick={handleConfirmBooking}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
              hasConflict || isPastTime
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-95'
            }`}
          >
            <span>Confirm & Reserve Slot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
