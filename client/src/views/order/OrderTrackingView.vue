<template>
  <div
    class="min-h-screen py-8 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
  >
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="$router.back()"
        class="flex items-center gap-2 mb-6 text-gray-700 transition-all hover:text-rose-600 hover:translate-x-[-4px] bg-transparent"
      >
        <svg
          class="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
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
        <span class="font-medium">Back to Orders</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative w-16 h-16 mx-auto mb-4">
            <div
              class="absolute inset-0 border-4 rounded-full border-rose-200 animate-ping"
            ></div>
            <div
              class="relative w-16 h-16 border-4 rounded-full border-t-rose-600 border-r-violet-600 border-b-transparent border-l-transparent animate-spin"
            ></div>
          </div>
          <p
            class="font-semibold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
          >
            Loading tracking information...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="p-8 text-center border border-red-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-rose-100"
        >
          <svg
            class="w-8 h-8 text-red-600"
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
        <h3
          class="mb-2 text-xl font-semibold text-transparent bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text"
        >
          {{ error }}
        </h3>
        <button
          @click="loadTracking"
          class="px-6 py-2 mt-4 text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 hover:shadow-xl"
        >
          Retry
        </button>
      </div>

      <!-- Tracking Content -->
      <div v-else-if="order && trackingData" class="space-y-6">
        <!-- Header -->
        <div
          class="p-6 border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
        >
          <div
            class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
          >
            <div>
              <h1
                class="text-2xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
              >
                Order #{{ order._id?.slice(-8).toUpperCase() }}
              </h1>
              <p class="mt-1 text-sm text-gray-600">
                Placed on {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="px-4 py-2 text-sm font-semibold border shadow-sm rounded-xl"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusLabel(order.status) }}
              </span>

              <!-- Cancel Button (Only for PENDING orders) -->
              <button
                v-if="order.status === 'PENDING' || order.status === 'pending'"
                @click="showCancelModal = true"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 bg-white border border-red-200 shadow-sm rounded-xl hover:shadow-md hover:border-red-300 hover:bg-red-50"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel Order
              </button>

              <button
                v-if="trackingData?.trackingNumber"
                @click="copyTrackingNumber"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md hover:border-rose-200 hover:text-rose-600"
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
            v-if="trackingData?.trackingNumber"
            class="p-4 mt-4 border-l-4 shadow-sm border-rose-500 rounded-xl bg-gradient-to-r from-rose-50 to-violet-50"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-rose-700">Tracking Number</p>
                <p
                  class="mt-1 text-lg font-bold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
                >
                  {{ trackingData.trackingNumber }}
                </p>
                <p class="mt-1 text-xs text-gray-600">
                  Carrier: {{ trackingData.carrier || "Standard Delivery" }}
                </p>
              </div>
              <div
                v-if="
                  trackingData.estimatedDelivery || order.estimatedDeliveryDate
                "
                class="text-right"
              >
                <p class="text-xs text-rose-600">Estimated Delivery</p>
                <p class="mt-1 text-sm font-semibold text-gray-900">
                  {{
                    formatDate(
                      trackingData.estimatedDelivery ||
                        order.estimatedDeliveryDate
                    )
                  }}
                </p>
                <p class="mt-1 text-xs text-violet-600">
                  {{
                    getDeliveryCountdown(
                      trackingData.estimatedDelivery ||
                        order.estimatedDeliveryDate
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Left Column: Map & Shipper -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Order Tracking Map -->
            <div
              class="overflow-hidden border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
            >
              <div class="p-6">
                <h2
                  class="mb-4 text-xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
                >
                  Live Tracking
                </h2>
                <OrderTrackingMap
                  v-if="mapData"
                  :origin="mapData.origin"
                  :destination="mapData.destination"
                  :current-location="mapData.currentLocation"
                  :route="mapData.route"
                />
                <div
                  v-else
                  class="flex items-center justify-center h-64 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100"
                >
                  <div class="text-center">
                    <svg
                      class="w-12 h-12 mx-auto mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      ></path>
                    </svg>
                    <p class="text-gray-500">Map data not available</p>
                    <p class="mt-1 text-xs text-gray-400">
                      Tracking will be available once order is shipped
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipper Info -->
            <div
              v-if="trackingData?.shipper"
              class="overflow-hidden border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
            >
              <div class="p-6">
                <h2
                  class="mb-6 text-xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
                >
                  Delivery Agent
                </h2>
                <ShipperInfoCard :shipper="trackingData.shipper" />
              </div>
            </div>

            <!-- Delivery Progress -->
            <div
              v-if="trackingData?.progress !== undefined"
              class="p-6 border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
            >
              <h3
                class="mb-4 text-lg font-semibold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
              >
                Delivery Progress
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Progress</span>
                  <span class="font-semibold text-gray-900"
                    >{{ trackingData.progress }}%</span
                  >
                </div>
                <div class="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    class="h-3 transition-all duration-500 rounded-full bg-gradient-to-r from-rose-500 to-violet-500"
                    :style="{ width: `${trackingData.progress}%` }"
                  ></div>
                </div>
                <p
                  v-if="trackingData.currentLocation?.address"
                  class="flex items-start gap-2 text-sm text-gray-600"
                >
                  <svg
                    class="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-600"
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
                    <strong class="text-gray-900">Current Location:</strong>
                    {{ trackingData.currentLocation.address }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Timeline & Details -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Status Timeline -->
            <div
              class="overflow-hidden border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
            >
              <div class="p-6">
                <h2
                  class="mb-6 text-xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
                >
                  Order Progress
                </h2>
                <OrderStatusStepper
                  v-if="order?.status"
                  :currentStatus="order.status"
                  :timeline="order.timeline || []"
                  :estimatedDeliveryDate="
                    order.estimatedDeliveryDate ||
                    trackingData?.estimatedDelivery
                  "
                  :createdAt="order.createdAt"
                  :isPaid="order.isPaid"
                  :paidAt="order.paidAt"
                  :deliveredAt="order.deliveredAt"
                  :cancelledAt="order.cancelledAt"
                />
              </div>
            </div>

            <!-- Order Details -->
            <div
              class="p-6 border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
            >
              <h3
                class="mb-4 text-lg font-semibold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
              >
                Order Details
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Items</span>
                  <span class="font-medium text-gray-900">{{
                    order.orderItems?.length || 0
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Total Amount</span>
                  <span class="font-semibold text-gray-900">{{
                    formatCurrency(order.totalPrice)
                  }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Payment</span>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="
                      order.isPaid
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    "
                  >
                    {{ order.isPaid ? "Paid" : "Pending" }}
                  </span>
                </div>
              </div>
              <button
                @click="$router.push(`/orders/${order._id}`)"
                class="w-full px-4 py-2 mt-4 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md hover:border-rose-200 hover:text-rose-600"
              >
                View Full Order Details
              </button>
            </div>

            <!-- Shipping Address -->
            <div
              class="p-6 border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
            >
              <h3
                class="mb-4 text-lg font-semibold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
              >
                Delivery Address
              </h3>
              <div v-if="order?.shippingAddress" class="space-y-2 text-sm">
                <p class="font-medium text-gray-900">
                  {{ order.shippingAddress?.fullName }}
                </p>
                <p class="text-gray-600">
                  {{ order.shippingAddress?.phone }}
                </p>
                <p class="text-gray-600">
                  {{ order.shippingAddress?.address }}
                </p>
                <p class="text-gray-600">
                  {{ order.shippingAddress?.postalCode }}
                </p>
                <p class="text-gray-600">
                  {{ order.shippingAddress?.city }},
                  {{ order.shippingAddress?.country }}
                </p>
              </div>
            </div>

            <!-- Support -->
            <div
              class="p-6 border-l-4 shadow-xl border-rose-500 rounded-2xl bg-gradient-to-r from-rose-50 to-violet-50"
            >
              <h3
                class="mb-2 text-sm font-semibold text-transparent bg-gradient-to-r from-rose-700 to-violet-700 bg-clip-text"
              >
                Need Help?
              </h3>
              <p class="mb-3 text-xs text-gray-600">
                Contact our support team for assistance
              </p>
              <button
                class="w-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 hover:shadow-xl"
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
        class="p-8 text-center border border-gray-200 shadow-xl bg-white/90 backdrop-blur-xl rounded-2xl"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200"
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
        <h3
          class="mb-2 text-xl font-semibold text-transparent bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text"
        >
          Tracking Not Available Yet
        </h3>
        <p class="text-gray-600">
          Tracking information will be available once your order is shipped.
        </p>
      </div>
    </div>

    <!-- Cancel Order Modal -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
      @click.self="showCancelModal = false"
    >
      <div
        class="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3
            class="text-xl font-bold text-transparent bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text"
          >
            Cancel Order
          </h3>
          <button
            @click="showCancelModal = false"
            class="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          class="p-4 mb-4 border-l-4 border-yellow-500 rounded-lg bg-yellow-50"
        >
          <p class="text-sm text-yellow-800">
            <strong>Warning:</strong> This action cannot be undone. Your order
            will be cancelled immediately.
          </p>
        </div>

        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Reason for cancellation (optional)
          </label>
          <textarea
            v-model="cancelReason"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Tell us why you're cancelling this order..."
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button
            @click="showCancelModal = false"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-white border border-gray-300 shadow-sm rounded-xl hover:bg-gray-50"
            :disabled="cancelling"
          >
            Keep Order
          </button>
          <button
            @click="handleCancelOrder"
            class="flex-1 px-4 py-2 text-sm font-medium text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="cancelling"
          >
            <span v-if="cancelling">Cancelling...</span>
            <span v-else>Yes, Cancel Order</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOrderStore } from "../../store/order.store";
import {
  getOrderTrackingApi,
  cancelOrderApi,
} from "../../service/order.service";
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
const showCancelModal = ref(false);
const cancelReason = ref("");
const cancelling = ref(false);
let refreshInterval = null;

// Computed property for map data
const mapData = computed(() => {
  if (!order.value?.shippingAddress) return null;

  // Default warehouse location (Thuong Tin, Hanoi)
  const warehouseLocation = {
    lat: 20.9954,
    lng: 105.9033,
    address: "Warehouse - Thuong Tin, Hanoi, Vietnam",
  };

  // Parse destination from shipping address
  const destination = {
    lat: order.value.shippingAddress?.coordinates?.lat || 21.0285,
    lng: order.value.shippingAddress?.coordinates?.lng || 105.8542,
    address: `${order.value.shippingAddress?.address || ""}, ${
      order.value.shippingAddress?.city || ""
    }, ${order.value.shippingAddress?.country || ""}`.trim(),
  };

  return {
    origin: warehouseLocation,
    destination: destination,
    currentLocation: trackingData.value?.currentLocation || warehouseLocation,
    route: trackingData.value?.route || [],
  };
});

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
    alert("Tracking number copied to clipboard!");
  }
};

const handleCancelOrder = async () => {
  if (cancelling.value) return;

  try {
    cancelling.value = true;

    const response = await cancelOrderApi(order.value._id, cancelReason.value);

    if (response.data.success) {
      // Update local order data
      order.value.status = "CANCELLED";
      order.value.cancelledAt = new Date().toISOString();

      // Close modal
      showCancelModal.value = false;
      cancelReason.value = "";

      // Show success message
      alert("Order cancelled successfully!");

      // Reload order data
      await loadTracking();
    }
  } catch (err) {
    console.error("Failed to cancel order:", err);
    alert(
      err.response?.data?.message || "Failed to cancel order. Please try again."
    );
  } finally {
    cancelling.value = false;
  }
};

const getStatusLabel = (status) => {
  const labels = {
    PENDING: "⏳ Pending",
    CONFIRMED: "✅ Confirmed",
    PREPARING: "📦 Preparing",
    IN_TRANSIT: "🚚 In Transit",
    OUT_FOR_DELIVERY: "🚴 Out for Delivery",
    DELIVERED: "✨ Delivered",
    CANCELLED: "❌ Cancelled",
    // Legacy status support
    pending: "⏳ Pending",
    confirmed: "✅ Confirmed",
    paid: "💳 Paid",
    processing: "📦 Processing",
    shipped: "🚚 Shipped",
    delivered: "✨ Delivered",
    cancelled: "❌ Cancelled",
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    PREPARING: "bg-violet-100 text-violet-700 border-violet-200",
    IN_TRANSIT: "bg-indigo-100 text-indigo-700 border-indigo-200",
    OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700 border-purple-200",
    DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
    // Legacy status support
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    paid: "bg-green-100 text-green-700 border-green-200",
    processing: "bg-violet-100 text-violet-700 border-violet-200",
    shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return classes[status] || "bg-gray-100 text-gray-700 border-gray-200";
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

  // Connect to socket for real-time updates
  if (order.value?._id) {
    orderStore.connectOrderSocket(order.value._id);
    orderStore.requestNotificationPermission();
  }

  // Auto-refresh tracking every 30 seconds for active orders
  if (
    order.value?.status &&
    !["DELIVERED", "CANCELLED", "delivered", "cancelled"].includes(
      order.value.status
    )
  ) {
    refreshInterval = setInterval(loadTracking, 30000);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Disconnect socket when leaving page
  orderStore.disconnectOrderSocket();
});
</script>
