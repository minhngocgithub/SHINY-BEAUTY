<template>
  <div class="space-y-6">
    <div
      class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl"
    >
      <h2 class="mb-6 text-xl font-semibold text-gray-700">Order History</h2>

      <!-- Order Filters -->
      <div class="flex gap-2 mb-6 overflow-x-auto">
        <button
          v-for="filter in orderFilters"
          :key="filter.value"
          @click="selectedFilter = filter.value"
          :class="[
            'px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200',
            selectedFilter === filter.value
              ? 'bg-gradient-to-r from-rose-400 to-violet-400 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div
          class="w-8 h-8 border-b-2 rounded-full animate-spin border-rose-400"
        ></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="py-12 text-center">
        <div class="mb-4 text-6xl">📦</div>
        <p class="text-gray-500">No orders found</p>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order._id"
          class="p-4 transition-all duration-200 bg-white border border-gray-100 cursor-pointer rounded-xl hover:shadow-md hover:border-rose-200"
          @click="$emit('view-order', order)"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-700">
                Order #{{ order._id?.slice(-8) }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium border',
                getOrderStatusClass(order.status),
              ]"
            >
              {{ getOrderStatusLabel(order.status) }}
            </span>
          </div>
          <div class="mb-2 text-sm text-gray-600">
            {{ order.orderItems?.length || 0 }} items
          </div>
          <div class="flex items-center justify-between">
            <div class="text-lg font-semibold text-rose-600">
              {{ formatCurrency(order.totalPrice) }}
            </div>
            <button
              v-if="order.status === 'PENDING' || order.status === 'CONFIRMED'"
              @click.stop="$emit('cancel-order', order._id)"
              class="text-sm text-red-600 hover:text-red-700"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
});

defineEmits(["view-order", "cancel-order"]);

const selectedFilter = ref("all");

const orderFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Paid", value: "PAID" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const filteredOrders = computed(() => {
  if (selectedFilter.value === "all") {
    return props.orders;
  }
  return props.orders.filter((order) => order.status === selectedFilter.value);
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getOrderStatusClass = (status) => {
  const classes = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PAID: "bg-indigo-50 text-indigo-700 border-indigo-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };
  return classes[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

const getOrderStatusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PAID: "Paid",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
};
</script>