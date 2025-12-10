<template>
  <div
    class="min-h-screen py-8 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
  >
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <button
        @click="$router.push('/account/profile')"
        class="flex items-center gap-2 mb-6 text-gray-700 transition-all hover:text-rose-600 hover:translate-x-[-4px] bg-transparent"
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
        <span class="font-medium">Back to Profile</span>
      </button>
      <!-- Header -->
      <div class="relative mb-8 overflow-hidden bg-white shadow-lg rounded-2xl">
        <div
          class="absolute top-0 right-0 w-64 h-64 rounded-full opacity-50 bg-gradient-to-br from-rose-100 to-pink-100 blur-3xl -z-0"
        ></div>
        <div class="relative z-10 p-6">
          <h1
            class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
          >
            My Orders
          </h1>
          <p class="mt-2 text-sm text-gray-600">Track and manage your orders</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6 overflow-hidden bg-white shadow-lg rounded-2xl">
        <nav class="flex p-2 space-x-2 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="px-6 py-3 text-sm font-semibold transition-all rounded-xl whitespace-nowrap"
            :class="{
              'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md scale-105':
                activeTab === tab.value,
              'text-gray-600 hover:bg-rose-50': activeTab !== tab.value,
            }"
          >
            {{ tab.label }}
            <span
              v-if="getTabCount(tab.value) > 0"
              class="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
              :class="{
                'bg-white/20 text-white': activeTab === tab.value,
                'bg-rose-100 text-rose-700': activeTab !== tab.value,
              }"
            >
              {{ getTabCount(tab.value) }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && orders.length === 0"
        class="flex justify-center py-16"
      >
        <Loading />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="py-16 text-center">
        <div
          class="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-100 to-pink-100"
        >
          <svg
            class="w-12 h-12 text-rose-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2
          class="mb-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600"
        >
          No orders found
        </h2>
        <p class="mb-8 text-gray-600">
          {{
            activeTab === "all"
              ? "You haven't placed any orders yet"
              : `No ${activeTab} orders`
          }}
        </p>
        <button
          @click="$router.push('/shop')"
          class="px-8 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl hover:from-rose-600 hover:to-pink-700 hover:shadow-lg hover:scale-105"
        >
          Start Shopping
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OrderCard
          v-for="order in filteredOrders"
          :key="order._id"
          :order="order"
          @click="viewOrder"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "../../store/order.store";
import { storeToRefs } from "pinia";
import OrderCard from "../../components/order/OrderCard.vue";
import Loading from "../../components/Loading.vue";
const router = useRouter();
const orderStore = useOrderStore();
const { orders, loading } = storeToRefs(orderStore);

const activeTab = ref("all");
let autoRefreshInterval = null;

const tabs = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Preparing", value: "preparing" },
  { label: "In Transit", value: "in_transit" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const filteredOrders = computed(() => {
  if (activeTab.value === "all") return orders.value;

  // Map tab values to order status values
  const statusMap = {
    pending: ["PENDING"],
    confirmed: ["CONFIRMED"],
    preparing: ["PREPARING"],
    in_transit: ["IN_TRANSIT"],
    out_for_delivery: ["OUT_FOR_DELIVERY"],
    delivered: ["DELIVERED"],
    cancelled: ["CANCELLED"],
  };

  const statusValues = statusMap[activeTab.value];
  if (!statusValues) return orders.value;

  return orders.value.filter((order) => statusValues.includes(order.status));
});

const getTabCount = (tabValue) => {
  if (tabValue === "all") return orders.value.length;

  // Map tab values to order status values
  const statusMap = {
    pending: ["PENDING"],
    confirmed: ["CONFIRMED"],
    preparing: ["PREPARING"],
    in_transit: ["IN_TRANSIT"],
    out_for_delivery: ["OUT_FOR_DELIVERY"],
    delivered: ["DELIVERED"],
    cancelled: ["CANCELLED"],
  };

  const statusValues = statusMap[tabValue];
  if (!statusValues) return 0;

  return orders.value.filter((order) => statusValues.includes(order.status))
    .length;
};

const viewOrder = (orderId) => {
  router.push(`/orders/${orderId}`);
};

onMounted(async () => {
  await orderStore.fetchMyOrders();

  // Auto-refresh orders list every 60 seconds to show updates from cron job
  autoRefreshInterval = setInterval(async () => {
    // Silently refresh without showing loading spinner
    const currentLoading = loading.value;
    await orderStore.fetchMyOrders();
    // Restore loading state if it was false (silent refresh)
    if (!currentLoading) {
      loading.value = false;
    }
  }, 60000); // Refresh every 60 seconds
});

onUnmounted(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});
</script>
