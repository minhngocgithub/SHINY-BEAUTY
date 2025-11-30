<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="$router.push('/orders')"
        class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
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
      <div v-if="loading && !currentOrder" class="flex justify-center py-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"
        ></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <button
          @click="fetchOrder"
          class="mt-4 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Retry
        </button>
      </div>

      <!-- Order Content -->
      <div v-else-if="currentOrder" class="space-y-6">
        <!-- Header -->
        <div
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{{ currentOrder._id?.slice(-8).toUpperCase() }}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Placed on {{ formatDate(currentOrder.createdAt) }}
              </p>
            </div>
            <span
              class="px-4 py-2 rounded-full text-sm font-medium"
              :class="getStatusClass(currentOrder.orderStatus)"
            >
              {{ getStatusLabel(currentOrder.orderStatus) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Order Items -->
            <div
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <h2 class="font-semibold text-gray-900 dark:text-white mb-4">
                Order Items
              </h2>
              <div class="space-y-4">
                <div
                  v-for="item in currentOrder.orderItems"
                  :key="item._id"
                  class="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                >
                  <img
                    :src="getItemImage(item)"
                    :alt="getItemName(item)"
                    class="w-20 h-20 object-cover rounded"
                  />
                  <div class="flex-1 min-w-0">
                    <h3
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ getItemName(item) }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Qty: {{ item.quantity }}
                    </p>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ formatCurrency(item.price * item.quantity) }}
                    </div>
                    <div
                      v-if="item.originalPrice > item.price"
                      class="text-xs text-gray-400 dark:text-gray-500 line-through"
                    >
                      {{ formatCurrency(item.originalPrice * item.quantity) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <h2 class="font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Address
              </h2>
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p class="font-medium text-gray-900 dark:text-white">
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

            <!-- Payment Info -->
            <div
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <h2 class="font-semibold text-gray-900 dark:text-white mb-4">
                Payment Information
              </h2>
              <div class="text-sm space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Payment Method</span
                  >
                  <span class="text-gray-900 dark:text-white">{{
                    getPaymentMethodLabel(currentOrder.paymentMethod)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Payment Status</span
                  >
                  <span class="text-gray-900 dark:text-white">{{
                    currentOrder.isPaid ? "Paid" : "Unpaid"
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Order Summary -->
            <div
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <h2 class="font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span class="text-gray-900 dark:text-white">{{
                    formatCurrency(currentOrder.itemsPrice)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span class="text-gray-900 dark:text-white">{{
                    formatCurrency(currentOrder.shippingPrice)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Tax</span>
                  <span class="text-gray-900 dark:text-white">{{
                    formatCurrency(currentOrder.taxPrice)
                  }}</span>
                </div>
                <div
                  v-if="currentOrder.totalDiscount > 0"
                  class="flex justify-between"
                >
                  <span class="text-gray-600 dark:text-gray-400">Discount</span>
                  <span class="text-red-600 dark:text-red-400"
                    >-{{ formatCurrency(currentOrder.totalDiscount) }}</span
                  >
                </div>
                <div
                  class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <span class="font-semibold text-gray-900 dark:text-white"
                    >Total</span
                  >
                  <span
                    class="font-bold text-lg text-gray-900 dark:text-white"
                    >{{ formatCurrency(currentOrder.totalPrice) }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <OrderTimeline
              :status="currentOrder.orderStatus"
              :created-at="currentOrder.createdAt"
              :paid-at="currentOrder.paidAt"
              :shipped-at="currentOrder.shippedAt"
              :delivered-at="currentOrder.deliveredAt"
              :cancelled-at="currentOrder.cancelledAt"
            />

            <!-- Actions -->
            <div
              v-if="canCancel"
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <button
                @click="showCancelModal = true"
                :disabled="cancelLoading"
                class="w-full py-2.5 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Modal -->
      <div
        v-if="showCancelModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
        @click.self="showCancelModal = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cancel Order
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </p>
          <textarea
            v-model="cancelReason"
            rows="3"
            placeholder="Reason for cancellation (optional)"
            class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none mb-4"
          ></textarea>
          <div class="flex gap-3">
            <button
              @click="confirmCancel"
              :disabled="cancelLoading"
              class="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ cancelLoading ? "Cancelling..." : "Confirm Cancel" }}
            </button>
            <button
              @click="showCancelModal = false"
              :disabled="cancelLoading"
              class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Keep Order
            </button>
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

const route = useRoute();
const orderStore = useOrderStore();
const { currentOrder, loading, error } = storeToRefs(orderStore);

const showCancelModal = ref(false);
const cancelReason = ref("");
const cancelLoading = ref(false);

const canCancel = computed(() => {
  return ["pending", "confirmed"].includes(currentOrder.value?.orderStatus);
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

const getPaymentMethodLabel = (method) => {
  const methods = {
    cod: "Cash on Delivery",
    vnpay: "VNPay",
    momo: "Momo",
    paypal: "PayPal",
  };
  return methods[method] || method;
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

onMounted(() => {
  fetchOrder();
});
</script>
