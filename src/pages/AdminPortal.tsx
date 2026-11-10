import React, { useState, useMemo } from 'react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  ShieldCheck,
  Users,
  Zap,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Activity,
  Layers
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'VERIFICATIONS' | 'STATIONS' | 'USERS' | 'BOOKINGS'>('VERIFICATIONS');

  const stats = useMemo(() => {
    return storage.getAdminStats();
  }, [refreshKey]);

  const allStations = useMemo(() => {
    return storage.getStations();
  }, [refreshKey]);

  const pendingStations = useMemo(() => {
    return allStations.filter((s) => !s.isVerified);
  }, [allStations]);

  const allUsers = useMemo(() => {
    return storage.getUsers();
  }, [refreshKey]);

  const pendingOperators = useMemo(() => {
    return allUsers.filter((u) => u.role === 'OPERATOR' && u.isApprovedOperator === false);
  }, [allUsers]);

  const allBookings = useMemo(() => {
    return storage.getBookings();
  }, [refreshKey]);

  // Actions
  const handleVerifyStation = (stationId: number, stationName: string, approve: boolean) => {
    storage.verifyStation(stationId, approve);
    showToast(
      approve ? 'success' : 'info',
      approve ? 'Station Approved' : 'Station Rejected',
      approve
        ? `${stationName} is now verified and available in Driver search.`
        : `${stationName} has been rejected.`
    );
    setRefreshKey((k) => k + 1);
  };

  const handleVerifyOperator = (operatorId: number, operatorName: string, approve: boolean) => {
    const target = storage.getUserById(operatorId);
    if (target) {
      storage.updateUser({
        ...target,
        isApprovedOperator: approve,
      });
      showToast(
        approve ? 'success' : 'info',
        approve ? 'Operator Approved' : 'Operator Rejected',
        `${operatorName} operator status updated to ${approve ? 'APPROVED' : 'REJECTED'}.`
      );
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Administration & Super-User Console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              Network Operations & Verification Hub
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review and approve pending station operators, verify electrical compliance, and audit network sessions.
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('VERIFICATIONS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'VERIFICATIONS'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Approvals ({pendingStations.length + pendingOperators.length})
            </button>
            <button
              onClick={() => setActiveTab('STATIONS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'STATIONS'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Stations ({allStations.length})
            </button>
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'USERS'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Users ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'BOOKINGS'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Bookings ({allBookings.length})
            </button>
          </div>
        </div>

        {/* System Stats Overview Strip */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Users</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.totalUsers}
            </p>
            <span className="text-[10px] text-slate-500">{stats.totalDrivers} Drivers · {stats.totalOperators} CPOs</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Active Stations</span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.verifiedStations}
            </p>
            <span className="text-[10px] text-amber-500">{stats.pendingStations} Pending Review</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Ports</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.totalPorts}
            </p>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400">{stats.availablePorts} Currently Available</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Slot Bookings</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.totalBookings}
            </p>
            <span className="text-[10px] text-blue-500">{stats.activeBookings} Active Today</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Platform Volume</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
              ${stats.totalRevenue.toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500">Gross Charging Vol.</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Energy Delivered</span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
              {stats.totalKwhDelivered} <span className="text-xs font-normal">kWh</span>
            </p>
            <span className="text-[10px] text-slate-500">Clean Grid Energy</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Verifications Queue */}
      {activeTab === 'VERIFICATIONS' && (
        <div className="space-y-6">
          {/* Pending Operators */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pending Operator Applications ({pendingOperators.length})
              </h3>
              <span className="text-xs text-slate-500">KYC & Business Compliance</span>
            </div>

            {pendingOperators.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                All operator profiles are verified and active.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingOperators.map((op) => (
                  <div key={op.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{op.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {op.email} · {op.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyOperator(op.id, op.name, false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-400"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyOperator(op.id, op.name, true)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        Approve Operator
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Stations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pending Station Approvals ({pendingStations.length})
              </h3>
              <span className="text-xs text-slate-500">Requires Admin Approval for Driver Search</span>
            </div>

            {pendingStations.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                No stations awaiting verification. All registered stations are live.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingStations.map((st) => (
                  <div key={st.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {st.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Pending Verification
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {st.address} · Operator: <strong>{st.operatorName || `Operator #${st.operatorId}`}</strong>
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Coordinates: {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)} · Ports: {st.ports?.length || 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyStation(st.id, st.name, false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-400"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyStation(st.id, st.name, true)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        Approve & Publish to Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: All Stations Master List */}
      {activeTab === 'STATIONS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Station Name</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Ports</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allStations.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {st.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {st.operatorName || `Operator #${st.operatorId}`}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {st.address}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {st.ports?.length || 0} Ports
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          st.isVerified
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {st.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleVerifyStation(st.id, st.name, !st.isVerified)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users Master Table */}
      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {u.phone}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                            : u.role === 'OPERATOR'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: All Bookings Audit */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Slot Time</th>
                  <th className="py-3 px-4">Energy / Power</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      #VOLT-{b.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {b.userName}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {b.stationName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      {b.energyKwh} kWh ({b.powerOutputKw} kW)
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ${b.estimatedCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : b.bookingStatus === 'IN_PROGRESS'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
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
        </div>
      )}
    </div>
  );
};
