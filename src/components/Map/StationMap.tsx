import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ChargingStation } from '../../types';
import { Zap, Navigation, Clock, ShieldCheck } from 'lucide-react';

interface StationMapProps {
  stations: ChargingStation[];
  center: [number, number];
  zoom?: number;
  selectedStationId?: number | null;
  onSelectStation: (station: ChargingStation) => void;
  onBookSlot: (station: ChargingStation) => void;
  userLocation?: [number, number];
}

// Custom SVG Icons for Leaflet markers
const createStationIcon = (hasAvailablePorts: boolean, isSelected: boolean) => {
  const bg = isSelected
    ? '#059669' // emerald-600
    : hasAvailablePorts
    ? '#10b981' // emerald-500
    : '#f59e0b'; // amber-500

  const html = `
    <div style="
      position: relative;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${bg};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${bg};
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-station-pin',
    html,
    iconSize: [38, 44],
    iconAnchor: [19, 44],
    popupAnchor: [0, -44],
  });
};

const createUserLocationIcon = () => {
  const html = `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #2563eb;
      border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3), 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `;
  return L.divIcon({
    className: 'custom-user-pin',
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  center,
  zoom = 13,
  selectedStationId,
  onSelectStation,
  onBookSlot,
  userLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: number]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, zoom);

      // Clean CartoDB Voyager / OpenStreetMap light tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(center, { animate: true, duration: 0.8 });
    }
  }, [center]);

  // Update User Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(userLocation, {
        icon: createUserLocationIcon(),
        zIndexOffset: 1000,
      })
        .addTo(mapInstanceRef.current)
        .bindPopup('<div class="p-2 text-xs font-semibold text-slate-800">Your Current Location</div>');
    } else {
      userMarkerRef.current.setLatLng(userLocation);
    }
  }, [userLocation]);

  // Update Station Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old markers not in current list
    const currentStationIds = new Set(stations.map((s) => s.id));
    Object.keys(markersRef.current).forEach((key) => {
      const id = Number(key);
      if (!currentStationIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    stations.forEach((station) => {
      const hasAvailable = station.ports?.some((p) => p.status === 'AVAILABLE') ?? false;
      const isSelected = selectedStationId === station.id;
      const icon = createStationIcon(hasAvailable, isSelected);

      if (!markersRef.current[station.id]) {
        const marker = L.marker([station.latitude, station.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            onSelectStation(station);
          });

        markersRef.current[station.id] = marker;
      } else {
        markersRef.current[station.id].setIcon(icon);
        markersRef.current[station.id].setLatLng([station.latitude, station.longitude]);
      }
    });
  }, [stations, selectedStationId, onSelectStation]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Stats */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span>Available Ports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
          <span>Busy / High Load</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
          <span>My GPS</span>
        </div>
      </div>
    </div>
  );
};
