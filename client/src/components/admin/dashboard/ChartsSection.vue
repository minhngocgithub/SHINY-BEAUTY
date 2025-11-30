<template>
  <div>
    <div class="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
      <div
        class="p-6 bg-white border rounded-lg shadow lg:col-span-2 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Sales Trend
          </h2>
          <div class="flex gap-2">
            <button
              @click="chartPeriod = '7days'"
              :class="
                chartPeriod === '7days'
                  ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              "
              class="px-3 py-1 text-sm font-medium rounded-md"
            >
              7 Days
            </button>
            <button
              @click="chartPeriod = '30days'"
              :class="
                chartPeriod === '30days'
                  ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              "
              class="px-3 py-1 text-sm font-medium rounded-md"
            >
              30 Days
            </button>
          </div>
        </div>
        <SalesTrendChart :chartData="revenueChartData" />
      </div>

      <div
        class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        <h2 class="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
          Top Sold Items
        </h2>
        <div
          v-if="stats.topProducts && stats.topProducts.length > 0"
          class="space-y-4"
        >
          <TopSoldItem
            v-for="item in stats.topProducts"
            :key="item.id"
            :name="item.name"
            :percentage="item.percentage"
            :totalSold="item.totalSold"
            :revenue="item.revenue"
            :color="item.color"
          />
        </div>
        <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
          No product data available
        </div>
      </div>
    </div>

    <!-- Additional Analytics Section -->
    <div class="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
      <!-- Order Status Distribution -->
      <div
        class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Orders by Status
        </h3>
        <div
          v-if="stats.ordersByStatus && stats.ordersByStatus.length > 0"
          class="space-y-3"
        >
          <div
            v-for="status in stats.ordersByStatus"
            :key="status.status"
            class="flex justify-between items-center"
          >
            <div class="flex items-center gap-2">
              <span
                :class="getStatusColor(status.status)"
                class="w-3 h-3 rounded-full"
              ></span>
              <span
                class="text-sm text-slate-700 dark:text-slate-300 capitalize"
                >{{ status.status }}</span
              >
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ status.count }}
              </div>
              <div class="text-xs text-slate-500">
                ${{ status.revenue?.toFixed(2) || "0.00" }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-slate-500 dark:text-slate-400">
          No order data available
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div
        class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Low Stock Alert
        </h3>
        <div
          v-if="stats.lowStockProducts && stats.lowStockProducts.length > 0"
          class="space-y-3"
        >
          <div
            v-for="product in stats.lowStockProducts"
            :key="product.id"
            class="flex justify-between items-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-white">
                {{ product.name }}
              </div>
              <div class="text-xs text-slate-500">
                Stock: {{ product.stock }}
              </div>
            </div>
            <span
              :class="
                product.stock === 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              "
              class="px-2 py-1 rounded text-xs font-medium"
            >
              {{ product.status }}
            </span>
          </div>
        </div>
        <div
          v-else
          class="text-center py-8 text-green-600 dark:text-green-400 font-medium"
        >
          All products in stock ✓
        </div>
      </div>

      <!-- Today's Overview -->
      <div
        class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white"
      >
        <h3 class="mb-4 text-lg font-semibold">Today's Overview</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm opacity-90">Orders Today</span>
            <span class="text-xl font-bold">{{ stats.todayOrders || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm opacity-90">Revenue Today</span>
            <span class="text-xl font-bold"
              >${{ stats.todayRevenue || "0.00" }}</span
            >
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm opacity-90">Active Users</span>
            <span class="text-xl font-bold">{{ stats.activeUsers || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SalesTrendChart from "./SalesTrendChart.vue";
import TopSoldItem from "./TopSoldItem.vue";

const props = defineProps({
  stats: Object,
});

const chartPeriod = ref("30days");

const revenueChartData = computed(() => {
  const trends =
    chartPeriod.value === "7days"
      ? (props.stats.revenueTrends || []).slice(-7)
      : props.stats.revenueTrends || [];

  if (!trends.length) {
    return {
      labels: [],
      datasets: [],
    };
  }

  return {
    labels: trends.map((t) => t.date),
    datasets: [
      {
        label: "Revenue ($)",
        data: trends.map((t) => t.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Orders",
        data: trends.map((t) => t.orders),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        yAxisID: "y1",
      },
    ],
  };
});

function getStatusColor(status) {
  const colorMap = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    preparing: "bg-purple-500",
    shipped: "bg-indigo-500",
    out_for_delivery: "bg-cyan-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
    returned: "bg-slate-500",
  };
  return colorMap[status] || "bg-slate-400";
}
</script>
