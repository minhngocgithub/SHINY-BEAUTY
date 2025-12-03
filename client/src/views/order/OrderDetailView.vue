<template>
  <div
    class="min-h-screen py-8 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
  >
    <div class="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="$router.push('/orders')"
        class="flex items-center gap-2 mb-6 text-gray-700 transition-all hover:text-rose-600 hover:translate-x-[-4px] bg-[#FFFF]"
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
        <span class="font-medium">Back to Orders</span>
      </button>

      <!-- Loading State -->
      <div v-if="loading && !currentOrder" class="flex justify-center py-16">
        <div class="relative">
          <Loading />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-16 text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full"
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="mb-4 text-red-600">{{ error }}</p>
        <button
          @click="fetchOrder"
          class="px-6 py-3 font-medium text-white transition-all bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl hover:from-rose-600 hover:to-pink-700 hover:shadow-lg"
        >
          Try Again
        </button>
      </div>

      <!-- Order Content -->
      <div v-else-if="currentOrder" class="space-y-6">
        <!-- Header -->
        <div class="relative overflow-hidden bg-white shadow-lg rounded-2xl">
          <div
            class="absolute top-0 right-0 w-64 h-64 rounded-full opacity-50 bg-gradient-to-br from-rose-100 to-pink-100 blur-3xl -z-0"
          ></div>
          <div class="relative z-10 p-6">
            <div
              class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
            >
              <div>
                <h1
                  class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order #{{ currentOrder._id?.slice(-8).toUpperCase() }}
                </h1>
                <p class="mt-2 text-sm text-gray-600">
                  <span class="inline-flex items-center gap-1">
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
                    {{ formatDate(currentOrder.createdAt) }}
                  </span>
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span
                  class="px-4 py-2 text-sm font-semibold rounded-full shadow-sm"
                  :class="
                    getStatusClass(
                      currentOrder.status || currentOrder.orderStatus
                    )
                  "
                >
                  {{
                    getStatusLabel(
                      currentOrder.status || currentOrder.orderStatus
                    )
                  }}
                </span>
                <!-- Track Order Button -->
                <button
                  v-if="canTrackOrder"
                  @click="$router.push(`/orders/${currentOrder._id}/track`)"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-105"
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Track Order
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <!-- Order Items -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order Items
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div
                    v-for="item in currentOrder.orderItems"
                    :key="item._id"
                    class="flex gap-4 p-3 pb-4 transition-all border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-rose-50/30 hover:to-pink-50/30 rounded-xl"
                  >
                    <img
                      :src="getItemImage(item)"
                      :alt="getItemName(item)"
                      class="object-cover w-24 h-24 rounded-xl ring-2 ring-rose-100"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 truncate">
                        {{ getItemName(item) }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-600">
                        Qty: {{ item.quantity }}
                      </p>
                    </div>
                    <div class="text-right">
                      <div
                        class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                      >
                        {{ formatCurrency(item.price * item.quantity) }}
                      </div>
                      <div
                        v-if="item.originalPrice > item.price"
                        class="text-sm text-gray-400 line-through"
                      >
                        {{ formatCurrency(item.originalPrice * item.quantity) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Shipping Address
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-2 text-sm text-gray-600">
                  <p class="font-semibold text-gray-900">
                    {{ currentOrder.shippingAddress?.fullName }}
                  </p>
                  <p>{{ currentOrder.shippingAddress?.phone }}</p>
                  <p>{{ currentOrder.shippingAddress?.address }}</p>
                  <p>
                    {{ currentOrder.shippingAddress?.ward }},
                    {{ currentOrder.shippingAddress?.district }},
                    {{ currentOrder.shippingAddress?.city }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Payment Information
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-3 text-sm">
                  <div
                    class="flex items-center justify-between py-2 border-b border-gray-100"
                  >
                    <span class="text-gray-600">Payment Method</span>
                    <span class="font-semibold text-gray-900">{{
                      getPaymentMethodLabel(currentOrder.paymentMethod)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Payment Status</span>
                    <span
                      class="px-3 py-1 text-xs font-semibold rounded-full"
                      :class="
                        currentOrder.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      "
                    >
                      {{ currentOrder.isPaid ? "Paid" : "Unpaid" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Order Summary -->
            <div class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order Summary
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-3 text-sm">
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-semibold text-gray-900">{{
                      formatCurrency(currentOrder.itemsPrice)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Shipping</span>
                    <span class="font-semibold text-gray-900">{{
                      formatCurrency(currentOrder.shippingPrice)
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-gray-600">Tax</span>
                    <span class="font-semibold text-gray-900">{{
                      formatCurrency(currentOrder.taxPrice)
                    }}</span>
                  </div>
                  <div
                    v-if="currentOrder.totalDiscount > 0"
                    class="flex items-center justify-between py-2"
                  >
                    <span class="text-gray-600">Discount</span>
                    <span class="font-semibold text-rose-600">
                      -{{ formatCurrency(currentOrder.totalDiscount) }}
                    </span>
                  </div>
                  <div
                    class="flex items-center justify-between pt-4 mt-4 border-t-2 border-gray-200"
                  >
                    <span class="text-lg font-bold text-gray-900">Total</span>
                    <span
                      class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                    >
                      {{ formatCurrency(currentOrder.totalPrice) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <OrderTimeline
              v-if="currentOrder.timeline && currentOrder.timeline.length > 0"
              :timeline="currentOrder.timeline"
            />
            <div v-else class="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div
                class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
              >
                <h2
                  class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
                >
                  Order Status
                </h2>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-3 h-3 rounded-full shadow-lg bg-gradient-to-r from-rose-500 to-pink-500"
                    ></div>
                    <div>
                      <p class="font-semibold text-gray-900">
                        {{
                          getStatusLabel(
                            currentOrder.status || currentOrder.orderStatus
                          )
                        }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ formatDate(currentOrder.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div
              v-if="canCancel"
              class="overflow-hidden bg-white shadow-lg rounded-2xl"
            >
              <div class="p-6">
                <button
                  @click="showCancelModal = true"
                  :disabled="cancelLoading"
                  class="w-full py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Modal -->
      <div
        v-if="showCancelModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
        @click.self="showCancelModal = false"
      >
        <div
          class="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
        >
          <div
            class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50"
          >
            <h3
              class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
            >
              Cancel Order
            </h3>
          </div>
          <div class="p-6">
            <p class="mb-4 text-gray-600">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <textarea
              v-model="cancelReason"
              rows="3"
              placeholder="Reason for cancellation (optional)"
              class="w-full px-4 py-3 mb-6 text-gray-900 placeholder-gray-400 transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            ></textarea>
            <div class="flex gap-3">
              <button
                @click="confirmCancel"
                :disabled="cancelLoading"
                class="flex-1 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ cancelLoading ? "Cancelling..." : "Confirm Cancel" }}
              </button>
              <button
                @click="showCancelModal = false"
                :disabled="cancelLoading"
                class="flex-1 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useOrderStore } from "../../store/order.store";
import { storeToRefs } from "pinia";
import OrderTimeline from "../../components/order/OrderTimeline.vue";
import Loading from '../../components/Loading.vue'
const route = useRoute();
const orderStore = useOrderStore();
const { currentOrder, loading, error } = storeToRefs(orderStore);

const showCancelModal = ref(false);
const cancelReason = ref("");
const cancelLoading = ref(false);

const canCancel = computed(() => {
  const status = currentOrder.value?.status || currentOrder.value?.orderStatus;
  return ["PENDING", "CONFIRMED", "pending", "confirmed"].includes(status);
});

const getStatusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    pending: "Pending",
    confirmed: "Confirmed",
    paid: "Paid",
    preparing: "Preparing",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const normalizedStatus = status?.toUpperCase() || "";
  const classes = {
    PENDING:
      "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    CONFIRMED:
      "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    PAID: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    PREPARING:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    PROCESSING:
      "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    IN_TRANSIT:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    OUT_FOR_DELIVERY:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    SHIPPED:
      "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
    DELIVERED:
      "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    CANCELLED: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  };
  return (
    classes[normalizedStatus] ||
    "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
  );
};

const getPaymentMethodLabel = (method) => {
  const normalizedMethod = method?.toLowerCase() || "";
  const methods = {
    cod: "Cash on Delivery",
    vnpay: "VNPay",
    momo: "Momo",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
  };
  return methods[normalizedMethod] || method;
};

const getItemName = (item) => {
  // Check if name is stored directly in orderItem (saved during order creation)
  if (item.name) return item.name;

  // Fallback to populated product/bundle
  return item.product?.name || item.bundle?.name || "Unknown Item";
};

const getItemImage = (item) => {
  // First check if image is stored directly in orderItem (saved during order creation)
  if (item.image) {
    // Handle if it's already a URL string
    if (typeof item.image === "string") return item.image;
    // Handle if it's an object with url property
    if (item.image.url) return item.image.url;
  }

  // Then check product.image (array)
  if (
    item.product?.image &&
    Array.isArray(item.product.image) &&
    item.product.image.length > 0
  ) {
    return item.product.image[0].url;
  }

  // Then check bundle.image
  if (item.bundle?.image) {
    return Array.isArray(item.bundle.image)
      ? item.bundle.image[0]?.url
      : item.bundle.image?.url || item.bundle.image;
  }

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
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const confirmCancel = async () => {
  try {
    cancelLoading.value = true;
    await orderStore.cancelOrder(route.params.id, cancelReason.value);
    showCancelModal.value = false;
    cancelReason.value = "";
  } catch (err) {
    console.error("Cancel order error:", err);
  } finally {
    cancelLoading.value = false;
  }
};

const fetchOrder = async () => {
  await orderStore.getOrder(route.params.id);
};

const canTrackOrder = computed(() => {
  const trackableStatuses = ["shipped", "processing", "paid", "confirmed"];
  const status = currentOrder.value?.status || currentOrder.value?.orderStatus;
  return trackableStatuses.includes(status?.toLowerCase());
});

onMounted(() => {
  fetchOrder();
});
</script>
