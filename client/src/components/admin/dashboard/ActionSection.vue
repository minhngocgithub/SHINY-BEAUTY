<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div class="p-6 bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <h2 class="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Pending Orders</h2>
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">ORD-001</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">John Doe - $150.00</p>
          </div>
          <button class="px-3 py-1 text-sm font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700">
            Review
          </button>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">ORD-002</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">Jane Smith - $275.50</p>
          </div>
          <button class="px-3 py-1 text-sm font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700">
            Review
          </button>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">ORD-003</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">Mike Johnson - $89.99</p>
          </div>
          <button class="px-3 py-1 text-sm font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700">
            Review
          </button>
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
import QuickActionButton from './QuickActionButton.vue'
</script>
