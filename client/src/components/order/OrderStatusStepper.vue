<template>
  <div
    class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
  >
    <h3 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
      Order Status Timeline
    </h3>

    <div class="relative">
      <!-- Timeline Line -->
      <div
        class="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
        aria-hidden="true"
      ></div>

      <!-- Timeline Events -->
      <div class="relative space-y-6">
        <div
          v-for="(event, index) in timelineEvents"
          :key="index"
          class="relative flex gap-4"
        >
          <!-- Icon -->
          <div class="relative flex-shrink-0">
            <div
              class="flex items-center justify-center w-10 h-10 transition-all duration-300 border-2 rounded-full"
              :class="[
                event.completed
                  ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600'
                  : event.active
                  ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600 animate-pulse'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
              ]"
            >
              <component
                :is="event.icon"
                class="w-5 h-5 transition-colors"
                :class="
                  event.completed || event.active
                    ? 'text-white'
                    : 'text-gray-400 dark:text-gray-500'
                "
              />
            </div>

            <!-- Connecting Dot Animation -->
            <div
              v-if="event.active"
              class="absolute inset-0 w-10 h-10 border-2 border-blue-500 rounded-full animate-ping opacity-20"
            ></div>
          </div>

          <!-- Content -->
          <div class="flex-1 pb-6 -mt-0.5">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h4
                  class="text-sm font-semibold"
                  :class="
                    event.completed || event.active
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  "
                >
                  {{ event.label }}
                </h4>
                <p
                  v-if="event.description"
                  class="mt-1 text-xs"
                  :class="
                    event.completed || event.active
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500'
                  "
                >
                  {{ event.description }}
                </p>
                <p
                  v-if="event.location"
                  class="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ event.location }}
                </p>
              </div>

              <div class="flex-shrink-0 text-right">
                <p
                  v-if="event.date"
                  class="text-xs font-medium"
                  :class="
                    event.completed || event.active
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  "
                >
                  {{ formatDate(event.date) }}
                </p>
                <p
                  v-if="event.time"
                  class="mt-0.5 text-xs"
                  :class="
                    event.completed || event.active
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500'
                  "
                >
                  {{ formatTime(event.date) }}
                </p>
              </div>
            </div>

            <!-- Additional Metadata -->
            <div v-if="event.metadata" class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="(value, key) in event.metadata"
                :key="key"
                class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-400"
              >
                {{ key }}: {{ value }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estimated Completion -->
      <div
        v-if="estimatedCompletion"
        class="p-4 mt-6 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20"
      >
        <div class="flex items-center gap-2">
          <svg
            class="w-5 h-5 text-blue-600 dark:text-blue-400"
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
          <div>
            <p class="text-xs font-medium text-blue-700 dark:text-blue-300">
              Estimated Delivery
            </p>
            <p
              class="mt-0.5 text-sm font-semibold text-blue-900 dark:text-blue-100"
            >
              {{ formatDate(estimatedCompletion) }} •
              {{ formatTime(estimatedCompletion) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from "vue";

const props = defineProps({
  currentStatus: {
    type: String,
    required: true,
  },
  timeline: {
    type: Array,
    default: () => [],
  },
  estimatedDeliveryDate: {
    type: String,
    default: null,
  },
  createdAt: {
    type: String,
    default: null,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: String,
    default: null,
  },
  deliveredAt: {
    type: String,
    default: null,
  },
  cancelledAt: {
    type: String,
    default: null,
  },
  // Legacy props support
  status: {
    type: String,
    default: null,
  },
  shippedAt: {
    type: String,
    default: null,
  },
  timelineEvents: {
    type: Array,
    default: () => [],
  },
});

// Icon components
const CheckIcon = () =>
  h(
    "svg",
    { fill: "currentColor", viewBox: "0 0 20 20" },
    h("path", {
      "fill-rule": "evenodd",
      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
      "clip-rule": "evenodd",
    })
  );

const ClockIcon = () =>
  h(
    "svg",
    { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    })
  );

const CreditCardIcon = () =>
  h(
    "svg",
    { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    })
  );

const PackageIcon = () =>
  h(
    "svg",
    { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    })
  );

const TruckIcon = () =>
  h("svg", { fill: "currentColor", viewBox: "0 0 20 20" }, [
    h("path", {
      d: "M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
    }),
    h("path", {
      d: "M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z",
    }),
  ]);

const HomeIcon = () =>
  h(
    "svg",
    { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    })
  );

const XIcon = () =>
  h(
    "svg",
    { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
    h("path", {
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      d: "M6 18L18 6M6 6l12 12",
    })
  );

const timelineEvents = computed(() => {
  // Priority 1: Use automation timeline if available
  if (props.timeline && props.timeline.length > 0) {
    return props.timeline.map((event) => ({
      label: getStatusLabel(event.status),
      description:
        event.message || event.note || getStatusDescription(event.status),
      icon: getStatusIcon(event.status),
      date: event.timestamp,
      // Format location - convert object to string if needed
      location: formatLocation(event.location),
      completed: true,
      active: false,
    }));
  }

  // Priority 2: Use legacy timelineEvents if provided
  if (props.timelineEvents && props.timelineEvents.length > 0) {
    return props.timelineEvents;
  }

  // Priority 3: Build from current status
  const currentStatus = props.currentStatus || props.status;
  const events = [];

  // Order Placed (always completed)
  events.push({
    label: "⏳ Order Placed",
    description: "Your order has been received",
    icon: ClockIcon,
    date: props.createdAt,
    completed: true,
    active: currentStatus === "PENDING",
  });

  // Cancelled Path
  if (currentStatus === "CANCELLED" || currentStatus === "cancelled") {
    events.push({
      label: "❌ Order Cancelled",
      description: "This order has been cancelled",
      icon: XIcon,
      date: props.cancelledAt,
      completed: true,
      active: false,
    });
    return events;
  }

  // Confirmed
  const confirmedStatuses = [
    "CONFIRMED",
    "PREPARING",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];
  events.push({
    label: "✅ Order Confirmed",
    description: "Admin has confirmed your order",
    icon: CheckIcon,
    date: confirmedStatuses.includes(currentStatus) ? props.createdAt : null,
    completed: confirmedStatuses.includes(currentStatus),
    active: currentStatus === "CONFIRMED",
  });

  // Payment (if paid)
  if (props.isPaid) {
    events.push({
      label: "💳 Payment Confirmed",
      description: "Payment has been received",
      icon: CreditCardIcon,
      date: props.paidAt,
      completed: true,
      active: false,
    });
  }

  // Preparing
  const preparingStatuses = [
    "PREPARING",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];
  events.push({
    label: "📦 Preparing Order",
    description: "Your order is being prepared for shipping",
    icon: PackageIcon,
    date: preparingStatuses.includes(currentStatus) ? props.paidAt : null,
    completed: preparingStatuses.includes(currentStatus),
    active: currentStatus === "PREPARING",
  });

  // In Transit
  const transitStatuses = ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
  events.push({
    label: "🚚 In Transit",
    description: "Your order is on the way",
    icon: TruckIcon,
    date: transitStatuses.includes(currentStatus) ? props.paidAt : null,
    completed: transitStatuses.includes(currentStatus),
    active: currentStatus === "IN_TRANSIT",
  });

  // Out for Delivery
  const deliveryStatuses = ["OUT_FOR_DELIVERY", "DELIVERED"];
  events.push({
    label: "🚴 Out for Delivery",
    description: "Driver is delivering your order",
    icon: TruckIcon,
    date: deliveryStatuses.includes(currentStatus) ? props.paidAt : null,
    completed: deliveryStatuses.includes(currentStatus),
    active: currentStatus === "OUT_FOR_DELIVERY",
  });

  // Delivered
  events.push({
    label: "✨ Delivered",
    description: "Order has been delivered successfully",
    icon: HomeIcon,
    date: props.deliveredAt,
    completed: currentStatus === "DELIVERED" || currentStatus === "delivered",
    active: false,
  });

  return events;
});

const getStatusLabel = (status) => {
  const labels = {
    PENDING: "⏳ Order Placed",
    CONFIRMED: "✅ Order Confirmed",
    PREPARING: "📦 Preparing Order",
    IN_TRANSIT: "🚚 In Transit",
    OUT_FOR_DELIVERY: "🚴 Out for Delivery",
    DELIVERED: "✨ Delivered",
    CANCELLED: "❌ Cancelled",
  };
  return labels[status] || status;
};

const getStatusDescription = (status) => {
  const descriptions = {
    PENDING: "Your order has been received",
    CONFIRMED: "Admin has confirmed your order",
    PREPARING: "Your order is being prepared for shipping",
    IN_TRANSIT: "Your order is on the way to you",
    OUT_FOR_DELIVERY: "Driver is delivering your order",
    DELIVERED: "Order has been delivered successfully",
    CANCELLED: "Your order has been cancelled",
  };
  return descriptions[status] || "";
};

const getStatusIcon = (status) => {
  const icons = {
    PENDING: ClockIcon,
    CONFIRMED: CheckIcon,
    PREPARING: PackageIcon,
    IN_TRANSIT: TruckIcon,
    OUT_FOR_DELIVERY: TruckIcon,
    DELIVERED: HomeIcon,
    CANCELLED: XIcon,
  };
  return icons[status] || ClockIcon;
};

const estimatedCompletion = computed(() => {
  const currentStatus = props.currentStatus || props.status;

  // Use provided estimatedDeliveryDate if available
  if (props.estimatedDeliveryDate) {
    return props.estimatedDeliveryDate;
  }

  if (
    (currentStatus === "DELIVERED" || currentStatus === "delivered") &&
    props.deliveredAt
  ) {
    return null;
  }

  // Calculate estimated delivery (3 days from order for legacy)
  if (props.createdAt) {
    const created = new Date(props.createdAt);
    const estimated = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
    return estimated.toISOString();
  }

  return null;
});

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format location - convert object to string if needed
const formatLocation = (location) => {
  if (!location) return null;

  // If it's already a string, return it
  if (typeof location === "string") return location;

  // If it's an object with address property
  if (location.address) return location.address;

  // If it's an object with lat/lng but no address
  if (location.lat && location.lng) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }

  return null;
};
</script>
