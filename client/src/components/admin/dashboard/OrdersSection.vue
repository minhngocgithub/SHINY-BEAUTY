<template>
  <div class="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
    <div class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
        <a href="/admin/orders" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</a>
      </div>
      <RecentOrdersTable :orders="stats.recentOrders" />
    </div>

    <div class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Product Views</h2>
        <div class="flex gap-2 text-xs">
          <span class="text-green-600 dark:text-green-400">This Week</span>
          <span class="text-red-600 dark:text-red-400">Last Week</span>
        </div>
      </div>
      <ProductViewsChart />
    </div>
  </div>
</template>

<script setup>
import RecentOrdersTable from './RecentOrdersTable.vue'
import ProductViewsChart from './ProductViewChart.vue'

defineProps({
  stats: Object,
})
</script>
