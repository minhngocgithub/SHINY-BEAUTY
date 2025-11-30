<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          My Orders
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Track and manage your orders
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav class="flex space-x-8 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors"
            :class="{
              'border-gray-900 dark:border-white text-gray-900 dark:text-white':
                activeTab === tab.value,
              'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
                activeTab !== tab.value,
            }"
          >
            {{ tab.label }}
            <span
              v-if="getTabCount(tab.value) > 0"
              class="ml-2 px-2 py-0.5 rounded-full text-xs"
              :class="{
                'bg-gray-900 dark:bg-white text-white dark:text-gray-900':
                  activeTab === tab.value,
                'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400':
                  activeTab !== tab.value,
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
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"
        ></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="text-center py-16">
        <div
          class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-12 h-12 text-gray-400 dark:text-gray-600"
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
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No orders found
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {{
            activeTab === "all"
              ? "You haven't placed any orders yet"
              : `No ${activeTab} orders`
          }}
        </p>
        <button
          @click="$router.push('/shop')"
          class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          Start Shopping
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "../../store/order.store";
import { storeToRefs } from "pinia";
import OrderCard from "../../components/order/OrderCard.vue";

const router = useRouter();
const orderStore = useOrderStore();
const { orders, loading } = storeToRefs(orderStore);

const activeTab = ref("all");

const tabs = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const filteredOrders = computed(() => {
  if (activeTab.value === "all") return orders.value;

  if (activeTab.value === "processing") {
    return orders.value.filter((order) =>
      ["confirmed", "paid", "processing"].includes(order.orderStatus)
    );
  }

  return orders.value.filter((order) => order.orderStatus === activeTab.value);
});

const getTabCount = (tabValue) => {
  if (tabValue === "all") return orders.value.length;

  if (tabValue === "processing") {
    return orders.value.filter((order) =>
      ["confirmed", "paid", "processing"].includes(order.orderStatus)
    ).length;
  }

  return orders.value.filter((order) => order.orderStatus === tabValue).length;
};

const viewOrder = (orderId) => {
  router.push(`/orders/${orderId}`);
};

onMounted(async () => {
  await orderStore.fetchMyOrders();
});
</script>
