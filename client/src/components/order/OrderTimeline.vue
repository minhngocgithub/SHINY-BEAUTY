<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
  >
    <h3 class="font-semibold text-gray-900 dark:text-white mb-6">
      Order Timeline
    </h3>

    <div class="relative">
      <div
        v-for="(event, index) in displayTimeline"
        :key="index"
        class="flex gap-4 pb-8 last:pb-0"
      >
        <!-- Timeline Line -->
        <div class="relative flex flex-col items-center">
          <div
            class="w-3 h-3 rounded-full border-2"
            :class="{
              'bg-gray-900 dark:bg-white border-gray-900 dark:border-white':
                event.completed,
              'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600':
                !event.completed,
            }"
          ></div>
          <div
            v-if="index < displayTimeline.length - 1"
            class="w-0.5 flex-1 mt-2"
            :class="{
              'bg-gray-900 dark:bg-white': event.completed,
              'bg-gray-200 dark:bg-gray-700': !event.completed,
            }"
          ></div>
        </div>

        <!-- Event Content -->
        <div class="flex-1 -mt-0.5">
          <h4
            class="text-sm font-medium"
            :class="{
              'text-gray-900 dark:text-white': event.completed,
              'text-gray-500 dark:text-gray-400': !event.completed,
            }"
          >
            {{ event.label }}
          </h4>
          <p
            v-if="event.date"
            class="text-xs mt-1"
            :class="{
              'text-gray-600 dark:text-gray-400': event.completed,
              'text-gray-400 dark:text-gray-500': !event.completed,
            }"
          >
            {{ formatDate(event.date) }}
          </p>
          <p
            v-if="event.description"
            class="text-xs text-gray-500 dark:text-gray-400 mt-1"
          >
            {{ event.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  timeline: {
    type: Array,
    default: () => [],
  },
  status: {
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
});

// Use timeline from order if available (automation system)
// Otherwise, build timeline from status (legacy support)
const displayTimeline = computed(() => {
  // If order has timeline array from automation system, use it
  if (props.timeline && props.timeline.length > 0) {
    return props.timeline.map((event) => ({
      label: getStatusLabel(event.status),
      date: event.timestamp,
      completed: true,
      description: event.note || getStatusDescription(event.status),
    }));
  }

  // Legacy fallback: build timeline from status
  return buildLegacyTimeline();
});

const buildLegacyTimeline = () => {
  const events = [
    {
      label: "⏳ Order Placed",
      date: props.createdAt,
      completed: true,
      description: "Your order has been received",
    },
  ];

  if (props.status === "CANCELLED" || props.status === "cancelled") {
    events.push({
      label: "❌ Order Cancelled",
      date: props.cancelledAt,
      completed: true,
      description: "Your order has been cancelled",
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
    date: confirmedStatuses.includes(props.status) ? props.createdAt : null,
    completed: confirmedStatuses.includes(props.status),
    description: "Admin has confirmed your order",
  });

  // Payment (if paid)
  if (props.isPaid) {
    events.push({
      label: "💳 Payment Confirmed",
      date: props.paidAt,
      completed: true,
      description: "Payment has been received",
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
    date: preparingStatuses.includes(props.status) ? props.paidAt : null,
    completed: preparingStatuses.includes(props.status),
    description: "Your order is being prepared for shipping",
  });

  // In Transit
  const transitStatuses = ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
  events.push({
    label: "🚚 In Transit",
    date: transitStatuses.includes(props.status) ? props.paidAt : null,
    completed: transitStatuses.includes(props.status),
    description: "Your order is on the way",
  });

  // Out for Delivery
  const deliveryStatuses = ["OUT_FOR_DELIVERY", "DELIVERED"];
  events.push({
    label: "🚴 Out for Delivery",
    date: deliveryStatuses.includes(props.status) ? props.paidAt : null,
    completed: deliveryStatuses.includes(props.status),
    description: "Driver is delivering your order",
  });

  // Delivered
  events.push({
    label: "✨ Delivered",
    date: props.deliveredAt,
    completed: props.status === "DELIVERED" || props.status === "delivered",
    description: "Order has been delivered successfully",
  });

  return events;
};

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

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
