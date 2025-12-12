<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <h2 class="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Pending Orders</h2>
      <div v-if="stats?.pendingOrders && stats.pendingOrders.length > 0" class="space-y-3">
        <div 
          v-for="order in stats.pendingOrders" 
          :key="order.id"
          class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
        >
          <div>
            <p class="font-medium text-slate-900 dark:text-white">{{ order.id }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ order.customer }}</p>
          </div>
          <button 
            @click="goToOrder(order.id)"
            class="px-3 py-1 text-sm font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Review
          </button>
        </div>
      </div>
      <div v-else class="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm">No pending orders</p>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <h2 class="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
      <div class="grid grid-cols-2 gap-3">
        <QuickActionButton icon="plus" label="Add Product" color="blue" />
        <QuickActionButton icon="tag" label="Create Sale" color="emerald" />
        <QuickActionButton icon="users" label="Send Campaign" color="purple" />
        <QuickActionButton icon="settings" label="Settings" color="slate" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import QuickActionButton from './QuickActionButton.vue';

const router = useRouter();

defineProps({
  stats: Object,
});

const goToOrder = (orderId) => {
  router.push(`/admin/orders?search=${orderId}`);
};
</script>
