<template>
  <div
    class="relative overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
  >
    <!-- Map Container -->
    <div
      ref="mapContainer"
      class="w-full h-96 md:h-[500px] bg-gray-100 dark:bg-gray-700"
    >
      <!-- Loading State -->
      <div
        v-if="mapLoading"
        class="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-700"
      >
        <div class="text-center">
          <div
            class="w-12 h-12 mx-auto mb-3 border-b-2 border-blue-600 rounded-full animate-spin"
          ></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="mapError"
        class="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-700"
      >
        <div class="text-center">
          <svg
            class="w-12 h-12 mx-auto mb-3 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ mapError }}</p>
        </div>
      </div>
    </div>

    <!-- Map Legend -->
    <div
      class="absolute z-10 p-3 m-4 bg-white rounded-lg shadow-lg top-2 right-2 dark:bg-gray-800"
    >
      <div class="space-y-2 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-orange-500 rounded"></div>
          <span class="text-gray-700 dark:text-gray-300">Warehouse Origin</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span class="text-gray-700 dark:text-gray-300"
            >Current Location (Truck)</span
          >
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-500 rounded-full"></div>
          <span class="text-gray-700 dark:text-gray-300">Delivery Address</span>
        </div>
        <div v-if="route && route.length > 0" class="flex items-center gap-2">
          <div class="w-8 h-0.5 bg-blue-600"></div>
          <span class="text-gray-700 dark:text-gray-300">Route</span>
        </div>
      </div>
    </div>

    <!-- Distance Info -->
    <div
      v-if="distanceInfo"
      class="absolute z-10 p-3 m-4 bg-white rounded-lg shadow-lg bottom-2 left-2 dark:bg-gray-800"
    >
      <div class="space-y-1 text-xs">
        <div class="flex items-center gap-2">
          <svg
            class="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          <span class="font-semibold text-gray-900 dark:text-white">{{
            distanceInfo.distance
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <svg
            class="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-gray-700 dark:text-gray-300">{{
            distanceInfo.duration
          }}</span>
        </div>
      </div>
    </div>

    <!-- Location Accuracy Notice -->
    <div
      class="absolute z-10 px-3 py-2 m-4 text-xs bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg bottom-2 right-2 dark:bg-yellow-900/30 dark:border-yellow-700"
    >
      <div class="flex items-start gap-2">
        <svg
          class="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <p class="font-semibold text-yellow-800 dark:text-yellow-400">
            Approximate Location
          </p>
          <p class="mt-0.5 text-yellow-700 dark:text-yellow-500">
            Delivery pin shows city center, not exact address
          </p>
        </div>
      </div>
    </div>

    <!-- Refresh Button -->
    <button
      @click="refreshLocation"
      :disabled="refreshing"
      class="absolute z-10 p-2 transition-colors bg-white rounded-lg shadow-lg top-2 left-2 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
      title="Refresh location"
    >
      <svg
        class="w-5 h-5 text-gray-700 dark:text-gray-300"
        :class="{ 'animate-spin': refreshing }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Props
const props = defineProps({
  origin: {
    type: Object,
    required: true,
    validator: (val) => val && val.lat && val.lng,
  },
  destination: {
    type: Object,
    required: true,
    validator: (val) => val && val.lat && val.lng,
  },
  currentLocation: {
    type: Object,
    default: null,
  },
  route: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["location-updated"]);

// Refs
const mapContainer = ref(null);
const map = ref(null);
const mapLoading = ref(true);
const mapError = ref(null);
const refreshing = ref(false);

const originMarker = ref(null);
const currentMarker = ref(null);
const destinationMarker = ref(null);
const routePolyline = ref(null);

// Computed
const distanceInfo = computed(() => {
  if (!props.currentLocation || !props.destination) return null;

  const current = props.currentLocation || props.origin;
  const distance = calculateDistance(
    current.lat,
    current.lng,
    props.destination.lat,
    props.destination.lng
  );

  return {
    distance: `${distance.toFixed(1)} km`,
    duration: `~${Math.ceil(distance / 50)} hours`,
  };
});

// Methods
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function initMap() {
  try {
    mapLoading.value = true;
    mapError.value = null;

    await nextTick();

    if (!mapContainer.value) {
      throw new Error("Map container not found");
    }

    const currentLoc = props.currentLocation || props.origin;

    // Initialize Leaflet map
    map.value = L.map(mapContainer.value, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([currentLoc.lat, currentLoc.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map.value);

    // Add markers and route
    addMarkers();
    drawRoute();

    mapLoading.value = false;
  } catch (error) {
    console.error("Failed to load map:", error);
    mapError.value = "Failed to load map. Please try again.";
    mapLoading.value = false;
  }
}

function addMarkers() {
  if (!map.value) return;

  // 1. Origin/Warehouse marker (orange warehouse icon)
  const originIcon = L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="position: relative;">
        <div style="
          width: 36px;
          height: 36px;
          background: #f97316;
          border: 3px solid white;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg style="width: 20px; height: 20px;" fill="white" viewBox="0 0 24 24">
            <path d="M21 16V8c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-11 0H5V8h5v8zm7-8v8h-5V8h5zM3 4h18v2H3z"/>
          </svg>
        </div>
        <div style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 14px solid #f97316;
        "></div>
      </div>
    `,
    iconSize: [36, 50],
    iconAnchor: [18, 50],
  });

  originMarker.value = L.marker([props.origin.lat, props.origin.lng], {
    icon: originIcon,
  }).addTo(map.value);

  originMarker.value.bindPopup(`
    <div class="p-2">
      <h3 class="text-sm font-semibold">📦 Warehouse Origin</h3>
      <p class="mt-1 text-xs text-gray-600">${
        props.origin.address || "Warehouse - Thuong Tin, Hanoi"
      }</p>
    </div>
  `);

  // 2. Destination marker (green location pin)
  const destinationIcon = L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="position: relative;">
        <div style="
          width: 36px;
          height: 36px;
          background: #10b981;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg style="
            width: 18px; 
            height: 18px;
            transform: rotate(45deg);
          " fill="white" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
  });

  destinationMarker.value = L.marker(
    [props.destination.lat, props.destination.lng],
    { icon: destinationIcon }
  ).addTo(map.value);

  destinationMarker.value.bindPopup(`
    <div class="p-2">
      <h3 class="text-sm font-semibold">🏠 Delivery Address</h3>
      <p class="mt-1 text-xs text-gray-600">${
        props.destination.address || "Destination"
      }</p>
    </div>
  `);

  // 3. Current location marker (blue truck icon, animated)
  const currentLoc = props.currentLocation || props.origin;

  const currentIcon = L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="current-marker" style="
        width: 44px;
        height: 44px;
        background: #3b82f6;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        animation: pulse 2s infinite;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="
          width: 24px;
          height: 24px;
        " fill="white" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  currentMarker.value = L.marker([currentLoc.lat, currentLoc.lng], {
    icon: currentIcon,
  }).addTo(map.value);

  currentMarker.value.bindPopup(`
    <div class="p-2">
      <h3 class="text-sm font-semibold">🚚 Current Location</h3>
      <p class="mt-1 text-xs text-gray-600">${
        currentLoc.address || "In Transit"
      }</p>
    </div>
  `);

  // Fit bounds to show all markers
  const bounds = L.latLngBounds([
    [props.origin.lat, props.origin.lng],
    [currentLoc.lat, currentLoc.lng],
    [props.destination.lat, props.destination.lng],
  ]);
  map.value.fitBounds(bounds, { padding: [50, 50] });
}

function drawRoute() {
  if (!map.value || !props.route || props.route.length < 2) return;

  // Remove old route if exists
  if (routePolyline.value) {
    map.value.removeLayer(routePolyline.value);
  }

  const routeCoords = props.route.map((point) => [point.lat, point.lng]);

  routePolyline.value = L.polyline(routeCoords, {
    color: "#3b82f6",
    weight: 4,
    opacity: 0.7,
    smoothFactor: 1,
  }).addTo(map.value);
}

function updateCurrentLocation() {
  if (!currentMarker.value || !props.currentLocation) return;

  const newLatLng = [props.currentLocation.lat, props.currentLocation.lng];
  currentMarker.value.setLatLng(newLatLng);

  // Smooth pan to new location
  map.value.panTo(newLatLng, {
    animate: true,
    duration: 1,
  });
}

function refreshLocation() {
  refreshing.value = true;
  emit("location-updated");

  setTimeout(() => {
    refreshing.value = false;
  }, 1000);
}

// Watchers
watch(
  () => props.currentLocation,
  (newLoc) => {
    if (newLoc && map.value) {
      updateCurrentLocation();
    }
  },
  { deep: true }
);

watch(
  () => props.route,
  () => {
    if (map.value) {
      drawRoute();
    }
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  initMap();
});
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.current-marker {
  position: relative;
}

/* Dark mode support for Leaflet */
:deep(.leaflet-container) {
  background: #374151;
}

:deep(.dark .leaflet-control-attribution) {
  background: rgba(31, 41, 55, 0.8);
  color: #d1d5db;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
}
</style>