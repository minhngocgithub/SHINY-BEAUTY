<template>
  <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
    <DashboardCard 
      title="Total Customers"
      :value="stats.totalCustomers"
      icon="users"
      :trend="stats.customerTrend"
      bgColor="bg-blue-50 dark:bg-blue-950"
      textColor="text-blue-600 dark:text-blue-400"
    />
    <DashboardCard 
      title="Total Products"
      :value="stats.totalProducts"
      icon="package"
      :trend="stats.productTrend"
      bgColor="bg-emerald-50 dark:bg-emerald-950"
      textColor="text-emerald-600 dark:text-emerald-400"
    />
    <DashboardCard 
      title="Total Orders"
      :value="stats.totalOrders"
      icon="shopping-cart"
      :trend="stats.orderTrend"
      bgColor="bg-purple-50 dark:bg-purple-950"
      textColor="text-purple-600 dark:text-purple-400"
    />
    <DashboardCard 
      title="Total Revenue"
      :value="`$${stats.totalRevenue}`"
      icon="dollar"
      :trend="stats.revenueTrend"
      bgColor="bg-orange-50 dark:bg-orange-950"
      textColor="text-orange-600 dark:text-orange-400"
    />
  </div>
</template>

<script setup>
import DashboardCard from './DashboardCard.vue'

defineProps({
  stats: Object,
})
</script>
