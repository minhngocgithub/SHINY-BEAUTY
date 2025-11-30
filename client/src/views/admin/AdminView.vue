<template>
  <div
    class="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"
  >
    <HeaderSection
      :isDarkMode="isDarkMode"
      :userName="userName"
      @toggleDarkMode="toggleDarkMode"
    />

    <div
      v-if="loading"
      class="p-6 flex justify-center items-center min-h-[400px]"
    >
      <Loading />
    </div>

    <div v-else-if="error" class="p-6">
      <div
        class="relative px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded"
        role="alert"
      >
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
        <button
          @click="fetchData"
          class="px-4 py-2 ml-4 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-6">
      <KPISection :stats="stats" />
      <ChartsSection :stats="stats" />
      <OrdersSection :stats="stats" />
      <ActionsSection />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useDarkMode } from "../../store/darkMode";
import { useAuthStore } from "../../store/auth.store";
import {
  getDashboardAnalyticsApi,
  getPendingOrdersApi,
  getRevenueAnalyticsApi,
  getSalesAnalyticsApi,
  getProductAnalyticsApi,
  getUserAnalyticsApi,
  getInventoryAnalyticsApi,
} from "../../service/admin.service";
import HeaderSection from "../../components/admin/dashboard/HeaderSection.vue";
import KPISection from "../../components/admin/dashboard/KPISection.vue";
import ChartsSection from "../../components/admin/dashboard/ChartsSection.vue";
import OrdersSection from "../../components/admin/dashboard/OrdersSection.vue";
import ActionsSection from "../../components/admin/dashboard/ActionSection.vue";
import Loading from '../../components/Loading.vue'
// State
const isDarkMode = ref(false);
const userName = ref("Admin");
const loading = ref(true);
const error = ref(null);
const stats = ref({
  totalCustomers: "0",
  customerTrend: "0%",
  totalProducts: "0",
  productTrend: "0%",
  totalOrders: "0",
  orderTrend: "0%",
  totalRevenue: "0",
  revenueTrend: "0%",
  topProducts: [],
  recentOrders: [],
  pendingOrders: [],
  salesTrends: [],
  revenueTrends: [],
  lowStockProducts: [],
  topCustomers: [],
  ordersByStatus: [],
});
const refreshInterval = ref(null);

// Methods
const toggleDarkMode = () => {
  const darkModeStore = useDarkMode();
  darkModeStore.setMode();
  isDarkMode.value = darkModeStore.isEnable;
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k+`;
  }
  return `${num}+`;
};

const formatCurrency = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toFixed(2);
};

const formatTrend = (value) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

const formatStatus = (status) => {
  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Completed",
    cancelled: "Cancelled",
    returned: "Returned",
  };
  return statusMap[status] || status;
};

const fetchData = async (silent = false) => {
  try {
    if (!silent) loading.value = true;
    error.value = null;

    // Fetch all analytics data in parallel
    const [
      dashboardResponse,
      ordersResponse,
      revenueResponse,
      salesResponse,
      productResponse,
      userResponse,
      inventoryResponse,
    ] = await Promise.all([
      getDashboardAnalyticsApi({ useCache: true }),
      getPendingOrdersApi({ limit: 6, page: 1 }),
      getRevenueAnalyticsApi({ days: 30 }).catch(() => null),
      getSalesAnalyticsApi({ days: 30 }).catch(() => null),
      getProductAnalyticsApi({ limit: 10 }).catch(() => null),
      getUserAnalyticsApi({ days: 30 }).catch(() => null),
      getInventoryAnalyticsApi().catch(() => null),
    ]);

    const analytics = dashboardResponse.data;

    // === KPI STATS ===
    stats.value.totalCustomers = formatNumber(
      analytics.overview?.totalUsers || 0
    );
    stats.value.customerTrend = formatTrend(
      userResponse?.data?.growth?.percentage || 0
    );

    stats.value.totalProducts = formatNumber(
      analytics.overview?.totalProducts || 0
    );
    stats.value.productTrend = formatTrend(
      productResponse?.data?.growth?.percentage || 0
    );

    stats.value.totalOrders = formatNumber(
      analytics.overview?.totalOrders || 0
    );
    stats.value.orderTrend = formatTrend(
      analytics.orders?.summary?.growthRate || 0
    );

    stats.value.totalRevenue = formatCurrency(
      analytics.overview?.totalRevenue || 0
    );
    stats.value.revenueTrend = formatTrend(
      revenueResponse?.data?.growthRate || 0
    );

    // === TOP PRODUCTS ===
    const maxSold = Math.max(
      ...(productResponse?.data?.topProducts || []).map(
        (p) => p.totalSold || 0
      ),
      1
    );
    stats.value.topProducts = (productResponse?.data?.topProducts || [])
      .slice(0, 5)
      .map((product, index) => {
        const colors = [
          "bg-blue-500",
          "bg-amber-500",
          "bg-red-500",
          "bg-green-500",
          "bg-purple-500",
        ];
        return {
          id: product._id || index,
          name: product.name || "Unknown Product",
          percentage: Math.min(100, (product.totalSold / maxSold) * 100 || 0),
          totalSold: product.totalSold || 0,
          revenue: product.totalRevenue || 0,
          color: colors[index % colors.length],
        };
      });

    // === RECENT ORDERS ===
    stats.value.recentOrders = (ordersResponse.data?.data?.orders || []).map(
      (order) => ({
        id: order.orderNumber || order._id,
        customer: order.user?.name || "Unknown Customer",
        date: new Date(order.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        }),
        price: `$${order.totalPrice?.toFixed(2) || "0.00"}`,
        status: formatStatus(order.orderStatus),
      })
    );

    // === PENDING ORDERS SUMMARY ===
    stats.value.pendingOrders = (ordersResponse.data?.data?.orders || [])
      .slice(0, 3)
      .map((order) => ({
        id: order.orderNumber || order._id,
        customer: `${order.user?.name || "Unknown"} - $${
          order.totalPrice?.toFixed(2) || "0.00"
        }`,
      }));

    // === REVENUE TRENDS (for charts) ===
    stats.value.revenueTrends = (revenueResponse?.data?.trends || []).map(
      (trend) => ({
        date: new Date(trend.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        revenue: trend.revenue || 0,
        orders: trend.orderCount || 0,
      })
    );

    // === SALES TRENDS (for charts) ===
    stats.value.salesTrends = (salesResponse?.data?.dailySales || []).map(
      (sale) => ({
        date: new Date(sale.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        sales: sale.totalSales || 0,
        orders: sale.orderCount || 0,
      })
    );

    // === LOW STOCK PRODUCTS ===
    stats.value.lowStockProducts = (inventoryResponse?.data?.lowStock || [])
      .slice(0, 5)
      .map((product) => ({
        id: product._id,
        name: product.name,
        stock: product.countInStock,
        status: product.countInStock === 0 ? "Out of Stock" : "Low Stock",
      }));

    // === ORDER STATUS BREAKDOWN ===
    stats.value.ordersByStatus = analytics.orders?.byStatus || [];

    // === REALTIME DATA (Today's Overview) ===
    stats.value.todayOrders = analytics.realTime?.todayOrders || 0;
    stats.value.todayRevenue = (analytics.realTime?.todayRevenue || 0).toFixed(
      2
    );
    stats.value.activeUsers = analytics.realTime?.activeUsers || 0;
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    if (!silent) {
      error.value =
        err.response?.data?.message ||
        "Failed to load dashboard data. Please try again.";
    }
  } finally {
    if (!silent) loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  const darkModeStore = useDarkMode();
  isDarkMode.value = darkModeStore.isEnable;

  // Get user name from auth store
  const authStore = useAuthStore();
  userName.value = authStore.user?.name || "Admin";

  await fetchData();

  // Auto-refresh every 30 seconds
  refreshInterval.value = setInterval(() => {
    fetchData(true);
  }, 30000);
});

onBeforeUnmount(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>
