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
        <div class="mb-4 text-6xl">
          <svg
            class="size-6"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="url(#grad1)"
          >
            <defs>
              <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stop-color="#ef4444" />
                <!-- red-500 -->
                <stop offset="100%" stop-color="#ec4899" />
                <!-- pink-500 -->
              </linearGradient>
            </defs>

            <path
              fill-rule="evenodd"
              d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
            />
          </svg>
        </div>
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

          <!-- Product Images Preview -->
          <div class="flex items-center gap-2 mb-3 overflow-x-auto">
            <div
              v-for="(item, idx) in order.orderItems?.slice(0, 4)"
              :key="idx"
              class="relative flex-shrink-0"
            >
              <div
                class="w-16 h-16 overflow-hidden border-2 border-gray-100 rounded-lg bg-gray-50"
              >
                <img
                  :src="getProductImage(item)"
                  :alt="getProductName(item)"
                  class="object-cover w-full h-full"
                  loading="lazy"
                  @error="handleImageError"
                />
              </div>
              <div
                v-if="item.quantity > 1"
                class="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-gradient-to-r from-rose-400 to-violet-400"
              >
                {{ item.quantity }}
              </div>
            </div>
            <div
              v-if="order.orderItems?.length > 4"
              class="flex items-center justify-center flex-shrink-0 w-16 h-16 text-sm font-semibold text-gray-500 border-2 border-gray-200 border-dashed rounded-lg bg-gray-50"
            >
              +{{ order.orderItems.length - 4 }}
            </div>
          </div>

          <!-- Order Summary Info -->
          <div
            class="grid grid-cols-2 gap-2 pb-3 mb-3 border-b border-gray-100"
          >
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg
                class="size-6"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="url(#grad1)"
              >
                <defs>
                  <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stop-color="#ef4444" />
                    <!-- red-500 -->
                    <stop offset="100%" stop-color="#ec4899" />
                    <!-- pink-500 -->
                  </linearGradient>
                </defs>

                <path
                  fill-rule="evenodd"
                  d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                />
              </svg>
              <span>{{ order.orderItems?.length || 0 }} items</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="text-gray-400">💳</span>
              <span>{{ order.paymentMethod || "COD" }}</span>
            </div>
            <div
              v-if="order.shippingAddress"
              class="flex items-center col-span-2 gap-2 text-sm text-gray-600"
            >
              <span class="text-gray-400">📍</span>
              <span class="truncate">{{
                order.shippingAddress.city || order.shippingAddress.province
              }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-gray-500 mb-0.5">Total Amount</div>
              <div class="text-lg font-semibold text-rose-600">
                {{ formatCurrency(order.totalPrice) }}
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-if="
                  order.status === 'SHIPPED' ||
                  order.status === 'PROCESSING' ||
                  order.status === 'CONFIRMED' ||
                  order.status === 'PAID'
                "
                @click.stop="$emit('track-order', order._id)"
                class="px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                Track Order
              </button>
              <button
                v-if="
                  order.status === 'PENDING' || order.status === 'CONFIRMED'
                "
                @click.stop="$emit('cancel-order', order._id)"
                class="px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Cancel
              </button>
            </div>
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

defineEmits(["view-order", "cancel-order", "track-order"]);

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

const getProductImage = (item) => {
  // Try multiple possible data structures (similar to FloatingCart.vue)
  const data = item.productId || item.product || item.bundle;

  if (!data) return "/placeholder-product.png";

  // Check for image/images array
  const images = data.image || data.images;

  if (images && Array.isArray(images) && images.length > 0) {
    return images[0].url || images[0];
  }

  return "/placeholder-product.png";
};

const getProductName = (item) => {
  const data = item.productId || item.product || item.bundle;
  return data?.name || "Product";
};

const handleImageError = (e) => {
  e.target.src = "/placeholder-product.png";
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