<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
  >
    <h3 class="font-semibold text-gray-900 dark:text-white mb-6">
      Order Timeline
    </h3>

    <div class="relative">
      <div
        v-for="(event, index) in timeline"
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
            v-if="index < timeline.length - 1"
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
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
  paidAt: {
    type: String,
    default: null,
  },
  shippedAt: {
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

const timeline = computed(() => {
  const events = [
    {
      label: "Order Placed",
      date: props.createdAt,
      completed: true,
    },
  ];

  if (props.status === "cancelled") {
    events.push({
      label: "Order Cancelled",
      date: props.cancelledAt,
      completed: true,
      description: "Your order has been cancelled",
    });
    return events;
  }

  events.push({
    label: "Order Confirmed",
    date: props.status !== "pending" ? props.createdAt : null,
    completed: props.status !== "pending",
  });

  events.push({
    label: "Payment Confirmed",
    date: props.paidAt,
    completed: ["paid", "processing", "shipped", "delivered"].includes(
      props.status
    ),
  });

  events.push({
    label: "Processing",
    date: props.paidAt,
    completed: ["processing", "shipped", "delivered"].includes(props.status),
    description: "Your order is being prepared",
  });

  events.push({
    label: "Shipped",
    date: props.shippedAt,
    completed: ["shipped", "delivered"].includes(props.status),
    description: "Your order is on the way",
  });

  events.push({
    label: "Delivered",
    date: props.deliveredAt,
    completed: props.status === "delivered",
    description: "Order has been delivered",
  });

  return events;
});

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
