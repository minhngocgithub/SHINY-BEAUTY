<template>
  <div
    class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
  >
    <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
      Delivery Partner
    </h3>

    <div class="flex items-start gap-4">
      <!-- Shipper Avatar -->
      <div class="relative flex-shrink-0">
        <img
          :src="shipper.photo || '/default-shipper.png'"
          :alt="shipper.name"
          class="object-cover w-16 h-16 border-2 border-gray-200 rounded-full dark:border-gray-700"
        />
        <div
          v-if="shipper.isOnline"
          class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full dark:border-gray-800"
          title="Online"
        ></div>
      </div>

      <!-- Shipper Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ shipper.name || "Delivery Partner" }}
            </h4>
            <div v-if="shipper.rating" class="flex items-center gap-1 mt-1">
              <svg
                v-for="star in 5"
                :key="star"
                class="w-4 h-4"
                :class="
                  star <= Math.floor(shipper.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                "
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span class="ml-1 text-sm text-gray-600 dark:text-gray-400">
                {{ shipper.rating.toFixed(1) }} ({{
                  shipper.totalDeliveries || 0
                }}
                deliveries)
              </span>
            </div>
          </div>
          <span
            v-if="shipper.isOnline"
            class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400"
          >
            Online
          </span>
        </div>

        <!-- Vehicle Info -->
        <div v-if="vehicle" class="flex items-center gap-2 mt-3">
          <svg
            class="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
            />
            <path
              d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
            />
          </svg>
          <div class="text-sm">
            <span class="text-gray-900 dark:text-white">{{
              vehicle.type || "Motorcycle"
            }}</span>
            <span class="mx-2 text-gray-400">•</span>
            <span class="text-gray-600 dark:text-gray-400">{{
              vehicle.plateNumber || "N/A"
            }}</span>
          </div>
        </div>

        <!-- Contact Actions -->
        <div class="flex gap-2 mt-4">
          <button
            v-if="shipper.phone"
            @click="callShipper"
            class="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Call Shipper
          </button>
          <button
            @click="openChat"
            class="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Message
          </button>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div
      v-if="shipper.currentStatus"
      class="p-3 mt-4 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20"
    >
      <div class="flex items-start gap-2">
        <svg
          class="w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p class="text-sm font-medium text-blue-900 dark:text-blue-100">
            {{ shipper.currentStatus }}
          </p>
          <p
            v-if="shipper.lastUpdate"
            class="mt-1 text-xs text-blue-700 dark:text-blue-300"
          >
            Last updated {{ formatTime(shipper.lastUpdate) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Safety Features -->
    <div class="p-3 mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      <div class="flex items-center gap-2 mb-2">
        <svg
          class="w-4 h-4 text-gray-600 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Safety Verified
        </h4>
      </div>
      <ul class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <li class="flex items-center gap-2">
          <svg
            class="w-3 h-3 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          ID Verified
        </li>
        <li class="flex items-center gap-2">
          <svg
            class="w-3 h-3 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          Background Check Passed
        </li>
        <li class="flex items-center gap-2">
          <svg
            class="w-3 h-3 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          Insured Delivery
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  shipper: {
    type: Object,
    required: true,
  },
  vehicle: {
    type: Object,
    default: null,
  },
  orderId: {
    type: String,
    required: true,
  },
});

const callShipper = () => {
  if (props.shipper.phone) {
    window.location.href = `tel:${props.shipper.phone}`;
  }
};

const openChat = () => {
  // TODO: Open chat modal or navigate to chat page
  alert("Chat feature coming soon!");
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return date.toLocaleDateString();
};
</script>
