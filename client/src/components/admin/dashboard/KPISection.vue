<template>
  <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
    <DashboardCard
      title="Total Customers"
      :value="formatNumber(kpiStats.customers.total)"
      icon="users"
      :trend="kpiStats.customers.trend"
      bgColor="bg-blue-50 dark:bg-blue-950"
      textColor="text-blue-600 dark:text-blue-400"
      :isLoading="loading"
      :highlight="highlightCards.customers"
      @click="handleCardClick('customers')"
    />
    <DashboardCard
      title="Total Products"
      :value="formatNumber(kpiStats.products.total)"
      icon="package"
      :trend="kpiStats.products.trend"
      bgColor="bg-emerald-50 dark:bg-emerald-950"
      textColor="text-emerald-600 dark:text-emerald-400"
      :isLoading="loading"
      :highlight="highlightCards.products"
      @click="handleCardClick('products')"
    />
    <DashboardCard
      title="Total Orders"
      :value="formatNumber(kpiStats.orders.total)"
      icon="shopping-cart"
      :trend="kpiStats.orders.trend"
      bgColor="bg-purple-50 dark:bg-purple-950"
      textColor="text-purple-600 dark:text-purple-400"
      :isLoading="loading"
      :highlight="highlightCards.orders"
      @click="handleCardClick('orders')"
    />
    <DashboardCard
      title="Total Revenue"
      :value="formatCurrency(kpiStats.revenue.total)"
      icon="dollar"
      :trend="kpiStats.revenue.trend"
      bgColor="bg-orange-50 dark:bg-orange-950"
      textColor="text-orange-600 dark:text-orange-400"
      :isLoading="loading"
      :highlight="highlightCards.revenue"
      @click="handleCardClick('revenue')"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAdminStore } from "../../../store/admin/admin.store";
import { useAdminSocketStore } from "../../../store/admin/adminSocket.store";
import DashboardCard from "./DashboardCard.vue";

const router = useRouter();
const adminStore = useAdminStore();
const adminSocketStore = useAdminSocketStore();

// Props (keep for backward compatibility if needed)
const props = defineProps({
  stats: {
    type: Object,
    default: null,
  },
});

// Local state
const loading = ref(false);
const highlightCards = ref({
  customers: false,
  products: false,
  orders: false,
  revenue: false,
});

// Computed KPI stats from admin store
const kpiStats = computed(() => {
  const stats = adminStore.dashboardStats;

  return {
    customers: {
      total: stats.users?.total || 0,
      trend: calculateTrend(stats.users?.newToday, stats.users?.total),
      newToday: stats.users?.newToday || 0,
      online: stats.users?.online || 0,
    },
    products: {
      total: stats.products?.total || 0,
      trend: calculateProductTrend(stats.products),
      lowStock: stats.products?.lowStock || 0,
      outOfStock: stats.products?.outOfStock || 0,
      featured: stats.products?.featured || 0,
    },
    orders: {
      total: stats.orders?.total || 0,
      trend: calculateOrderTrend(stats.orders),
      pending: stats.orders?.pending || 0,
      delivered: stats.orders?.delivered || 0,
    },
    revenue: {
      total: stats.revenue?.month || 0,
      trend: formatTrend(stats.revenue?.trend?.daily || 0),
      today: stats.revenue?.today || 0,
      week: stats.revenue?.week || 0,
      month: stats.revenue?.month || 0,
    },
  };
});

// Methods
const formatNumber = (num) => {
  if (!num) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

const formatCurrency = (amount) => {
  if (!amount) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTrend = (percentage) => {
  if (!percentage) return "0%";
  const sign = percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}%`;
};

const calculateTrend = (newCount, total) => {
  if (!total || !newCount) return "0%";
  const percentage = (newCount / total) * 100;
  return formatTrend(percentage);
};

const calculateProductTrend = (products) => {
  if (!products) return "0%";
  const activeProducts = products.total - (products.outOfStock || 0);
  const percentage =
    products.total > 0 ? (activeProducts / products.total) * 100 - 100 : 0;
  return formatTrend(percentage);
};

const calculateOrderTrend = (orders) => {
  if (!orders || !orders.total) return "0%";
  const completedPercentage = (orders.delivered / orders.total) * 100;
  return formatTrend(completedPercentage - 50); // Assuming 50% is baseline
};

const handleCardClick = (cardType) => {
  switch (cardType) {
    case "customers":
      router.push({ name: "AdminUsers" });
      break;
    case "products":
      router.push({ name: "AdminProducts" });
      break;
    case "orders":
      router.push({ name: "AdminOrders" });
      break;
    case "revenue":
      router.push({ name: "AdminAnalytics", query: { tab: "revenue" } });
      break;
  }
};

const highlightCard = (cardType, duration = 2000) => {
  highlightCards.value[cardType] = true;
  setTimeout(() => {
    highlightCards.value[cardType] = false;
  }, duration);
};

// Watch for real-time updates and highlight changed cards
watch(
  () => adminStore.dashboardStats.users.total,
  (newVal, oldVal) => {
    if (oldVal && newVal > oldVal) {
      highlightCard("customers");
    }
  }
);

watch(
  () => adminStore.dashboardStats.products.total,
  (newVal, oldVal) => {
    if (oldVal && newVal > oldVal) {
      highlightCard("products");
    }
  }
);

watch(
  () => adminStore.dashboardStats.orders.total,
  (newVal, oldVal) => {
    if (oldVal && newVal > oldVal) {
      highlightCard("orders");
    }
  }
);

watch(
  () => adminStore.dashboardStats.revenue.month,
  (newVal, oldVal) => {
    if (oldVal && newVal > oldVal) {
      highlightCard("revenue");
    }
  }
);

// Initial data load
onMounted(async () => {
  if (!adminStore.isDataFresh) {
    loading.value = true;
    await adminStore.fetchDashboardStats();
    loading.value = false;
  }
});
</script>
