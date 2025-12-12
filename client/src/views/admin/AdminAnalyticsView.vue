<template>
  <div
    class="min-h-screen p-6 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
  >
    <!-- Header -->
    <div
      class="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1
          class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
        >
          📊 Analytics Dashboard
        </h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">
          Business insights and performance metrics
        </p>
      </div>
      <div class="flex gap-3">
        <select
          v-model="dateRange"
          @change="fetchAnalytics"
          class="px-4 py-2 transition-all border-2 border-transparent bg-white/80 backdrop-blur-sm rounded-xl dark:bg-slate-800/80 hover:border-blue-300 focus:border-blue-500 focus:outline-none"
        >
          <option value="7d">📅 Last 7 Days</option>
          <option value="30d">📅 Last 30 Days</option>
          <option value="90d">📅 Last 90 Days</option>
          <option value="1y">📅 Last Year</option>
        </select>
        <button
          @click="fetchAnalytics"
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-2 text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105"
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
          {{ loading ? "Loading..." : "Refresh" }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading && !analytics.revenue.total"
      class="flex flex-col items-center justify-center py-16"
    >
      <div class="relative">
        <div
          class="w-16 h-16 border-b-4 border-blue-600 rounded-full animate-spin"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-12 h-12 border-t-4 border-indigo-600 rounded-full animate-spin"
          ></div>
        </div>
      </div>
      <p class="mt-4 text-slate-600 dark:text-slate-400">
        Loading analytics data...
      </p>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Revenue Card -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg group rounded-2xl dark:bg-slate-800 hover:shadow-2xl hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 transition-all rounded-full opacity-20 bg-gradient-to-br from-green-400 to-emerald-600 group-hover:scale-150"
          ></div>
          <div class="relative p-6">
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-sm font-semibold text-slate-600 dark:text-slate-400"
              >
                💰 Revenue
              </p>
              <div class="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p
              class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
            >
              ${{ formatNumber(analytics.revenue?.total || 0) }}
            </p>
            <p
              class="flex items-center gap-1 mt-2 text-sm font-medium text-green-600"
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              +{{ analytics.revenue?.growth || 0 }}% vs last period
            </p>
          </div>
        </div>

        <!-- Orders Card -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg group rounded-2xl dark:bg-slate-800 hover:shadow-2xl hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 transition-all rounded-full opacity-20 bg-gradient-to-br from-blue-400 to-indigo-600 group-hover:scale-150"
          ></div>
          <div class="relative p-6">
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-sm font-semibold text-slate-600 dark:text-slate-400"
              >
                📦 Orders
              </p>
              <div class="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
            <p
              class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {{ formatNumber(analytics.orders?.total || 0) }}
            </p>
            <p
              class="flex items-center gap-1 mt-2 text-sm font-medium text-blue-600"
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              +{{ analytics.orders?.growth || 0 }}% vs last period
            </p>
          </div>
        </div>

        <!-- Customers Card -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg group rounded-2xl dark:bg-slate-800 hover:shadow-2xl hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 transition-all rounded-full opacity-20 bg-gradient-to-br from-purple-400 to-pink-600 group-hover:scale-150"
          ></div>
          <div class="relative p-6">
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-sm font-semibold text-slate-600 dark:text-slate-400"
              >
                👥 Customers
              </p>
              <div class="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                <svg
                  class="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <p
              class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {{ formatNumber(analytics.customers?.active || 0) }}
            </p>
            <p
              class="flex items-center gap-1 mt-2 text-sm font-medium text-purple-600"
            >
              <span class="text-purple-700"
                >✨ {{ analytics.customers?.new || 0 }} new customers</span
              >
            </p>
          </div>
        </div>

        <!-- Avg Order Value Card -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg group rounded-2xl dark:bg-slate-800 hover:shadow-2xl hover:scale-105"
        >
          <div
            class="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 transition-all rounded-full opacity-20 bg-gradient-to-br from-orange-400 to-red-600 group-hover:scale-150"
          ></div>
          <div class="relative p-6">
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-sm font-semibold text-slate-600 dark:text-slate-400"
              >
                💳 Avg Order
              </p>
              <div class="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                <svg
                  class="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p
              class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600"
            >
              ${{ formatNumber(analytics.avgOrderValue || 0) }}
            </p>
            <p
              class="flex items-center gap-1 mt-2 text-sm font-medium text-orange-600"
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              +{{ analytics.aovGrowth || 0 }}% vs last period
            </p>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <!-- Revenue Trend Chart -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg rounded-2xl dark:bg-slate-800 hover:shadow-xl"
        >
          <div
            class="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-800"
          >
            <h3
              class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              📈 Revenue Trend
            </h3>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Daily revenue performance
            </p>
          </div>
          <div class="p-6">
            <div class="h-64">
              <canvas ref="revenueChartRef"></canvas>
            </div>
          </div>
        </div>

        <!-- Orders by Status Chart -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg rounded-2xl dark:bg-slate-800 hover:shadow-xl"
        >
          <div
            class="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-800"
          >
            <h3
              class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
            >
              📊 Orders by Status
            </h3>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Order distribution overview
            </p>
          </div>
          <div class="p-6">
            <div class="h-64">
              <canvas ref="statusChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products & Categories -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Top Products -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg rounded-2xl dark:bg-slate-800 hover:shadow-xl"
        >
          <div
            class="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800"
          >
            <h3
              class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
            >
              🏆 Top Selling Products
            </h3>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Best performers this period
            </p>
          </div>
          <div class="p-6">
            <div
              v-if="analytics.topProducts && analytics.topProducts.length > 0"
              class="space-y-4"
            >
              <div
                v-for="(product, idx) in analytics.topProducts.slice(0, 5)"
                :key="product._id"
                class="flex items-center gap-4 p-3 transition-all border border-transparent rounded-xl hover:border-green-200 hover:bg-green-50 dark:hover:bg-slate-700"
              >
                <div
                  class="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="font-semibold truncate text-slate-900 dark:text-white"
                  >
                    {{ product.name }}
                  </p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    <span class="font-medium text-green-600">{{
                      product.sold
                    }}</span>
                    sold
                  </p>
                </div>
                <p
                  class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  ${{ formatNumber(product.revenue) }}
                </p>
              </div>
            </div>
            <div v-else class="py-8 text-center text-slate-500">
              <p>No product data available</p>
            </div>
          </div>
        </div>

        <!-- Category Performance -->
        <div
          class="relative overflow-hidden transition-all bg-white shadow-lg rounded-2xl dark:bg-slate-800 hover:shadow-xl"
        >
          <div
            class="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-800"
          >
            <h3
              class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600"
            >
              📂 Category Performance
            </h3>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Sales distribution by category
            </p>
          </div>
          <div class="p-6">
            <div
              v-if="
                analytics.categoryStats && analytics.categoryStats.length > 0
              "
              class="space-y-4"
            >
              <div
                v-for="cat in analytics.categoryStats"
                :key="cat._id"
                class="space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-slate-900 dark:text-white">{{
                    cat.name
                  }}</span>
                  <span class="text-sm font-medium text-orange-600"
                    >{{ cat.percentage }}%</span
                  >
                </div>
                <div
                  class="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                >
                  <div
                    class="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                    :style="{ width: `${cat.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center text-slate-500">
              <p>No category data available</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import {
  getDashboardAnalyticsApi,
  getRevenueAnalyticsApi,
  getProductAnalyticsApi,
  getCategoryStatsApi,
} from "../../service/admin.service";
import Chart from "chart.js/auto";

// State
const loading = ref(true);
const dateRange = ref("30d");
const revenueChartRef = ref(null);
const statusChartRef = ref(null);
let revenueChart = null;
let statusChart = null;

const analytics = reactive({
  revenue: { total: 0, growth: 0 },
  orders: { total: 0, growth: 0 },
  customers: { active: 0, new: 0 },
  avgOrderValue: 0,
  aovGrowth: 0,
  revenueTrend: [],
  topProducts: [],
  categoryStats: [],
  ordersByStatus: {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
  },
});

// Methods
const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0.00";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(2);
};

const fetchAnalytics = async () => {
  loading.value = true;
  try {
    const days =
      dateRange.value === "7d"
        ? 7
        : dateRange.value === "30d"
        ? 30
        : dateRange.value === "90d"
        ? 90
        : 365;

    // Fetch all analytics data
    const [dashboardRes, revenueRes, productRes, categoryRes] =
      await Promise.all([
        getDashboardAnalyticsApi({ useCache: false }).catch((err) => {
          console.error("Dashboard API error:", err);
          return { success: false, data: null };
        }),
        getRevenueAnalyticsApi({ days }).catch((err) => {
          console.error("Revenue API error:", err);
          return { success: false, data: [] };
        }),
        getProductAnalyticsApi({ limit: 10 }).catch((err) => {
          console.error("Product API error:", err);
          return { success: false, data: { topProducts: [] } };
        }),
        getCategoryStatsApi().catch((err) => {
          console.error("Category API error:", err);
          return { success: false, data: [] };
        }),
      ]);

    console.log("📊 Dashboard Response:", dashboardRes);
    console.log("💰 Revenue Response:", revenueRes);
    console.log("📦 Product Response:", productRes);
    console.log("📂 Category Response:", categoryRes);

    // Process dashboard data
    if (dashboardRes.success && dashboardRes.data) {
      const data = dashboardRes.data;

      console.log(
        "🔍 Dashboard Data Structure:",
        JSON.stringify(data, null, 2)
      );

      // Overview stats - Check multiple possible structures
      if (data.overview) {
        // Backend returns: totalRevenue, totalOrders, totalUsers, averageOrderValue
        analytics.revenue = {
          total:
            data.overview.totalRevenue || data.overview.revenue?.total || 0,
          growth: data.overview.revenue?.growth || 0,
        };
        analytics.orders = {
          total: data.overview.totalOrders || data.overview.orders?.total || 0,
          growth: data.overview.orders?.growth || 0,
        };
        analytics.customers = {
          active:
            data.overview.totalUsers ||
            data.overview.customers?.total ||
            data.overview.users?.total ||
            0,
          new:
            data.overview.newUsers ||
            data.overview.customers?.new ||
            data.overview.users?.new ||
            0,
        };
        analytics.avgOrderValue =
          data.overview.averageOrderValue || data.overview.avgOrderValue || 0;

        console.log("✅ Parsed Analytics:", {
          revenue: analytics.revenue,
          orders: analytics.orders,
          customers: analytics.customers,
          avgOrderValue: analytics.avgOrderValue,
        });
      } else {
        console.warn("⚠️ No overview data in response");
      }

      // Orders by status
      if (data.orders?.byStatus) {
        data.orders.byStatus.forEach((item) => {
          const status = item._id?.toLowerCase();
          if (status && analytics.ordersByStatus.hasOwnProperty(status)) {
            analytics.ordersByStatus[status] = item.count || 0;
          }
        });
      } else if (data.ordersByStatus) {
        // Alternative structure
        data.ordersByStatus.forEach((item) => {
          const status = item._id?.toLowerCase();
          if (status && analytics.ordersByStatus.hasOwnProperty(status)) {
            analytics.ordersByStatus[status] = item.count || item.total || 0;
          }
        });
      }
    } else {
      console.error("❌ Dashboard API failed or returned no data");
    }

    // Process revenue trend
    if (revenueRes.success && revenueRes.data) {
      analytics.revenueTrend = Array.isArray(revenueRes.data)
        ? revenueRes.data
        : [];
    }

    // Process products
    if (productRes.success && productRes.data) {
      const products = productRes.data.topProducts || productRes.data || [];
      analytics.topProducts = products.map((p) => ({
        _id: p._id || p.product?._id,
        name: p.name || p.product?.name || "Unknown Product",
        sold: p.totalSold || p.sold || 0,
        revenue: p.totalRevenue || p.revenue || p.totalSold * (p.price || 0),
      }));
    }

    // Process categories
    if (categoryRes.success && categoryRes.data) {
      const categories = Array.isArray(categoryRes.data)
        ? categoryRes.data
        : [];

      console.log("📂 Raw Category Data:", categories);

      const totalSales = categories.reduce(
        (sum, c) => sum + (c.totalSold || c.totalRevenue || c.sales || 0),
        0
      );

      analytics.categoryStats = categories
        .filter((c) => c.name || c._id) // Filter out invalid entries
        .map((c) => ({
          _id: c._id,
          name:
            c.name ||
            c.categoryInfo?.name ||
            c.category?.name ||
            `Category ${c._id?.toString().slice(-4)}`,
          percentage:
            totalSales > 0
              ? Math.round(
                  ((c.totalSold || c.totalRevenue || c.sales || 0) /
                    totalSales) *
                    100
                )
              : 0,
        }));

      console.log("📂 Processed Category Stats:", analytics.categoryStats);
    }

    await nextTick();
    updateCharts();
  } catch (err) {
    console.error("❌ Failed to fetch analytics:", err);
  } finally {
    loading.value = false;
  }
};

const updateCharts = () => {
  // Revenue Trend Chart
  if (revenueChartRef.value) {
    if (revenueChart) revenueChart.destroy();

    const labels = analytics.revenueTrend.map((d) => {
      if (d.date)
        return new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      if (d._id) return d._id;
      return "";
    });
    const data = analytics.revenueTrend.map((d) => d.revenue || d.total || 0);

    revenueChart = new Chart(revenueChartRef.value, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue ($)",
            data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#3b82f6",
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  // Orders by Status Chart
  if (statusChartRef.value) {
    if (statusChart) statusChart.destroy();

    const statusData = [
      analytics.ordersByStatus.pending,
      analytics.ordersByStatus.confirmed,
      analytics.ordersByStatus.preparing,
      analytics.ordersByStatus.in_transit,
      analytics.ordersByStatus.delivered,
      analytics.ordersByStatus.cancelled,
    ];

    statusChart = new Chart(statusChartRef.value, {
      type: "doughnut",
      data: {
        labels: [
          "⏳ Pending",
          "✅ Confirmed",
          "📦 Preparing",
          "🚚 In Transit",
          "✨ Delivered",
          "❌ Cancelled",
        ],
        datasets: [
          {
            data: statusData,
            backgroundColor: [
              "#fbbf24", // amber
              "#3b82f6", // blue
              "#8b5cf6", // purple
              "#6366f1", // indigo
              "#22c55e", // green
              "#ef4444", // red
            ],
            borderWidth: 3,
            borderColor: "#fff",
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              font: {
                size: 12,
                weight: "500",
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleColor: "#fff",
            bodyColor: "#fff",
          },
        },
      },
    });
  }
};

onMounted(() => {
  fetchAnalytics();
});

onUnmounted(() => {
  if (revenueChart) revenueChart.destroy();
  if (statusChart) statusChart.destroy();
});
</script>
