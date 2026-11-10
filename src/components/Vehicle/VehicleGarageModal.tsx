import React, { useState } from 'react';
import { Vehicle, ConnectorType } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { X, Car, Plus, Trash2, BatteryCharging, Check } from 'lucide-react';

interface VehicleGarageModalProps {
  onClose: () => void;
  onVehicleUpdated: () => void;
}

export const VehicleGarageModal: React.FC<VehicleGarageModalProps> = ({
  onClose,
  onVehicleUpdated,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    return user ? storage.getVehiclesByUserId(user.id) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [make, setMake] = useState('Tesla');
  const [model, setModel] = useState('Model 3 Highland');
  const [batteryCapacity, setBatteryCapacity] = useState<number>(60);
  const [connectorType, setConnectorType] = useState<ConnectorType>('CCS2');
  const [licensePlate, setLicensePlate] = useState('EV-5432');
  const [currentSocPercent, setCurrentSocPercent] = useState<number>(45);

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!make.trim() || !model.trim() || !licensePlate.trim()) {
      showToast('error', 'Validation Error', 'Please complete all vehicle fields.');
      return;
    }

    const newVehicle = storage.addVehicle({
      userId: user.id,
      make: make.trim(),
      model: model.trim(),
      batteryCapacityKwh: Number(batteryCapacity),
      connectorType,
      licensePlate: licensePlate.trim().toUpperCase(),
      currentSocPercent: Number(currentSocPercent),
    });

    const updated = storage.getVehiclesByUserId(user.id);
    setVehicles(updated);
    setShowAddForm(false);
    showToast('success', 'Vehicle Added', `${newVehicle.make} ${newVehicle.model} added to your garage.`);
    onVehicleUpdated();
  };

  const handleDeleteVehicle = (id: number, vehicleName: string) => {
    storage.deleteVehicle(id);
    if (user) {
      const updated = storage.getVehiclesByUserId(user.id);
      setVehicles(updated);
    }
    showToast('info', 'Vehicle Removed', `${vehicleName} was removed from your garage.`);
    onVehicleUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Driver EV Garage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your electric vehicles, battery sizes, and connector standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Vehicle List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Registered Vehicles ({vehicles.length})
              </span>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New EV</span>
                </button>
              )}
            </div>

            {vehicles.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Car className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No vehicles registered yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Add your vehicle to automatically match compatible chargers and estimate charging times.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {v.make} {v.model}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-mono">
                          {v.connectorType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                        <span>Capacity: {v.batteryCapacityKwh} kWh</span>
                        <span>·</span>
                        <span>Plate: <strong className="font-mono text-slate-700 dark:text-slate-300">{v.licensePlate}</strong></span>
                        {v.currentSocPercent !== undefined && (
                          <>
                            <span>·</span>
                            <span>Current SoC: {v.currentSocPercent}%</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v.id, `${v.make} ${v.model}`)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddVehicle}
              className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  New Vehicle Details
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    Make
                  </label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Hyundai, Tesla, Ford"
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Ioniq 6, Mach-E"
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    Battery (kWh)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="250"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    Connector Type
                  </label>
                  <select
                    value={connectorType}
                    onChange={(e) => setConnectorType(e.target.value as ConnectorType)}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="CCS2">CCS2 (DC Fast)</option>
                    <option value="TYPE2">Type 2 (Mennekes AC)</option>
                    <option value="CHADEMO">CHAdeMO</option>
                    <option value="GBT">GB/T</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="e.g. EV-892"
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Save Vehicle to Garage
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
