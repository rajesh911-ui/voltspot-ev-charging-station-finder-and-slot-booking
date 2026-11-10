/**
 * VoltSpot EV - Advanced Google Maps Integration
 * Features:
 *  - Google Maps JavaScript API with dynamic API Key configuration
 *  - Live User Location Tracking (GPS beacon + continuous watchPosition)
 *  - Live Stations Plotting with custom EV pins and rich InfoWindows
 *  - Indian Rupee (₹ / INR) pricing and distance calculation
 *  - Operator Coordinate Picker with Draggable Marker & Google Places Autocomplete
 *  - Station Details Mini-Map with Turn-by-Turn Google Maps Navigation
 *  - Seamless Fallback support if API key is invalid or pending
 */

// Default Fallback / Demo API Key (Can be overridden by user via UI or localStorage)
let GOOGLE_MAPS_API_KEY = window.GOOGLE_MAPS_API_KEY || localStorage.getItem('voltspot_google_maps_api_key') || '';

// Global map instances & markers
let googleStationsMap = null;
let googlePickerMap = null;
let googleDetailMap = null;
let activeLeafletMap = null;
let leafletUserMarker = null;
let leafletAccuracyCircle = null;
let leafletMarkers = [];
let stationMarkers = [];
let userLocationMarker = null;
let userAccuracyCircle = null;
let liveWatchId = null;
let leafletWatchId = null;
let currentInfoWindow = null;

// User's live coordinates (Defaults to Bengaluru / Central India if not yet acquired)
let userLiveCoords = {
    lat: 12.9716,
    lng: 77.5946,
    accuracy: null,
    hasGps: false
};

/**
 * Returns the currently active Google Maps API key
 */
function getGoogleMapsApiKey() {
    return localStorage.getItem('voltspot_google_maps_api_key') || window.GOOGLE_MAPS_API_KEY || '';
}

/**
 * Sets and persists a new Google Maps API key, then refreshes the maps
 */
function setGoogleMapsApiKey(newKey) {
    if (!newKey) return;
    const trimmed = newKey.trim();
    localStorage.setItem('voltspot_google_maps_api_key', trimmed);
    window.GOOGLE_MAPS_API_KEY = trimmed;
    GOOGLE_MAPS_API_KEY = trimmed;
    
    // Update UI status badge immediately
    updateKeyStatusBadge(true);

    // Show toast / notification
    if (window.showToast) {
        window.showToast('Google Maps API Key saved! Connecting to Google Maps...', 'success');
    }
    
    // Reload page to re-initialize Google Maps with the new credentials
    setTimeout(() => {
        window.location.reload();
    }, 400);
}

/**
 * Saves API key from the dedicated Bootstrap modal
 */
function saveGoogleMapsKeyFromModal() {
    const input = document.getElementById('gmapsApiKeyInput');
    if (!input) return;
    const key = input.value.trim();
    if (!key) {
        alert('Please enter a valid Google Maps API Key or click Clear Key.');
        return;
    }
    
    // Hide modal if open
    const modalEl = document.getElementById('gmapsApiKeyModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    
    setGoogleMapsApiKey(key);
}

/**
 * Clears saved Google Maps API key from localStorage
 */
function clearGoogleMapsKey() {
    localStorage.removeItem('voltspot_google_maps_api_key');
    window.GOOGLE_MAPS_API_KEY = '';
    GOOGLE_MAPS_API_KEY = '';
    
    const input = document.getElementById('gmapsApiKeyInput');
    if (input) input.value = '';
    
    updateKeyStatusBadge(false);
    
    // Hide modal if open
    const modalEl = document.getElementById('gmapsApiKeyModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    
    setTimeout(() => {
        window.location.reload();
    }, 300);
}

/**
 * Opens dedicated Google Maps API Key configuration modal
 */
function openGoogleMapsKeyModal() {
    const existingKey = getGoogleMapsApiKey();
    const input = document.getElementById('gmapsApiKeyInput');
    if (input) input.value = existingKey;
    
    // Check if Bootstrap 5 modal is present in DOM
    const modalEl = document.getElementById('gmapsApiKeyModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
        setTimeout(() => {
            if (input) input.focus();
        }, 400);
        return;
    }
    
    // Native prompt fallback if modal DOM isn't present
    const promptMsg = "Enter your Google Maps JavaScript API Key:\n(Enables live Google Maps tiles, satellite view, Places search, and traffic across India)";
    const key = prompt(promptMsg, existingKey);
    if (key !== null) {
        setGoogleMapsApiKey(key);
    }
}

/**
 * Dynamically loads the official Google Maps JavaScript API script
 */
function loadGoogleMapsScript(callback) {
    if (window.google && window.google.maps) {
        if (callback) callback();
        return;
    }

    const key = getGoogleMapsApiKey();
    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    
    // Construct Google Maps API URL with key and required libraries
    let scriptUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places,geometry&loading=async';
    if (key) {
        scriptUrl += `&key=${encodeURIComponent(key)}`;
    }
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;

    // Handle Google Maps authentication failures gracefully
    window.gm_authFailure = function () {
        console.warn('Google Maps API Key authentication failed or billing is not active.');
        showGoogleMapsKeyBanner('Google Maps API Key error or billing not enabled. Click here to enter a valid API key.');
    };

    script.onload = function () {
        console.log('Google Maps JavaScript API loaded successfully.');
        updateKeyStatusBadge(true);
        if (callback) callback();
    };

    script.onerror = function () {
        console.warn('Failed to load Google Maps script. Switching to interactive fallback.');
        showGoogleMapsKeyBanner('Unable to load Google Maps script. Click here to configure your API key.');
    };

    document.head.appendChild(script);
}

/**
 * Displays an API key notification / configuration banner on top of the map
 */
function showGoogleMapsKeyBanner(message) {
    const existing = document.getElementById('gmaps-api-key-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'gmaps-api-key-banner';
    banner.className = 'alert alert-warning alert-dismissible fade show m-3 shadow-sm d-flex align-items-center justify-content-between anim-fade-down';
    banner.style.cssText = 'position: relative; z-index: 1000; border-left: 5px solid #f59e0b;';
    banner.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-key-fill fs-4 me-3 text-warning"></i>
            <div>
                <strong>Google Maps API Connection:</strong> ${message || 'Connect your Google Maps API key for full live mapping and street view.'}
            </div>
        </div>
        <div class="d-flex gap-2 ms-3">
            <button onclick="openGoogleMapsKeyModal()" class="btn btn-sm btn-warning text-dark fw-bold btn-shimmer">
                <i class="bi bi-gear-fill me-1"></i> Connect API Key
            </button>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    const mapContainers = document.querySelectorAll('#stationMap, #pickerMap, #detailMap, #stationDetailMap');
    if (mapContainers.length > 0) {
        mapContainers[0].parentNode.insertBefore(banner, mapContainers[0]);
    }
}

/**
 * Updates navbar button & badge indicating Google Maps connection status
 */
function updateKeyStatusBadge(isConnected) {
    const key = getGoogleMapsApiKey();
    const hasKey = isConnected || !!key;

    // 1. Update status badge if exists
    const badge = document.getElementById('gmapsStatusBadge');
    if (badge) {
        if (hasKey) {
            badge.className = 'badge bg-success-subtle text-success border border-success me-2';
            badge.innerHTML = '<i class="bi bi-google me-1"></i> Maps API: Connected';
            badge.title = 'Google Maps JavaScript API active with key: ' + key.substring(0, 6) + '...';
        } else {
            badge.className = 'badge bg-warning-subtle text-dark border border-warning me-2 cursor-pointer';
            badge.innerHTML = '<i class="bi bi-key me-1"></i> Connect Maps API Key';
            badge.title = 'Click to connect your Google Maps API Key';
        }
    }

    // 2. Update navbar Maps API button if exists
    const navBtn = document.getElementById('navMapsApiBtn');
    const activeDot = document.getElementById('gmapsKeyActiveDot');
    if (navBtn) {
        if (hasKey) {
            navBtn.classList.remove('btn-outline-warning');
            navBtn.classList.add('btn-outline-success');
            navBtn.innerHTML = `<i class="bi bi-google me-1 text-success"></i><span class="d-none d-md-inline">Maps: Connected</span>`;
            if (activeDot) activeDot.classList.remove('d-none');
        } else {
            navBtn.classList.remove('btn-outline-success');
            navBtn.classList.add('btn-outline-warning');
            navBtn.innerHTML = `<i class="bi bi-google me-1"></i><span class="d-none d-md-inline">Maps API</span>`;
            if (activeDot) activeDot.classList.add('d-none');
        }
    }
}

// Auto-initialize key status when script loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => updateKeyStatusBadge(!!getGoogleMapsApiKey()));
    } else {
        updateKeyStatusBadge(!!getGoogleMapsApiKey());
    }
}

// -------------------------------------------------------------
// 1. Live EV Stations Map with Live Location Beacon
// -------------------------------------------------------------

/**
 * Initializes the main interactive Google Map showing all charging stations
 */
function initGoogleStationsMap(mapElementId, stations, defaultLat, defaultLng, defaultZoom) {
    const mapEl = document.getElementById(mapElementId);
    if (!mapEl) return;

    loadGoogleMapsScript(function () {
        if (!window.google || !window.google.maps) {
            initLeafletFallback(mapElementId, stations, defaultLat, defaultLng, defaultZoom);
            return;
        }

        const centerLat = defaultLat || 12.9716; // Bengaluru default
        const centerLng = defaultLng || 77.5946;
        const zoom = defaultZoom || 12;

        const mapOptions = {
            center: { lat: centerLat, lng: centerLng },
            zoom: zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                { featureType: 'poi.business', stylers: [{ visibility: 'simplified' }] },
                { featureType: 'transit.station', stylers: [{ visibility: 'on' }] }
            ]
        };

        googleStationsMap = new google.maps.Map(mapEl, mapOptions);
        currentInfoWindow = new google.maps.InfoWindow();

        // Add custom Map controls (Live GPS Tracker & Quick City Jump)
        addLiveLocationControls(googleStationsMap, stations);

        // Plot Stations
        plotStationsOnGoogleMap(stations);

        // Start live GPS tracking
        startLiveGpsTracking(googleStationsMap, stations);
    });
}

/**
 * Plots all charging stations with custom EV pins and InfoWindows
 */
function plotStationsOnGoogleMap(stations) {
    if (!stations || !googleStationsMap) return;

    // Clear existing markers
    stationMarkers.forEach(m => m.setMap(null));
    stationMarkers = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    stations.forEach(st => {
        if (st.latitude && st.longitude) {
            const lat = parseFloat(st.latitude);
            const lng = parseFloat(st.longitude);
            const pos = new google.maps.LatLng(lat, lng);
            bounds.extend(pos);
            hasPoints = true;

            const fast = st.chargingTypes ? st.chargingTypes.find(t => t.chargingType === 'FAST') : null;
            const normal = st.chargingTypes ? st.chargingTypes.find(t => t.chargingType === 'NORMAL') : null;

            // Custom SVG EV Pin Marker Icon
            const markerSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
                    <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35"/>
                        </filter>
                    </defs>
                    <path d="M19 0 C8.5 0 0 8.5 0 19 C0 31.5 19 48 19 48 C19 48 38 31.5 38 19 C38 8.5 29.5 0 19 0 Z" fill="#10b981" filter="url(#shadow)"/>
                    <circle cx="19" cy="18" r="14" fill="#ffffff"/>
                    <path d="M21 9 L13 19 L18 19 L17 27 L25 17 L20 17 Z" fill="#047857"/>
                </svg>
            `;

            const marker = new google.maps.Marker({
                position: pos,
                map: googleStationsMap,
                title: st.name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
                    scaledSize: new google.maps.Size(38, 48),
                    anchor: new google.maps.Point(19, 48)
                },
                animation: google.maps.Animation.DROP
            });

            // Calculate distance if live coordinates exist
            let distanceHtml = '';
            if (st.distanceKm !== undefined && st.distanceKm !== null) {
                distanceHtml = `<div class="badge bg-success-subtle text-success border border-success mt-1 mb-2">
                    <i class="bi bi-geo-alt-fill me-1"></i> ${st.distanceKm} km away from your live location
                </div>`;
            } else if (userLiveCoords.hasGps) {
                const dist = calculateHaversineKm(userLiveCoords.lat, userLiveCoords.lng, lat, lng);
                distanceHtml = `<div class="badge bg-success-subtle text-success border border-success mt-1 mb-2">
                    <i class="bi bi-geo-alt-fill me-1"></i> ${dist.toFixed(1)} km away (Live GPS)
                </div>`;
            }

            // InfoWindow Content formatted with Indian Rupee (₹) & exact Google Locations
            const originParam = userLiveCoords.hasGps ? `&origin=${userLiveCoords.lat},${userLiveCoords.lng}` : '';
            const directionsUrl = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${lat},${lng}&travelmode=driving`;
            const exactSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

            const infoContent = `
                <div style="max-width: 290px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="badge bg-success text-white small"><i class="bi bi-ev-station"></i> Active EV Hub</span>
                        <span class="text-warning small">★ ${st.averageRating || '4.9'}</span>
                    </div>
                    <h6 class="fw-bold mb-1 text-dark" style="font-size: 15px;">${st.name}</h6>
                    <p class="small text-muted mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${st.address}, ${st.city}</p>
                    <p class="small text-secondary mb-2"><i class="bi bi-clock me-1"></i> ${st.openingTime || '06:00'} - ${st.closingTime || '23:30'}</p>
                    ${distanceHtml}
                    
                    <div style="background: #f8fafc; border-radius: 6px; padding: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge bg-warning text-dark small" style="font-size: 10px;">⚡ FAST DC</span>
                            <strong class="text-dark">₹${fast ? fast.pricePerSlot.toFixed(2) : '280.00'}<small class="text-muted">/slot</small></strong>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-info text-dark small" style="font-size: 10px;">🔌 NORMAL AC</span>
                            <strong class="text-dark">₹${normal ? normal.pricePerSlot.toFixed(2) : '95.00'}<small class="text-muted">/slot</small></strong>
                        </div>
                    </div>

                    <div class="d-grid gap-2">
                        <a href="station-detail?id=${st.id}" class="btn btn-sm btn-success text-white fw-bold">
                            <i class="bi bi-lightning-charge me-1"></i> Book Slot Now (₹)
                        </a>
                        <a href="${directionsUrl}" target="_blank" class="btn btn-sm btn-primary text-white fw-semibold">
                            <i class="bi bi-cursor-fill me-1"></i> Directions in Google Maps
                        </a>
                        <a href="${exactSearchUrl}" target="_blank" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-google me-1"></i> Exact Google Location Pin
                        </a>
                    </div>
                </div>
            `;

            marker.addListener('click', function () {
                currentInfoWindow.setContent(infoContent);
                currentInfoWindow.open(googleStationsMap, marker);
            });

            stationMarkers.push(marker);
        }
    });

    if (hasPoints && stationMarkers.length > 1) {
        googleStationsMap.fitBounds(bounds);
    }
}

/**
 * Adds Live Location HUD & Quick City Jumper onto Google Maps
 */
function addLiveLocationControls(map, stations) {
    const controlDiv = document.createElement('div');
    controlDiv.style.cssText = 'margin: 10px; z-index: 5;';
    controlDiv.innerHTML = `
        <div class="btn-group shadow-sm" role="group">
            <button type="button" id="recenterGpsBtn" class="btn btn-light btn-sm fw-semibold border" title="Center map on your live GPS location">
                <i class="bi bi-crosshair text-primary me-1"></i> My Live Location
            </button>
            <button type="button" id="findNearestGpsBtn" class="btn btn-light btn-sm fw-semibold border" title="Locate closest charging station to you">
                <i class="bi bi-lightning-charge-fill text-success me-1"></i> Nearest Hub
            </button>
            <button type="button" class="btn btn-light btn-sm fw-semibold border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-geo-alt text-danger me-1"></i> Jump City
            </button>
            <ul class="dropdown-menu shadow">
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(12.9716, 77.5946, 12)">Bengaluru (Silicon Hub)</a></li>
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(17.4504, 78.3811, 12)">Hyderabad (Hitec City)</a></li>
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(19.0657, 72.8687, 12)">Mumbai (BKC Hub)</a></li>
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(28.6315, 77.2167, 12)">Delhi NCR (Connaught Place)</a></li>
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(12.9345, 80.2312, 12)">Chennai (OMR Corridor)</a></li>
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(18.5913, 73.7389, 12)">Pune (Hinjewadi IT Park)</a></li>
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(28.4952, 77.0891, 12)">Gurgaon (DLF Cyber City)</a></li>
                <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(22.5804, 88.4328, 12)">Kolkata (Salt Lake Sector V)</a></li>
            </ul>
            <button type="button" onclick="openGoogleMapsKeyModal()" class="btn btn-light btn-sm fw-semibold border text-warning-emphasis" title="Configure Google Maps API Key">
                <i class="bi bi-key-fill me-1"></i> Maps API
            </button>
        </div>
    `;

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);

    const recenterBtn = controlDiv.querySelector('#recenterGpsBtn');
    if (recenterBtn) {
        recenterBtn.addEventListener('click', function () {
            if (userLiveCoords.hasGps) {
                map.panTo({ lat: userLiveCoords.lat, lng: userLiveCoords.lng });
                map.setZoom(15);
                if (userLocationMarker) {
                    userLocationMarker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(() => userLocationMarker.setAnimation(null), 1500);
                }
            } else {
                locateUserNearby();
            }
        });
    }

    const nearestBtn = controlDiv.querySelector('#findNearestGpsBtn');
    if (nearestBtn) {
        nearestBtn.addEventListener('click', function () {
            findNearestStation(stations);
        });
    }
}

/**
 * Helper to jump map center to an Indian metropolitan city (Google Maps or Leaflet)
 */
function centerMapOnCity(lat, lng, zoom) {
    if (googleStationsMap) {
        googleStationsMap.panTo({ lat, lng });
        googleStationsMap.setZoom(zoom || 12);
    } else if (activeLeafletMap) {
        activeLeafletMap.setView([lat, lng], zoom || 12);
    }
}
window.centerMapOnCity = centerMapOnCity;

/**
 * Finds and focuses the closest EV charging station from current live coordinates
 */
function findNearestStation(stations) {
    if (!stations || !stations.length) return;
    const lat = userLiveCoords.hasGps ? userLiveCoords.lat : 12.9716;
    const lng = userLiveCoords.hasGps ? userLiveCoords.lng : 77.5946;
    let nearest = null;
    let minD = Infinity;

    stations.forEach(st => {
        if (st.latitude && st.longitude) {
            const d = calculateHaversineKm(lat, lng, parseFloat(st.latitude), parseFloat(st.longitude));
            if (d < minD) {
                minD = d;
                nearest = st;
            }
        }
    });

    if (nearest) {
        const nLat = parseFloat(nearest.latitude);
        const nLng = parseFloat(nearest.longitude);
        if (googleStationsMap) {
            googleStationsMap.panTo({ lat: nLat, lng: nLng });
            googleStationsMap.setZoom(15);
            const m = stationMarkers.find(marker => marker.getTitle() === nearest.name);
            if (m && currentInfoWindow) {
                google.maps.event.trigger(m, 'click');
            }
        } else if (activeLeafletMap) {
            activeLeafletMap.flyTo([nLat, nLng], 15);
            const lm = leafletMarkers.find(marker => marker._stationId === nearest.id);
            if (lm) lm.openPopup();
        }
    }
}
window.findNearestStation = findNearestStation;

/**
 * Updates DOM live radar indicator with exact live coordinates
 */
function updateLiveGpsHud(lat, lng, acc) {
    const radarPing = document.querySelector('.map-radar-ping');
    if (radarPing) {
        radarPing.innerHTML = `
            <span class="live-dot" style="background: #3b82f6; box-shadow: 0 0 10px #3b82f6;"></span>
            <span style="color: #60a5fa; font-weight: 700;">Live GPS:</span>
            <span class="font-monospace">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (&plusmn;${Math.round(acc || 15)}m)</span>
        `;
    }
}

/**
 * Continuous GPS live tracking using navigator.geolocation
 */
function startLiveGpsTracking(map, stations) {
    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser.');
        return;
    }

    const onPos = function (pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        userLiveCoords = {
            lat: lat,
            lng: lng,
            accuracy: acc,
            hasGps: true
        };

        const userLatLng = new google.maps.LatLng(lat, lng);

        // Update live radar HUD
        updateLiveGpsHud(lat, lng, acc);

        // Pulsing Blue Radar Beacon for Live User Location
        const userIconSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#3b82f6" fill-opacity="0.25"/>
                <circle cx="16" cy="16" r="9" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/>
                <circle cx="16" cy="16" r="3.5" fill="#ffffff"/>
            </svg>
        `;

        if (!userLocationMarker) {
            userLocationMarker = new google.maps.Marker({
                position: userLatLng,
                map: map,
                title: 'Your Live Location (GPS)',
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(userIconSvg),
                    scaledSize: new google.maps.Size(32, 32),
                    anchor: new google.maps.Point(16, 16)
                },
                zIndex: 999
            });

            // Accuracy circle
            userAccuracyCircle = new google.maps.Circle({
                strokeColor: '#3b82f6',
                strokeOpacity: 0.5,
                strokeWeight: 1.5,
                fillColor: '#3b82f6',
                fillOpacity: 0.12,
                map: map,
                center: userLatLng,
                radius: acc || 50
            });

            const userPosInfo = new google.maps.InfoWindow({
                content: `
                    <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 210px;">
                        <div class="fw-bold text-primary mb-1"><i class="bi bi-broadcast me-1"></i> You Are Here (Live GPS)</div>
                        <div class="small text-muted mb-1">Lat: <b>${lat.toFixed(6)}</b>, Lng: <b>${lng.toFixed(6)}</b></div>
                        <div class="small text-secondary mb-2"><i class="bi bi-shield-check text-success"></i> High-accuracy GPS: &plusmn;${Math.round(acc || 15)}m</div>
                        <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn btn-sm btn-outline-primary w-100">
                            <i class="bi bi-google me-1"></i> View Live Location on Google Maps
                        </a>
                    </div>
                `
            });

            userLocationMarker.addListener('click', () => {
                userPosInfo.open(map, userLocationMarker);
            });
        } else {
            userLocationMarker.setPosition(userLatLng);
            if (userAccuracyCircle) {
                userAccuracyCircle.setCenter(userLatLng);
                userAccuracyCircle.setRadius(acc || 50);
            }
        }

        // Update live distance indicators across the station list
        updateLiveStationDistances(lat, lng, stations);
    };

    // Immediate initial fix + continuous watch
    navigator.geolocation.getCurrentPosition(onPos, (err) => console.log('Initial GPS fix:', err.message), { enableHighAccuracy: true, timeout: 8000 });

    if (liveWatchId !== null) {
        navigator.geolocation.clearWatch(liveWatchId);
    }
    liveWatchId = navigator.geolocation.watchPosition(onPos, (err) => console.warn('Live geolocation watch warning:', err.message), { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
}

/**
 * Updates distances in cards when live user location is detected
 */
function updateLiveStationDistances(userLat, userLng, stations) {
    if (!stations) return;
    stations.forEach(st => {
        if (st.latitude && st.longitude) {
            const dist = calculateHaversineKm(userLat, userLng, parseFloat(st.latitude), parseFloat(st.longitude));
            st.distanceKm = parseFloat(dist.toFixed(1));
            
            // Update DOM element if exists
            const distBadge = document.getElementById(`station-dist-${st.id}`);
            if (distBadge) {
                distBadge.innerHTML = `<i class="bi bi-cursor-fill me-1"></i> ${st.distanceKm} km away (Live GPS)`;
                distBadge.classList.remove('d-none');
            }
        }
    });
}

/**
 * Haversine Great Circle Distance formula (returns distance in km)
 */
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// -------------------------------------------------------------
// 2. Operator Coordinate Picker with Places Autocomplete
// -------------------------------------------------------------

/**
 * Initializes interactive Google Map with Draggable Pin & Places search for Operator
 */
function initGoogleCoordinatePicker(mapElementId, latInputId, lngInputId, initLat, initLng) {
    const mapEl = document.getElementById(mapElementId);
    if (!mapEl) return;

    loadGoogleMapsScript(function () {
        if (!window.google || !window.google.maps) {
            initLeafletPickerFallback(mapElementId, latInputId, lngInputId, initLat, initLng);
            return;
        }

        const lat = initLat || 12.9716;
        const lng = initLng || 77.5946;
        const startPos = { lat: lat, lng: lng };

        googlePickerMap = new google.maps.Map(mapEl, {
            center: startPos,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false
        });

        // Draggable Marker
        const marker = new google.maps.Marker({
            position: startPos,
            map: googlePickerMap,
            draggable: true,
            animation: google.maps.Animation.DROP,
            title: "Drag to station's exact location"
        });

        function updateInputs(position) {
            const latVal = typeof position.lat === 'function' ? position.lat() : position.lat;
            const lngVal = typeof position.lng === 'function' ? position.lng() : position.lng;
            const latInput = document.getElementById(latInputId);
            const lngInput = document.getElementById(lngInputId);
            if (latInput) latInput.value = parseFloat(latVal).toFixed(6);
            if (lngInput) lngInput.value = parseFloat(lngVal).toFixed(6);
        }

        updateInputs(startPos);

        marker.addListener('dragend', function (e) {
            updateInputs(e.latLng);
        });

        googlePickerMap.addListener('click', function (e) {
            marker.setPosition(e.latLng);
            updateInputs(e.latLng);
        });

        // Add GPS "Current Location" Button inside the picker
        const btnDiv = document.createElement('div');
        btnDiv.style.cssText = 'margin: 10px;';
        btnDiv.innerHTML = `
            <button type="button" class="btn btn-sm btn-dark shadow-sm">
                <i class="bi bi-crosshair me-1"></i> Pick My Current GPS Location
            </button>
        `;
        btnDiv.querySelector('button').addEventListener('click', function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    googlePickerMap.setCenter(myPos);
                    googlePickerMap.setZoom(16);
                    marker.setPosition(myPos);
                    updateInputs(myPos);
                });
            }
        });
        googlePickerMap.controls[google.maps.ControlPosition.TOP_LEFT].push(btnDiv);

        // Places Autocomplete Search Box if library is ready
        const searchInput = document.getElementById('stationAddressSearch');
        if (searchInput && google.maps.places) {
            const autocomplete = new google.maps.places.Autocomplete(searchInput);
            autocomplete.bindTo('bounds', googlePickerMap);
            autocomplete.addListener('place_changed', function () {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) return;

                googlePickerMap.setCenter(place.geometry.location);
                googlePickerMap.setZoom(16);
                marker.setPosition(place.geometry.location);
                updateInputs(place.geometry.location);
            });
        }
    });
}

// -------------------------------------------------------------
// 3. Station Details Mini-Map
// -------------------------------------------------------------

/**
 * Initializes a focused mini Google Map on the station details page
 */
function initGoogleStationDetailMap(mapElementId, lat, lng, stationName, address) {
    const mapEl = document.getElementById(mapElementId);
    if (!mapEl) return;

    loadGoogleMapsScript(function () {
        if (!window.google || !window.google.maps) {
            initLeafletDetailFallback(mapElementId, lat, lng, stationName, address);
            return;
        }

        const pos = { lat: parseFloat(lat), lng: parseFloat(lng) };
        googleDetailMap = new google.maps.Map(mapEl, {
            center: pos,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        const marker = new google.maps.Marker({
            position: pos,
            map: googleDetailMap,
            title: stationName,
            animation: google.maps.Animation.DROP
        });

        const info = new google.maps.InfoWindow({
            content: `
                <div class="p-1">
                    <h6 class="fw-bold mb-1">${stationName}</h6>
                    <p class="small text-muted mb-2">${address}</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="btn btn-sm btn-primary text-white">
                        <i class="bi bi-sign-turn-right me-1"></i> Get Directions
                    </a>
                </div>
            `
        });
        info.open(googleDetailMap, marker);
        marker.addListener('click', () => info.open(googleDetailMap, marker));
    });
}

// -------------------------------------------------------------
// 4. Geolocation Action (Nearby Stations Trigger)
// -------------------------------------------------------------

/**
 * Triggers Browser Geolocation to find nearby stations with radius
 */
function locateUserNearby() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    const btn = document.getElementById('locateNearbyBtn');
    if (btn) btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Locating GPS...';

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            window.location.href = `stations?nearby=true&lat=${lat}&lng=${lng}&radius=35`;
        },
        function (error) {
            alert("Unable to retrieve your location: " + error.message + "\nTip: Select a city from the filter dropdown.");
            if (btn) btn.innerHTML = '<i class="bi bi-crosshair me-1"></i> Find Stations Near Me';
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
}

// -------------------------------------------------------------
// 5. Leaflet Fallback (If Google Maps key is missing or offline)
// -------------------------------------------------------------

function initLeafletFallback(mapElementId, stations, defaultLat, defaultLng, defaultZoom) {
    if (typeof L === 'undefined') return;
    const mapEl = document.getElementById(mapElementId);
    if (!mapEl) return;

    showGoogleMapsKeyBanner('Running in standard map mode. Connect your Google Maps API Key to unlock Google Street View and live transit.');

    const centerLat = defaultLat || 12.9716;
    const centerLng = defaultLng || 77.5946;
    const map = L.map(mapElementId).setView([centerLat, centerLng], defaultZoom || 12);
    activeLeafletMap = map;
    leafletMarkers = [];

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | VoltSpot EV'
    }).addTo(map);

    // Custom On-Map Toolbar for Leaflet
    const customControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function () {
            const div = L.DomUtil.create('div', 'leaflet-bar shadow-sm');
            div.style.background = 'transparent';
            div.style.border = 'none';
            div.innerHTML = `
                <div class="btn-group btn-group-sm bg-white p-1 rounded-3 shadow-sm border" role="group">
                    <button type="button" id="recenterLeafletGpsBtn" class="btn btn-light btn-sm fw-semibold border" title="Center map on your live GPS location">
                        <i class="bi bi-crosshair text-primary me-1"></i> My Live Location
                    </button>
                    <button type="button" id="findNearestLeafletBtn" class="btn btn-light btn-sm fw-semibold border" title="Locate closest charging station to you">
                        <i class="bi bi-lightning-charge-fill text-success me-1"></i> Nearest Hub
                    </button>
                    <button type="button" class="btn btn-light btn-sm fw-semibold border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-geo-alt text-danger me-1"></i> Jump City
                    </button>
                    <ul class="dropdown-menu shadow">
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(12.9716, 77.5946, 12)">Bengaluru (Silicon Hub)</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(17.4504, 78.3811, 12)">Hyderabad (Hitec City)</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(19.0657, 72.8687, 12)">Mumbai (BKC Hub)</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(28.6315, 77.2167, 12)">Delhi NCR (Connaught Place)</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(12.9345, 80.2312, 12)">Chennai (OMR Corridor)</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(18.5913, 73.7389, 12)">Pune (Hinjewadi IT Park)</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(28.4952, 77.0891, 12)">Gurgaon (DLF Cyber City)</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="centerMapOnCity(22.5804, 88.4328, 12)">Kolkata (Salt Lake Sector V)</a></li>
                    </ul>
                    <button type="button" onclick="openGoogleMapsKeyModal()" class="btn btn-light btn-sm fw-semibold border text-warning-emphasis" title="Configure Google Maps API Key">
                        <i class="bi bi-key-fill me-1"></i> Maps API
                    </button>
                </div>
            `;
            L.DomEvent.disableClickPropagation(div);
            return div;
        }
    });
    map.addControl(new customControl());

    setTimeout(() => {
        const rBtn = document.getElementById('recenterLeafletGpsBtn');
        if (rBtn) {
            rBtn.addEventListener('click', () => {
                if (userLiveCoords.hasGps) {
                    map.flyTo([userLiveCoords.lat, userLiveCoords.lng], 15);
                    if (leafletUserMarker) leafletUserMarker.openPopup();
                } else {
                    locateUserNearby();
                }
            });
        }
        const nBtn = document.getElementById('findNearestLeafletBtn');
        if (nBtn) {
            nBtn.addEventListener('click', () => findNearestStation(stations));
        }
    }, 200);

    const greenIcon = L.divIcon({
        className: 'custom-ev-pin',
        html: '<div style="background-color:#10b981; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.4); border:2px solid #fff;"><i class="bi bi-lightning-charge-fill" style="font-size:19px;"></i></div>',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -32]
    });

    if (stations && stations.length > 0) {
        const bounds = [];
        stations.forEach(st => {
            if (st.latitude && st.longitude) {
                const lat = parseFloat(st.latitude);
                const lng = parseFloat(st.longitude);
                bounds.push([lat, lng]);

                const fast = st.chargingTypes ? st.chargingTypes.find(t => t.chargingType === 'FAST') : null;
                const normal = st.chargingTypes ? st.chargingTypes.find(t => t.chargingType === 'NORMAL') : null;

                const originParam = userLiveCoords.hasGps ? `&origin=${userLiveCoords.lat},${userLiveCoords.lng}` : '';
                const directionsUrl = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${lat},${lng}&travelmode=driving`;
                const exactSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

                let distBadge = '';
                if (st.distanceKm !== undefined && st.distanceKm !== null) {
                    distBadge = `<div class="badge bg-success-subtle text-success border border-success mb-2"><i class="bi bi-geo-alt-fill me-1"></i> ${st.distanceKm} km away from your live location</div>`;
                } else if (userLiveCoords.hasGps) {
                    const dist = calculateHaversineKm(userLiveCoords.lat, userLiveCoords.lng, lat, lng);
                    distBadge = `<div class="badge bg-success-subtle text-success border border-success mb-2"><i class="bi bi-geo-alt-fill me-1"></i> ${dist.toFixed(1)} km away (Live GPS)</div>`;
                }

                const popupHtml = `
                    <div style="min-width:270px; font-family:system-ui, -apple-system, sans-serif; padding:2px;">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge bg-success text-white small"><i class="bi bi-ev-station"></i> Active EV Hub</span>
                            <span class="text-warning small">★ ${st.averageRating || '4.9'}</span>
                        </div>
                        <h6 class="fw-bold mb-1 text-dark" style="font-size:15px;">${st.name}</h6>
                        <p class="small text-muted mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${st.address}, ${st.city}</p>
                        <p class="small text-secondary mb-2"><i class="bi bi-clock me-1"></i> ${st.openingTime || '06:00'} - ${st.closingTime || '23:30'}</p>
                        ${distBadge}
                        <div style="background:#f8fafc; border-radius:6px; padding:6px 10px; margin-bottom:8px; border:1px solid #e2e8f0;" class="small">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="badge bg-warning text-dark">FAST (DC)</span>
                                <strong class="text-dark">₹${fast ? fast.pricePerSlot.toFixed(2) : '280.00'}/slot</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="badge bg-info text-dark">NORMAL (AC)</span>
                                <strong class="text-dark">₹${normal ? normal.pricePerSlot.toFixed(2) : '95.00'}/slot</strong>
                            </div>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="station-detail?id=${st.id}" class="btn btn-sm btn-success text-white fw-bold">
                                <i class="bi bi-lightning-charge me-1"></i> Book Slot Now (₹)
                            </a>
                            <a href="${directionsUrl}" target="_blank" class="btn btn-sm btn-primary text-white fw-semibold">
                                <i class="bi bi-cursor-fill me-1"></i> Directions in Google Maps
                            </a>
                            <a href="${exactSearchUrl}" target="_blank" class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-google me-1"></i> Exact Google Location Pin
                            </a>
                        </div>
                    </div>
                `;

                const marker = L.marker([lat, lng], { icon: greenIcon }).bindPopup(popupHtml).addTo(map);
                marker._stationId = st.id;
                leafletMarkers.push(marker);
            }
        });
        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }

    // Start Live GPS Tracking in Leaflet
    startLeafletLiveGpsTracking(map, stations);
}

/**
 * Continuous Live GPS Tracking on Leaflet Map
 */
function startLeafletLiveGpsTracking(map, stations) {
    if (!navigator.geolocation) return;

    const liveIcon = L.divIcon({
        className: 'user-live-radar-container',
        html: '<div class="user-live-gps-radar"><div class="user-radar-ring"></div><div class="user-radar-dot"></div></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const onPos = function (pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        userLiveCoords = {
            lat: lat,
            lng: lng,
            accuracy: acc,
            hasGps: true
        };

        updateLiveGpsHud(lat, lng, acc);

        const popupContent = `
            <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 210px;">
                <div class="fw-bold text-primary mb-1"><i class="bi bi-broadcast me-1"></i> You Are Here (Live GPS)</div>
                <div class="small text-muted mb-1">Lat: <b>${lat.toFixed(6)}</b>, Lng: <b>${lng.toFixed(6)}</b></div>
                <div class="small text-secondary mb-2"><i class="bi bi-shield-check text-success"></i> High-accuracy GPS: &plusmn;${Math.round(acc || 15)}m</div>
                <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn btn-sm btn-outline-primary w-100">
                    <i class="bi bi-google me-1"></i> View Live Location on Google Maps
                </a>
            </div>
        `;

        if (!leafletUserMarker) {
            leafletUserMarker = L.marker([lat, lng], { icon: liveIcon, zIndexOffset: 1000 }).bindPopup(popupContent).addTo(map);
            leafletAccuracyCircle = L.circle([lat, lng], {
                radius: acc || 40,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.12,
                weight: 1.5
            }).addTo(map);
        } else {
            leafletUserMarker.setLatLng([lat, lng]);
            leafletUserMarker.setPopupContent(popupContent);
            if (leafletAccuracyCircle) {
                leafletAccuracyCircle.setLatLng([lat, lng]);
                leafletAccuracyCircle.setRadius(acc || 40);
            }
        }

        updateLiveStationDistances(lat, lng, stations);
    };

    navigator.geolocation.getCurrentPosition(onPos, (err) => console.log('Initial Leaflet GPS fix:', err.message), { enableHighAccuracy: true, timeout: 8000 });

    if (leafletWatchId !== null) {
        navigator.geolocation.clearWatch(leafletWatchId);
    }
    leafletWatchId = navigator.geolocation.watchPosition(onPos, (err) => console.warn('Leaflet GPS watch warning:', err.message), { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
}

function initLeafletPickerFallback(mapElementId, latInputId, lngInputId, initLat, initLng) {
    if (typeof L === 'undefined') return;
    const lat = initLat || 12.9716;
    const lng = initLng || 77.5946;
    const map = L.map(mapElementId).setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    function updateInputs(pos) {
        const latInput = document.getElementById(latInputId);
        const lngInput = document.getElementById(lngInputId);
        if (latInput) latInput.value = pos.lat.toFixed(6);
        if (lngInput) lngInput.value = pos.lng.toFixed(6);
    }
    updateInputs({ lat, lng });

    marker.on('dragend', function (e) {
        updateInputs(e.target.getLatLng());
    });
    map.on('click', function (e) {
        marker.setLatLng(e.latlng);
        updateInputs(e.latlng);
    });

    // Add GPS "Current Location" Button inside the picker
    const pickerControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            const div = L.DomUtil.create('div', 'leaflet-bar');
            div.style.background = 'white';
            div.style.borderRadius = '6px';
            div.innerHTML = `
                <button type="button" class="btn btn-sm btn-dark shadow-sm py-1 px-2" style="font-size:0.78rem;">
                    <i class="bi bi-crosshair me-1"></i> Pick My Current GPS Location
                </button>
            `;
            div.querySelector('button').addEventListener('click', function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        map.setView([myPos.lat, myPos.lng], 16);
                        marker.setLatLng([myPos.lat, myPos.lng]);
                        updateInputs(myPos);
                    });
                }
            });
            L.DomEvent.disableClickPropagation(div);
            return div;
        }
    });
    map.addControl(new pickerControl());
}

function initLeafletDetailFallback(mapElementId, lat, lng, stationName, address) {
    if (typeof L === 'undefined') return;
    const pos = [parseFloat(lat), parseFloat(lng)];
    const map = L.map(mapElementId).setView(pos, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const originParam = userLiveCoords.hasGps ? `&origin=${userLiveCoords.lat},${userLiveCoords.lng}` : '';
    const directionsUrl = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${lat},${lng}&travelmode=driving`;
    const exactSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    const popupHtml = `
        <div style="min-width:240px; font-family:system-ui, -apple-system, sans-serif; padding:4px;">
            <h6 class="fw-bold mb-1">${stationName}</h6>
            <p class="small text-muted mb-2">${address}</p>
            <div class="d-grid gap-1">
                <a href="${directionsUrl}" target="_blank" class="btn btn-sm btn-primary text-white fw-semibold">
                    <i class="bi bi-cursor-fill me-1"></i> Get Directions in Google Maps
                </a>
                <a href="${exactSearchUrl}" target="_blank" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-google me-1"></i> Exact Google Location Pin
                </a>
            </div>
        </div>
    `;

    L.marker(pos).addTo(map).bindPopup(popupHtml).openPopup();
}

// Aliases for backwards compatibility with all JSP templates
window.initStationMap = initGoogleStationsMap;
window.initCoordinatePicker = initGoogleCoordinatePicker;
window.initStationDetailMap = initGoogleStationDetailMap;
