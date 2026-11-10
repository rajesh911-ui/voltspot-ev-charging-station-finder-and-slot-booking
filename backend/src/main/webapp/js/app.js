/**
 * VoltSpot EV Application Client Script
 * Complete Multi-Page Animation & Interactive Systems
 */

document.addEventListener('DOMContentLoaded', function () {
    initPageAnimations();
    initBookingWidget();
    initPaymentTabs();
    initBatterySimulator();
    initStatCounters();
});

/**
 * 1. Global Page Motion & Animation Initializer
 */
function initPageAnimations() {
    // Add staggered entrance to container cards
    const mainCards = document.querySelectorAll('.card, .station-card, .stat-card');
    mainCards.forEach((card, idx) => {
        if (!card.classList.contains('no-anim')) {
            card.style.opacity = '0';
            card.style.animation = `pageFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(idx * 0.06, 0.6)}s forwards`;
        }
    });

    // Add entrance animation to table rows
    const tableRows = document.querySelectorAll('.table tbody tr');
    tableRows.forEach((row, idx) => {
        row.style.opacity = '0';
        row.style.animation = `pageFadeInUp 0.4s ease ${Math.min(idx * 0.04, 0.5)}s forwards`;
    });

    // Add laser scanner to UPI QR code container
    const upiQrContainer = document.querySelector('.upi-qr-card, #upiPaymentSection .bg-light');
    if (upiQrContainer && !upiQrContainer.querySelector('.qr-laser-line')) {
        const laser = document.createElement('div');
        laser.className = 'qr-laser-line';
        upiQrContainer.style.position = 'relative';
        upiQrContainer.appendChild(laser);
    }
}

/**
 * 2. Animated Numeric Counter
 */
function initStatCounters() {
    const counterEls = document.querySelectorAll('.counter-val, [data-counter]');
    counterEls.forEach(el => {
        const targetText = el.textContent.trim().replace(/[^0-9.]/g, '');
        const target = parseFloat(targetText);
        if (isNaN(target)) return;

        const prefix = el.textContent.includes('₹') ? '₹' : '';
        const suffix = el.textContent.includes('+') ? '+' : (el.textContent.includes('%') ? '%' : '');
        const duration = 1200; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(easeProgress * target);

            el.textContent = `${prefix}${current.toLocaleString('en-IN')}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = `${prefix}${target.toLocaleString('en-IN')}${suffix}`;
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

/**
 * 3. Interactive Animated EV Battery Charging Simulator
 */
function initBatterySimulator() {
    const batteryContainer = document.getElementById('evBatterySimulator');
    if (!batteryContainer) return;

    const slider = document.getElementById('batteryCurrentSlider');
    const fillBar = document.getElementById('batteryFillBar');
    const percentLabel = document.getElementById('batteryPercentLabel');
    const timeEstLabel = document.getElementById('batteryTimeEstimate');
    const costEstLabel = document.getElementById('batteryCostEstimate');

    if (!slider || !fillBar) return;

    function updateSimulation() {
        const curPct = parseInt(slider.value, 10);
        const targetPct = 80; // Standard fast-charge ceiling
        const neededPct = Math.max(0, targetPct - curPct);
        
        // Approximate for a 40 kWh Indian EV battery (Tata Nexon EV / MG ZS EV)
        const batteryKwh = 40.5;
        const energyNeededKwh = (neededPct / 100) * batteryKwh;
        
        // Assume Fast DC charger (120 kW average output)
        const chargingSpeedKw = 120;
        const hoursNeeded = energyNeededKwh / chargingSpeedKw;
        const minutesNeeded = Math.round(hoursNeeded * 60);

        // Approximate price at ₹280 per 1-hour slot
        const estimatedCost = Math.max(120, Math.round(hoursNeeded * 280));

        fillBar.style.width = `${curPct}%`;
        fillBar.style.animation = 'none'; // Use slider value
        
        if (curPct < 25) {
            fillBar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        } else if (curPct < 60) {
            fillBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        } else {
            fillBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
        }

        if (percentLabel) percentLabel.textContent = `${curPct}%`;
        if (timeEstLabel) timeEstLabel.textContent = curPct >= 80 ? 'Battery already charged (80%+)' : `~${minutesNeeded} mins to 80%`;
        if (costEstLabel) costEstLabel.textContent = `₹${estimatedCost.toFixed(2)}`;
    }

    slider.addEventListener('input', updateSimulation);
    updateSimulation();
}

/**
 * Global Toast Notification Helper
 */
window.showToast = function (message, type) {
    const existing = document.getElementById('voltspot-toast-container');
    let container = existing;
    if (!container) {
        container = document.createElement('div');
        container.id = 'voltspot-toast-container';
        container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    toast.className = `toast show align-items-center text-white ${isSuccess ? 'bg-success' : 'bg-primary'} border-0 shadow-lg anim-scale-in`;
    toast.style.cssText = 'min-width: 280px; backdrop-filter: blur(8px); border-radius: 12px;';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center">
                <i class="bi ${isSuccess ? 'bi-check-circle-fill' : 'bi-info-circle-fill'} fs-5 me-2"></i>
                <span class="small fw-semibold">${message}</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

/**
 * Initializes interactive booking widget on Station Details page
 */
function initBookingWidget() {
    const bookingForm = document.getElementById('slotBookingForm');
    if (!bookingForm) return;

    const stationId = document.getElementById('bookingStationId').value;
    const dateInput = document.getElementById('bookingDate');
    const typeRadios = document.querySelectorAll('input[name="chargingType"]');
    const slotContainer = document.getElementById('slotGridContainer');
    const selectedSlotInput = document.getElementById('selectedTimeSlot');
    const priceDisplay = document.getElementById('totalPricePreview');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (dateInput && !dateInput.value) {
        dateInput.min = today;
        dateInput.value = today;
    }

    function fetchAvailability() {
        const selectedType = document.querySelector('input[name="chargingType"]:checked');
        if (!selectedType || !dateInput.value) return;

        const chargingType = selectedType.value;
        const date = dateInput.value;
        const pricePerSlot = parseFloat(selectedType.getAttribute('data-price') || '0');

        slotContainer.innerHTML = '<div class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Checking real-time slot availability...</div>';

        const url = `${window.location.origin}${window.location.pathname.substring(0, window.location.pathname.indexOf('/', 1) > 0 ? window.location.pathname.indexOf('/', 1) : 0)}/check-slot-availability?stationId=${stationId}&chargingType=${encodeURIComponent(chargingType)}&date=${encodeURIComponent(date)}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                renderSlots(data, pricePerSlot);
            })
            .catch(err => {
                console.error("Availability check failed:", err);
                slotContainer.innerHTML = '<div class="alert alert-warning py-2 mb-0">Could not refresh live slots. Standard slots available below.</div>';
            });
    }

    function renderSlots(slots, pricePerSlot) {
        slotContainer.innerHTML = '';
        selectedSlotInput.value = '';
        if (priceDisplay) priceDisplay.textContent = `₹${pricePerSlot.toFixed(2)}`;

        if (!slots || slots.length === 0) {
            slotContainer.innerHTML = '<div class="text-danger py-2">No slots configured for this charging type.</div>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'slot-grid';

        slots.forEach(item => {
            const btn = document.createElement('div');
            btn.className = `slot-btn ${item.isFull ? 'disabled' : ''}`;
            btn.setAttribute('data-slot', item.slot);

            const statusText = item.isFull ? 'Fully Booked' : `${item.available} Left`;
            btn.innerHTML = `
                <div class="slot-time">${item.slot}</div>
                <div class="slot-status ${item.isFull ? 'text-danger' : 'text-success'}">${statusText}</div>
            `;

            if (!item.isFull) {
                btn.addEventListener('click', function () {
                    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedSlotInput.value = item.slot;
                });
            }

            grid.appendChild(btn);
        });

        slotContainer.appendChild(grid);
    }

    // Attach listeners
    if (dateInput) {
        dateInput.addEventListener('change', fetchAvailability);
    }
    typeRadios.forEach(radio => {
        radio.addEventListener('change', fetchAvailability);
    });

    // Initial load
    fetchAvailability();
}

/**
 * Payment method selection & switcher
 */
function initPaymentTabs() {
    const methodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const cardSection = document.getElementById('cardPaymentSection');
    const upiSection = document.getElementById('upiPaymentSection');
    const netbankingSection = document.getElementById('netbankingPaymentSection');
    const walletSection = document.getElementById('walletPaymentSection');

    if (!methodRadios.length) return;

    function switchMethod() {
        const selected = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selected) return;

        const val = selected.value;
        if (cardSection) cardSection.style.display = (val === 'CARD') ? 'block' : 'none';
        if (upiSection) upiSection.style.display = (val === 'UPI') ? 'block' : 'none';
        if (netbankingSection) netbankingSection.style.display = (val === 'NET_BANKING') ? 'block' : 'none';
        if (walletSection) walletSection.style.display = (val === 'WALLET') ? 'block' : 'none';
    }

    methodRadios.forEach(r => r.addEventListener('change', switchMethod));
    switchMethod();
}

/**
 * Print Invoice
 */
function printInvoice() {
    window.print();
}

