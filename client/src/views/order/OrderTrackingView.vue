<template>
  <div class="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="$router.back()"
        class="flex items-center gap-2 mb-6 text-gray-600 transition-colors dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Orders
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 border-b-2 border-gray-900 rounded-full animate-spin dark:border-white"
          ></div>
          <p class="text-gray-600 dark:text-gray-400">
            Loading tracking information...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="p-8 text-center bg-white border border-red-200 rounded-lg dark:bg-gray-800 dark:border-red-800"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30"
        >
          <svg
            class="w-8 h-8 text-red-600 dark:text-red-400"
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
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          {{ error }}
        </h3>
        <button
          @click="loadTracking"
          class="px-6 py-2 mt-4 text-white transition-colors bg-gray-900 rounded-lg dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          Retry
        </button>
      </div>

      <!-- Tracking Content -->
      <div v-else-if="order && trackingData" class="space-y-6">
        <!-- Header -->
        <div
          class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          <div
            class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
          >
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{{ order._id?.slice(-8).toUpperCase() }}
              </h1>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Placed on {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="px-4 py-2 text-sm font-semibold rounded-full"
                :class="getStatusClass(order.orderStatus)"
              >
                {{ getStatusLabel(order.orderStatus) }}
              </span>
              <button
                v-if="trackingData.trackingNumber"
                @click="copyTrackingNumber"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Tracking #
              </button>
            </div>
          </div>

          <!-- Tracking Number Bar -->
          <div
            v-if="trackingData.trackingNumber"
            class="p-4 mt-4 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Tracking Number
                </p>
                <p
                  class="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100"
                >
                  {{ trackingData.trackingNumber }}
                </p>
                <p class="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  Carrier: {{ trackingData.carrier || "Standard Delivery" }}
                </p>
              </div>
              <div v-if="trackingData.estimatedDelivery" class="text-right">
                <p class="text-xs text-blue-600 dark:text-blue-400">
                  Estimated Delivery
                </p>
                <p
                  class="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100"
                >
                  {{ formatDate(trackingData.estimatedDelivery) }}
                </p>
                <p class="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  {{ getDeliveryCountdown(trackingData.estimatedDelivery) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Left Column: Map & Shipper -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Google Maps -->
            <OrderTrackingMap
              v-if="trackingData.currentLocation"
              :shipper-location="trackingData.currentLocation"
              :destination="order.shippingInfo"
              :route="trackingData.route"
              :order-status="order.orderStatus"
            />

            <!-- Shipper Info -->
            <ShipperInfoCard
              v-if="trackingData.shipper"
              :shipper="trackingData.shipper"
              :vehicle="trackingData.vehicle"
              :order-id="order._id"
            />

            <!-- Delivery Progress -->
            <div
              v-if="trackingData.progress !== undefined"
              class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <h3
                class="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
              >
                Delivery Progress
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Progress</span>
                  <span class="font-semibold text-gray-900 dark:text-white"
                    >{{ trackingData.progress }}%</span
                  >
                </div>
                <div
                  class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700"
                >
                  <div
                    class="h-3 transition-all duration-500 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    :style="{ width: `${trackingData.progress}%` }"
                  ></div>
                </div>
                <p
                  v-if="trackingData.currentLocation?.address"
                  class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <svg
                    class="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>
                    <strong>Current Location:</strong>
                    {{ trackingData.currentLocation.address }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Timeline & Details -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Status Timeline -->
            <OrderStatusStepper
              :status="order.orderStatus"
              :created-at="order.createdAt"
              :paid-at="order.paidAt"
              :shipped-at="order.shippedAt"
              :delivered-at="order.deliveredAt"
              :cancelled-at="order.cancelledAt"
              :timeline-events="trackingData.timeline"
            />

            <!-- Order Details -->
            <div
              class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <h3
                class="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
              >
                Order Details
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Items</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    order.orderItems?.length || 0
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Total Amount</span
                  >
                  <span class="font-semibold text-gray-900 dark:text-white">{{
                    formatCurrency(order.totalPrice)
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Payment</span>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="
                      order.isPaid
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    "
                  >
                    {{ order.isPaid ? "Paid" : "Pending" }}
                  </span>
                </div>
              </div>
              <button
                @click="$router.push(`/orders/${order._id}`)"
                class="w-full px-4 py-2 mt-4 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                View Full Order Details
              </button>
            </div>

            <!-- Shipping Address -->
            <div
              class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <h3
                class="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
              >
                Delivery Address
              </h3>
              <div class="space-y-2 text-sm">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ order.shippingInfo?.fullName }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ order.shippingInfo?.phoneNo }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ order.shippingInfo?.address }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ order.shippingInfo?.ward }},
                  {{ order.shippingInfo?.district }}
                </p>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ order.shippingInfo?.city }}
                </p>
              </div>
            </div>

            <!-- Support -->
            <div
              class="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20"
            >
              <h3
                class="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100"
              >
                Need Help?
              </h3>
              <p class="mb-3 text-xs text-blue-700 dark:text-blue-300">
                Contact our support team for assistance
              </p>
              <button
                class="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Tracking Available -->
      <div
        v-else-if="order && !trackingData"
        class="p-8 text-center bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-700"
        >
          <svg
            class="w-8 h-8 text-gray-400"
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
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Tracking Not Available Yet
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Tracking information will be available once your order is shipped.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "../../store/order.store";
import { getOrderTrackingApi } from "../../service/order.service";
import OrderTrackingMap from "../../components/order/OrderTrackingMap.vue";
import ShipperInfoCard from "../../components/order/ShipperInfoCard.vue";
import OrderStatusStepper from "../../components/order/OrderStatusStepper.vue";

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const order = ref(null);
const trackingData = ref(null);
const loading = ref(true);
const error = ref(null);
let refreshInterval = null;

const loadTracking = async () => {
  try {
    loading.value = true;
    error.value = null;

    const orderId = route.params.id;

    // Fetch order details
    await orderStore.fetchOrderById(orderId);
    order.value = orderStore.currentOrder;

    if (!order.value) {
      error.value = "Order not found";
      return;
    }

    // Fetch tracking data
    try {
      const response = await getOrderTrackingApi(orderId);
      trackingData.value = response.tracking || response;
    } catch (trackingError) {
      console.warn("Tracking data not available:", trackingError);
      trackingData.value = null;
    }
  } catch (err) {
    console.error("Failed to load tracking:", err);
    error.value =
      err.response?.data?.message || "Failed to load tracking information";
  } finally {
    loading.value = false;
  }
};

const copyTrackingNumber = () => {
  if (trackingData.value?.trackingNumber) {
    navigator.clipboard.writeText(trackingData.value.trackingNumber);
    // Show toast notification
    alert("Tracking number copied to clipboard!");
  }
};

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
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",
    confirmed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700",
    processing:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700",
    shipped:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700",
    delivered:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700",
    cancelled:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-700",
  };
  return (
    classes[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  );
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
};

const getDeliveryCountdown = (estimatedDate) => {
  if (!estimatedDate) return "";
  const now = new Date();
  const delivery = new Date(estimatedDate);
  const diff = delivery - now;

  if (diff < 0) return "Delivered";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ${hours}h remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
  return "Arriving soon";
};

onMounted(async () => {
  await loadTracking();

  // Auto-refresh tracking every 30 seconds for shipped orders
  if (order.value?.orderStatus === "shipped") {
    refreshInterval = setInterval(loadTracking, 30000);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
