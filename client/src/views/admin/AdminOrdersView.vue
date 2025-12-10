<template>
  <div class="h-screen p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
    <!-- Header with Realtime Indicator -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p class="mt-1 text-gray-600 dark:text-gray-400">
            Manage and track all customer orders
          </p>
        </div>
        <!-- Added realtime connection indicator -->
        <div class="flex items-center gap-3">
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            :class="
              socketStore.connected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            "
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="socketStore.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
            ></span>
            {{ socketStore.connected ? 'Live' : 'Offline' }}
          </div>
          <button
            @click="fetchOrders"
            :disabled="loading"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'animate-spin': loading }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Order Stats Cards -->
    <div class="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4 lg:grid-cols-6">
      <div
        v-for="stat in orderStats"
        :key="stat.status"
        @click="filters.status = stat.status === 'ALL' ? '' : stat.status"
        class="p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer dark:bg-gray-800 hover:shadow-md"
        :class="{ 'ring-2 ring-blue-500': (filters.status || 'ALL') === stat.status }"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-lg"
            :class="stat.bgColor"
          >
            <span class="text-lg">{{ stat.icon }}</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stat.count }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="p-4 mb-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by Order ID, Customer name..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            @input="debouncedSearch"
          />
        </div>

        <!-- Status Filter -->
        <select
          v-model="filters.status"
          class="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <!-- Payment Status Filter -->
        <select
          v-model="filters.paymentStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Payments</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <!-- Date Range & Actions -->
      <div class="flex flex-wrap gap-4 mt-4">
        <input
          v-model="filters.startDate"
          type="date"
          class="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <input
          v-model="filters.endDate"
          type="date"
          class="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <button
          @click="resetFilters"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Reset Filters
        </button>
        <button
          @click="exportOrders"
          class="flex items-center gap-2 px-4 py-2 ml-auto text-white bg-green-600 rounded-lg hover:bg-green-700"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loading />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <!-- Orders Table -->
    <div
      v-else
      class="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Order ID
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Customer
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Date
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Total
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Payment
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="order in orders"
              :key="order._id"
              class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': highlightedOrderId === order._id }"
            >
              <td
                class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                :class="
                  order.status === 'CANCELLED' ? 'line-through opacity-60' : ''
                "
              >
                {{ order.orderNumber || order._id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ order.user?.name || "Unknown" }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ order.user?.email || "" }}
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400"
              >
                {{ formatDate(order.createdAt) }}
              </td>
              <td
                class="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap dark:text-white"
              >
                ${{ order.totalPrice?.toFixed(2) || "0.00" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    getPaymentStatusClass(order.isPaid, order.paymentResult)
                  "
                >
                  {{ formatPaymentStatus(order.isPaid, order.paymentResult) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)">
                  {{ formatStatus(order.status) }}
                </span>
              </td>
              <td
                class="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap"
              >
                <button
                  @click="viewOrderDetail(order)"
                  class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  View
                </button>

                <button
                  v-if="order.status === 'PENDING'"
                  @click="confirmOrder(order._id)"
                  class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30 transition-colors duration-200"
                >
                  Confirm
                </button>

                <button
                  v-if="['PENDING', 'CONFIRMED'].includes(order.status)"
                  @click="cancelOrder(order._id)"
                  class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors duration-200"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="orders.length === 0" class="py-12 text-center">
        <svg
          class="w-12 h-12 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No orders found
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
      >
        <div class="flex justify-between flex-1 sm:hidden">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div
          class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing
              <span class="font-medium">{{ (currentPage - 1) * 10 + 1 }}</span>
              to
              <span class="font-medium">{{
                Math.min(currentPage * 10, totalOrders)
              }}</span>
              of <span class="font-medium">{{ totalOrders }}</span> results
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
            >
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <OrderDetailModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
      @updated="handleOrderUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAdminOrderStore } from "../../store/admin/adminOrder.store";
import { useAdminSocketStore } from "../../store/admin/adminSocket.store";
import { useAdminStore } from "../../store/admin/admin.store";
import {
  confirmOrderApi,
  adminCancelOrderApi,
} from "../../service/admin.service";
import OrderDetailModal from "../../components/admin/orders/OrderDetailModal.vue";
import Loading from "../../components/Loading.vue";

// Stores
const adminOrderStore = useAdminOrderStore();
const socketStore = useAdminSocketStore();
const adminStore = useAdminStore();

// Store refs
const {
  allOrders: orders,
  loading,
  error,
  currentPage,
  totalPages,
  totalOrders,
  filters,
} = storeToRefs(adminOrderStore);

// Local state
const searchTimeout = ref(null);
const selectedOrder = ref(null);
const highlightedOrderId = ref(null);

const orderStats = computed(() => {
  const stats = adminStore.dashboardStats.orders;
  return [
    { status: 'ALL', label: 'All', count: stats.total || 0, icon: '📋', bgColor: 'bg-gray-100 dark:bg-gray-700' },
    { status: 'PENDING', label: 'Pending', count: stats.pending || 0, icon: '⏳', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { status: 'CONFIRMED', label: 'Confirmed', count: stats.confirmed || 0, icon: '✅', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { status: 'PREPARING', label: 'Preparing', count: stats.preparing || 0, icon: '📦', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { status: 'IN_TRANSIT', label: 'In Transit', count: stats.in_transit || 0, icon: '🚚', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { status: 'DELIVERED', label: 'Delivered', count: stats.delivered || 0, icon: '🎉', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  ];
});

// Methods
const fetchOrders = async () => {
  await adminOrderStore.fetchAllOrders();
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    adminOrderStore.currentPage = 1;
    fetchOrders();
  }, 500);
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    adminOrderStore.changePage(page);
  }
};

const resetFilters = () => {
  adminOrderStore.clearFilters();
  fetchOrders();
};

const confirmOrder = async (orderId) => {
  if (!confirm("Confirm this order?")) return;

  try {
    console.log("🔄 Confirming order:", orderId);
    const response = await confirmOrderApi(orderId);
    console.log("✅ Confirm response:", response);

    alert("Order confirmed successfully!");
    await fetchOrders();
  } catch (err) {
    console.error("❌ Failed to confirm order:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);

    const errorMessage =
      err.response?.data?.message || err.message || "Unknown error occurred";
    alert(`Failed to confirm order: ${errorMessage}`);
  }
};

const cancelOrder = async (orderId) => {
  const reason = prompt("Enter cancellation reason:");
  if (!reason) return;

  try {
    console.log("🔄 Cancelling order:", orderId, "Reason:", reason);
    const response = await adminCancelOrderApi(orderId, { reason });
    console.log("✅ Cancel response:", response);

    alert("Order cancelled successfully!");
    await fetchOrders();
  } catch (err) {
    console.error("❌ Failed to cancel order:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);

    const errorMessage =
      err.response?.data?.message || err.message || "Unknown error occurred";
    alert(`Failed to cancel order: ${errorMessage}`);
  }
};

const viewOrderDetail = (order) => {
  selectedOrder.value = order;
};

const handleOrderUpdated = () => {
  selectedOrder.value = null;
  fetchOrders();
};

const exportOrders = () => {
  // TODO: Implement CSV export
  alert("Export functionality coming soon!");
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status) => {
  const statusMap = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    // Support lowercase for backward compatibility
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};

const formatPaymentStatus = (isPaid, paymentResult) => {
  if (isPaid) return "Paid";
  if (paymentResult?.status === "failed") return "Failed";
  if (paymentResult?.status === "refunded") return "Refunded";
  return "Pending";
};

const getStatusClass = (status) => {
  // Normalize to uppercase
  const normalizedStatus = status?.toUpperCase();

  const classes = {
    PENDING:
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    CONFIRMED:
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    PREPARING:
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    IN_TRANSIT:
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    OUT_FOR_DELIVERY:
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    DELIVERED:
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELLED:
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return classes[normalizedStatus] || classes.PENDING;
};

const getPaymentStatusClass = (isPaid, paymentResult) => {
  if (isPaid) {
    return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
  if (paymentResult?.status === "failed") {
    return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
  if (paymentResult?.status === "refunded") {
    return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
  return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
};

// Watch for filter changes
watch(
  () => filters.value.status,
  () => {
    adminOrderStore.currentPage = 1;
    fetchOrders();
  }
);

watch(
  () => filters.value.paymentStatus,
  () => {
    adminOrderStore.currentPage = 1;
    fetchOrders();
  }
);

watch(
  () => filters.value.startDate,
  () => {
    fetchOrders();
  }
);

watch(
  () => filters.value.endDate,
  () => {
    fetchOrders();
  }
);

watch(
  () => adminOrderStore.pendingOrders,
  (newOrders) => {
    if (newOrders?.length > 0) {
      // Highlight new order
      const latestOrder = newOrders[0];
      highlightedOrderId.value = latestOrder._id;
      setTimeout(() => {
        highlightedOrderId.value = null;
      }, 5000);
    }
  },
  { deep: true }
);

// Lifecycle
const fetchOrdersOnMount = async () => {
  await fetchOrders();
  // Subscribe to realtime order updates
  if (socketStore.connected) {
    socketStore.subscribeToOrders();
  }
};

const unsubscribeOnUnmount = () => {
  clearTimeout(searchTimeout.value);
  // Unsubscribe from orders
  socketStore.unsubscribeFromOrders();
};

onMounted(fetchOrdersOnMount);
onUnmounted(unsubscribeOnUnmount);
</script>
