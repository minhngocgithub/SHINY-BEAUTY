<template>
  <div
    @click="$emit('click', order._id)"
    class="relative p-6 transition-all bg-white shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl hover:scale-105"
  >
    <div
      class="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl group-hover:opacity-100"
    ></div>
    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3
              class="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
            >
              #{{ order._id?.slice(-8).toUpperCase() }}
            </h3>
            <span
              v-if="order.isPaid"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              Paid
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ formatDate(order.createdAt) }}
          </div>
        </div>
        <span
          class="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
          :class="getOrderStatusClass(order.status)"
        >
          {{ getStatusLabel(order.status || order.orderStatus) }}
        </span>
      </div>
      <!-- Order Items Preview -->
      <div class="mb-4 space-y-3">
        <div
          v-for="(item, index) in displayItems"
          :key="index"
          class="flex items-start gap-3"
        >
          <!-- Item Image -->
          <div class="relative flex-shrink-0">
            <img
              :src="getItemImage(item)"
              :alt="getItemName(item)"
              class="object-cover w-16 h-16 border-2 rounded-xl border-rose-100"
              @error="handleImageError"
            />
            <!-- Bundle Badge -->
            <div
              v-if="item.bundle"
              class="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-1 shadow-md"
              title="Bundle Product"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                />
              </svg>
            </div>
          </div>

          <!-- Item Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ getItemName(item) }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-gray-500">
                    Qty: {{ item.quantity }}
                  </span>
                  <span
                    v-if="item.bundle"
                    class="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full font-semibold"
                  >
                    Bundle
                  </span>
                </div>
              </div>
              <span class="text-sm font-bold text-gray-900 whitespace-nowrap">
                {{ formatCurrency(item.price * item.quantity) }}
              </span>
            </div>
          </div>
        </div>

        <!-- More Items Indicator -->
        <div
          v-if="order.orderItems?.length > 2"
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50"
        >
          <svg
            class="w-4 h-4 text-rose-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
            />
          </svg>
          <span class="text-xs font-semibold text-rose-700">
            +{{ order.orderItems.length - 2 }} more item(s)
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-between pt-4 border-t-2 border-rose-100"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5 text-sm text-gray-600">
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
          <div
            v-if="order.shippingPrice === 0"
            class="flex items-center gap-1 px-2 py-1 text-xs font-bold text-green-700 rounded-full bg-gradient-to-r from-green-100 to-emerald-100"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
              />
              <path
                d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
              />
            </svg>
            Free Ship
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-500 mb-0.5">Total</p>
          <p
            class="text-xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text"
          >
            {{ formatCurrency(order.totalPrice) }}
          </p>
        </div>
      </div>

      <!-- Hover Effect Arrow -->
      <div
        class="absolute transition-all -translate-y-1/2 opacity-0 right-4 top-1/2 group-hover:opacity-100 group-hover:translate-x-1"
      >
        <svg
          class="w-6 h-6 text-rose-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
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

const getItemName = (item) => {
  return item.name || item.product?.name || item.bundle?.name || "Unknown Item";
};

const getItemImage = (item) => {
  // Check if image is stored directly in orderItem
  if (item.image) return item.image;

  // Check product.image (array)
  if (
    item.product?.image &&
    Array.isArray(item.product.image) &&
    item.product.image.length > 0
  ) {
    return item.product.image[0].url;
  }

  // Check bundle.image
  if (item.bundle?.image) {
    return Array.isArray(item.bundle.image)
      ? item.bundle.image[0]?.url
      : item.bundle.image.url;
  }

  return "/placeholder.jpg";
};

const handleImageError = (e) => {
  e.target.src = "/placeholder.jpg";
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
