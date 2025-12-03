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
            />
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
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span class="text-gray-700 dark:text-gray-300">Shipper Location</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="text-gray-700 dark:text-gray-300">Delivery Address</span>
        </div>
        <div v-if="route" class="flex items-center gap-2">
          <div class="w-8 h-0.5 bg-blue-600"></div>
          <span class="text-gray-700 dark:text-gray-300">Delivery Route</span>
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
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
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
            />
          </svg>
          <span class="font-semibold text-gray-900 dark:text-white">{{
            distanceInfo.duration
          }}</span>
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
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { Loader } from "@googlemaps/js-api-loader";

const props = defineProps({
  shipperLocation: {
    type: Object,
    default: null,
  },
  destination: {
    type: Object,
    required: true,
  },
  route: {
    type: Array,
    default: null,
  },
  orderStatus: {
    type: String,
    default: "pending",
  },
});

const emit = defineEmits(["location-updated"]);

const mapContainer = ref(null);
const map = ref(null);
const shipperMarker = ref(null);
const destinationMarker = ref(null);
const routePolyline = ref(null);
const mapLoading = ref(true);
const mapError = ref(null);
const refreshing = ref(false);
const distanceInfo = ref(null);

// Google Maps API Key (should be in .env file)
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

const initMap = async () => {
  try {
    mapLoading.value = true;
    mapError.value = null;

    // Load Google Maps API
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    const google = await loader.load();

    // Default center (Vietnam)
    let center = { lat: 21.0285, lng: 105.8542 }; // Hanoi

    // Get destination coordinates from address
    if (props.destination) {
      const geocoded = await geocodeAddress(
        `${props.destination.address}, ${props.destination.ward}, ${props.destination.district}, ${props.destination.city}`
      );
      if (geocoded) {
        center = geocoded;
      }
    }

    // Initialize map
    map.value = new google.maps.Map(mapContainer.value, {
      center: center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Add destination marker
    addDestinationMarker(center);

    // Add shipper marker if location available
    if (
      props.shipperLocation &&
      props.shipperLocation.lat &&
      props.shipperLocation.lng
    ) {
      addShipperMarker({
        lat: props.shipperLocation.lat,
        lng: props.shipperLocation.lng,
      });
      fitBounds();
    }

    // Draw route if available
    if (props.route && props.route.length > 0) {
      drawRoute(props.route);
    }

    mapLoading.value = false;
  } catch (error) {
    console.error("Failed to load Google Maps:", error);
    mapError.value =
      "Failed to load map. Please check your internet connection.";
    mapLoading.value = false;
  }
};

const geocodeAddress = async (address) => {
  try {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address });

    if (result.results && result.results.length > 0) {
      const location = result.results[0].geometry.location;
      return { lat: location.lat(), lng: location.lng() };
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
  }
  return null;
};

const addDestinationMarker = (position) => {
  if (!map.value) return;

  // Custom destination marker (green)
  destinationMarker.value = new google.maps.Marker({
    position,
    map: map.value,
    title: "Delivery Address",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: "#10B981",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 3,
    },
    animation: google.maps.Animation.DROP,
  });

  // Info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div class="p-2">
        <h3 class="font-semibold text-gray-900">Delivery Address</h3>
        <p class="mt-1 text-sm text-gray-600">${props.destination.fullName}</p>
        <p class="text-xs text-gray-500">${props.destination.address}</p>
      </div>
    `,
  });

  destinationMarker.value.addListener("click", () => {
    infoWindow.open(map.value, destinationMarker.value);
  });
};

const addShipperMarker = (position) => {
  if (!map.value) return;

  // Remove old marker if exists
  if (shipperMarker.value) {
    shipperMarker.value.setMap(null);
  }

  // Custom shipper marker (blue with delivery truck icon)
  shipperMarker.value = new google.maps.Marker({
    position,
    map: map.value,
    title: "Shipper Location",
    icon: {
      path: "M17.5,14.5V9h-3V7.5a.5.5,0,0,0-.5-.5H2.5a.5.5,0,0,0-.5.5v7a1.5,1.5,0,0,0,1.5,1.5h.55a2,2,0,1,0,3.9,0h4.1a2,2,0,1,0,3.9,0h.55A1.5,1.5,0,0,0,18,14.5ZM6,16a1,1,0,1,1,1-1A1,1,0,0,1,6,16Zm8,0a1,1,0,1,1,1-1A1,1,0,0,1,14,16Zm.5-6.5h2.43L15.5,12V9.5Z",
      fillColor: "#3B82F6",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 1.5,
      anchor: new google.maps.Point(10, 10),
    },
    animation: google.maps.Animation.BOUNCE,
  });

  // Stop animation after 2 seconds
  setTimeout(() => {
    if (shipperMarker.value) {
      shipperMarker.value.setAnimation(null);
    }
  }, 2000);

  // Info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div class="p-2">
        <h3 class="font-semibold text-blue-600">Shipper Location</h3>
        <p class="mt-1 text-xs text-gray-500">Last updated: ${new Date().toLocaleTimeString()}</p>
      </div>
    `,
  });

  shipperMarker.value.addListener("click", () => {
    infoWindow.open(map.value, shipperMarker.value);
  });

  // Calculate distance between shipper and destination
  if (destinationMarker.value) {
    calculateDistance(position, destinationMarker.value.getPosition());
  }
};

const drawRoute = (routeCoordinates) => {
  if (!map.value) return;

  // Remove old route if exists
  if (routePolyline.value) {
    routePolyline.value.setMap(null);
  }

  const path = routeCoordinates.map((coord) => ({
    lat: coord.lat,
    lng: coord.lng,
  }));

  routePolyline.value = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#3B82F6",
    strokeOpacity: 0.8,
    strokeWeight: 4,
    map: map.value,
  });
};

const calculateDistance = (origin, destination) => {
  const service = new google.maps.DistanceMatrixService();

  service.getDistanceMatrix(
    {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK" && response.rows[0].elements[0].status === "OK") {
        const element = response.rows[0].elements[0];
        distanceInfo.value = {
          distance: element.distance.text,
          duration: element.duration.text,
        };
      }
    }
  );
};

const fitBounds = () => {
  if (!map.value || !shipperMarker.value || !destinationMarker.value) return;

  const bounds = new google.maps.LatLngBounds();
  bounds.extend(shipperMarker.value.getPosition());
  bounds.extend(destinationMarker.value.getPosition());
  map.value.fitBounds(bounds);

  // Add padding
  const padding = { top: 50, right: 50, bottom: 50, left: 50 };
  map.value.panToBounds(bounds, padding);
};

const refreshLocation = () => {
  refreshing.value = true;
  emit("location-updated");

  setTimeout(() => {
    refreshing.value = false;
  }, 1000);
};

// Watch for shipper location changes
watch(
  () => props.shipperLocation,
  (newLocation) => {
    if (newLocation && newLocation.lat && newLocation.lng && map.value) {
      addShipperMarker({
        lat: newLocation.lat,
        lng: newLocation.lng,
      });
      fitBounds();
    }
  },
  { deep: true }
);

// Watch for route changes
watch(
  () => props.route,
  (newRoute) => {
    if (newRoute && newRoute.length > 0 && map.value) {
      drawRoute(newRoute);
    }
  },
  { deep: true }
);

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  // Clean up markers
  if (shipperMarker.value) shipperMarker.value.setMap(null);
  if (destinationMarker.value) destinationMarker.value.setMap(null);
  if (routePolyline.value) routePolyline.value.setMap(null);
});
</script>
