<template>
  <div class="min-h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <div class="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">Business insights and performance metrics</p>
      </div>
      <div class="flex gap-3">
        <select
          v-model="dateRange"
          @change="fetchAnalytics"
          class="px-4 py-2 bg-white border rounded-lg dark:bg-slate-800 dark:border-slate-700"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
        <button
          @click="fetchAnalytics"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <p class="text-sm font-medium text-slate-600">Revenue</p>
          <p class="mt-2 text-3xl font-bold text-green-600">${{ formatNumber(analytics.revenue?.total || 0) }}</p>
          <p class="mt-1 text-xs text-green-600">+{{ analytics.revenue?.growth || 0 }}% vs last period</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <p class="text-sm font-medium text-slate-600">Orders</p>
          <p class="mt-2 text-3xl font-bold text-blue-600">{{ formatNumber(analytics.orders?.total || 0) }}</p>
          <p class="mt-1 text-xs text-blue-600">+{{ analytics.orders?.growth || 0 }}% vs last period</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <p class="text-sm font-medium text-slate-600">Customers</p>
          <p class="mt-2 text-3xl font-bold text-purple-600">{{ formatNumber(analytics.customers?.active || 0) }}</p>
          <p class="mt-1 text-xs text-purple-600">{{ analytics.customers?.new || 0 }} new</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <p class="text-sm font-medium text-slate-600">Avg Order Value</p>
          <p class="mt-2 text-3xl font-bold text-orange-600">${{ formatNumber(analytics.avgOrderValue || 0) }}</p>
          <p class="mt-1 text-xs text-orange-600">+{{ analytics.aovGrowth || 0 }}% vs last period</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
          <div class="h-64">
            <canvas ref="revenueChartRef"></canvas>
          </div>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Orders by Status</h3>
          <div class="h-64">
            <canvas ref="statusChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Top Products & Categories -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Top Products -->
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Top Selling Products</h3>
          <div class="space-y-3">
            <div v-for="(product, idx) in analytics.topProducts.slice(0, 5)" :key="product._id" class="flex items-center gap-3">
              <span class="flex items-center justify-center w-6 h-6 text-sm font-bold text-blue-600 bg-blue-100 rounded-full">{{ idx + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ product.name }}</p>
                <p class="text-sm text-slate-500">{{ product.sold }} sold</p>
              </div>
              <p class="font-semibold">${{ formatNumber(product.revenue) }}</p>
            </div>
          </div>
        </div>

        <!-- Category Performance -->
        <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Category Performance</h3>
          <div class="space-y-3">
            <div v-for="cat in analytics.categoryStats" :key="cat._id">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{{ cat.name }}</span>
                <span class="text-sm text-slate-500">{{ cat.percentage }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500" :style="{ width: `${cat.percentage}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import {
  getDashboardAnalyticsApi,
  getRevenueAnalyticsApi,
  getTopProductsApi,
  getCategoryStatsApi,
} from '../../service/admin.service';
import Chart from 'chart.js/auto';

// State
const loading = ref(true);
const dateRange = ref('30d');
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
});

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(2);
};

const fetchAnalytics = async () => {
  loading.value = true;
  try {
    const days = dateRange.value === '7d' ? 7 : dateRange.value === '30d' ? 30 : dateRange.value === '90d' ? 90 : 365;

    const [dashboardRes, revenueRes, topRes, catRes] = await Promise.all([
      getDashboardAnalyticsApi().catch(() => ({ data: {} })),
      getRevenueAnalyticsApi({ days }).catch(() => ({ data: [] })),
      getTopProductsApi({ limit: 10 }).catch(() => ({ data: [] })),
      getCategoryStatsApi().catch(() => ({ data: [] })),
    ]);

    const dashboard = dashboardRes.data || {};
    if (dashboard.overview) {
      analytics.revenue = dashboard.overview.revenue || { total: 0, growth: 0 };
      analytics.orders = dashboard.overview.orders || { total: 0, growth: 0 };
      analytics.customers = dashboard.overview.users || { active: 0, new: 0 };
    }

    analytics.avgOrderValue = analytics.orders.total > 0 ? analytics.revenue.total / analytics.orders.total : 0;
    analytics.revenueTrend = revenueRes.data || [];
    analytics.topProducts = (topRes.data || []).map((p) => ({
      _id: p._id,
      name: p.name,
      sold: p.sold || 0,
      revenue: p.revenue || p.sold * p.price || 0,
    }));

    const totalSales = (catRes.data || []).reduce((sum, c) => sum + (c.sales || 0), 0);
    analytics.categoryStats = (catRes.data || []).map((c) => ({
      _id: c._id,
      name: c.name,
      percentage: totalSales > 0 ? Math.round((c.sales / totalSales) * 100) : 0,
    }));

    await nextTick();
    updateCharts();
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
  } finally {
    loading.value = false;
  }
};

const updateCharts = () => {
  if (revenueChartRef.value) {
    if (revenueChart) revenueChart.destroy();
    const labels = analytics.revenueTrend.map((d) => d.date || d._id || '');
    const data = analytics.revenueTrend.map((d) => d.revenue || d.total || 0);

    revenueChart = new Chart(revenueChartRef.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  if (statusChartRef.value) {
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(statusChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Confirmed', 'Preparing', 'In Transit', 'Delivered', 'Cancelled'],
        datasets: [
          {
            data: [1, 2, 3, 2, 8, 1],
            backgroundColor: ['#fbbf24', '#3b82f6', '#8b5cf6', '#6366f1', '#22c55e', '#ef4444'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
