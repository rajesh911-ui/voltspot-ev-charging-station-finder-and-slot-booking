import React, { useState, useMemo } from 'react';
import { SlotBooking } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { formatInr } from '../utils/currency';
import {
  Calendar,
  Clock,
  Zap,
  MapPin,
  QrCode,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Car,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export const BookingsManager: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<SlotBooking | null>(null);

  const userBookings = useMemo(() => {
    if (!user) return [];
    return storage.getBookingsByUserId(user.id);
  }, [user, refreshKey]);

  const activeBookings = useMemo(() => {
    return userBookings.filter(
      (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'IN_PROGRESS'
    );
  }, [userBookings]);

  const pastBookings = useMemo(() => {
    return userBookings.filter(
      (b) => b.bookingStatus === 'COMPLETED' || b.bookingStatus === 'CANCELLED'
    );
  }, [userBookings]);

  const handleCancel = (bookingId: number, stationName?: string) => {
    const success = storage.cancelBooking(bookingId, 'Cancelled by driver');
    if (success) {
      showToast('info', 'Booking Cancelled', `Slot reservation at ${stationName || 'station'} has been released.`);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-4 h-4" />
            <span>Driver Reservations & Pass Manager</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            My Charging Slot Bookings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track confirmed time slots, active charging sessions, and access your digital charging pass.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Active & Upcoming ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            History ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings Content */}
      {activeTab === 'ACTIVE' ? (
        activeBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Active Slot Reservations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Find a nearby charging station on the map and book a time slot to skip queues.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          b.bookingStatus === 'IN_PROGRESS'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {b.bookingStatus === 'IN_PROGRESS' ? 'Charging in Progress' : 'Confirmed Slot'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                        {b.stationName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{b.stationAddress}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedBookingForPass(b)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="View Digital QR Pass"
                    >
                      <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>

                  {/* Slot Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Time Window</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {new Date(b.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Power & Plug</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {b.powerOutputKw} kW ({b.connectorType})
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {b.vehicleModel}
                      </p>
                    </div>
                  </div>

                  {/* Cost & Energy */}
                  <div className="mt-3 flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500 dark:text-slate-400">
                      Est. Energy: <strong className="font-mono text-slate-800 dark:text-slate-200">{b.energyKwh} kWh</strong> ({b.durationHours}h)
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {formatInr(b.estimatedCost)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleCancel(b.id, b.stationName)}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline"
                  >
                    Cancel Booking
                  </button>

                  <button
                    onClick={() => setSelectedBookingForPass(b)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Show Check-In QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {pastBookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No past charging sessions recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Slot Date & Time</th>
                    <th className="py-3 px-4">Plug / Power</th>
                    <th className="py-3 px-4">Delivered</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pastBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {b.stationName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {new Date(b.startTime).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {b.powerOutputKw} kW {b.connectorType}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {b.energyKwh} kWh
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatInr(b.estimatedCost)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            b.bookingStatus === 'COMPLETED'
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
      )}

      {/* Digital QR Check-In Pass Modal */}
      {selectedBookingForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Digital Charger Pass
              </span>
              <button
                onClick={() => setSelectedBookingForPass(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedBookingForPass.stationName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Port ID: #{selectedBookingForPass.portId} · {selectedBookingForPass.connectorType} ({selectedBookingForPass.powerOutputKw} kW)
              </p>
            </div>

            {/* Simulated QR Code SVG */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-inner inline-block">
              <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                {/* QR Positioning Corners */}
                <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="#059669" />

                <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="#059669" />

                <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="#059669" />

                {/* Data Matrix Dots */}
                <rect x="40" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="48" y="32" width="6" height="6" fill="#0f172a" />
                <rect x="14" y="42" width="6" height="6" fill="#0f172a" />
                <rect x="26" y="48" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="44" width="18" height="18" fill="#059669" rx="2" />
                <rect x="66" y="44" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="50" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="72" width="6" height="6" fill="#0f172a" />
                <rect x="54" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="70" y="76" width="8" height="8" fill="#0f172a" />
                <rect x="82" y="66" width="6" height="6" fill="#0f172a" />
              </svg>
            </div>

            <p className="text-xs font-mono text-slate-500">
              Booking Ref: #VOLT-{selectedBookingForPass.id.toString().padStart(5, '0')}
            </p>
            <p className="text-[11px] text-slate-400">
              Scan at the dispenser screen to initiate plug-and-charge authorization.
            </p>

            <button
              onClick={() => setSelectedBookingForPass(null)}
              className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
