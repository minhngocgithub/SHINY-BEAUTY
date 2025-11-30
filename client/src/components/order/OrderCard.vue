<template>
  <div
    @click="$emit('click', order._id)"
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">
          Order #{{ order._id?.slice(-8).toUpperCase() }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ formatDate(order.createdAt) }}
        </p>
      </div>
      <span
        class="px-3 py-1 rounded-full text-xs font-medium"
        :class="getStatusClass(order.orderStatus)"
      >
        {{ getStatusLabel(order.orderStatus) }}
      </span>
    </div>

    <div class="space-y-3 mb-4">
      <div
        v-for="(item, index) in displayItems"
        :key="index"
        class="flex gap-3"
      >
        <img
          :src="getItemImage(item)"
          :alt="getItemName(item)"
          class="w-12 h-12 object-cover rounded"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 dark:text-white truncate">
            {{ getItemName(item) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Qty: {{ item.quantity }}
          </p>
        </div>
      </div>
      <p
        v-if="order.orderItems?.length > 2"
        class="text-xs text-gray-500 dark:text-gray-400"
      >
        +{{ order.orderItems.length - 2 }} more item(s)
      </p>
    </div>

    <div
      class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <span class="text-sm text-gray-600 dark:text-gray-400">Total</span>
      <span class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ formatCurrency(order.totalPrice) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

defineEmits(["click"]);

const displayItems = computed(() => {
  return props.order.orderItems?.slice(0, 2) || [];
});

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending:
      "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    confirmed:
      "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    paid: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    processing:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    shipped:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    delivered:
      "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    cancelled: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  };
  return (
    classes[status] ||
    "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
  );
};

const getItemName = (item) => {
  return item.product?.name || item.bundle?.name || "Unknown Item";
};

const getItemImage = (item) => {
  if (item.product?.images?.[0]?.url) return item.product.images[0].url;
  if (item.bundle?.image?.url) return item.bundle.image.url;
  return "/placeholder.jpg";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>
