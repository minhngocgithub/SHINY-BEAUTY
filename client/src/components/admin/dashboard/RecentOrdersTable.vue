<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="border-b border-slate-200 dark:border-slate-700">
        <tr>
          <th class="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">Product</th>
          <th class="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">Order ID</th>
          <th class="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">Customer</th>
          <th class="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">Date</th>
          <th class="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">Price</th>
          <th class="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id" class="transition border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
          <td class="px-4 py-3">
            <img :src="order.productImage" alt="Product" class="w-8 h-8 rounded">
          </td>
          <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ order.id }}</td>
          <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ order.customer }}</td>
          <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ order.date }}</td>
          <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">{{ order.price }}</td>
          <td class="px-4 py-3">
            <span :class="getStatusColor(order.status)">
              {{ order.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  orders: Array,
})

const getStatusColor = (status) => {
  const colors = {
    'Completed': 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
    'Pending': 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
    'Cancelled': 'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
  }
  return colors[status] || colors['Pending']
}
</script>
