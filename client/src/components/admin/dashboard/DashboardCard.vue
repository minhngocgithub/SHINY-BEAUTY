<template>
  <div class="p-6 transition bg-white border rounded-lg shadow dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg">
    <div class="flex items-start justify-between mb-4">
      <div :class="['p-3 rounded-lg', bgColor]">
        <!-- Replaced component references with inline SVGs -->
        <svg class="w-6 h-6" :class="textColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="icon === 'users'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a4 4 0 0116 0v-2a8 8 0 00-16 0v2z" />
          <path v-else-if="icon === 'package'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 015.646 5.646 9 9 0 0120.354 15.354z" />
          <path v-else-if="icon === 'shopping-cart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span :class="['text-sm font-semibold', trend.includes('-') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400']">
        {{ trend }}
      </span>
    </div>
    <p class="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">{{ title }}</p>
    <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: String,
  icon: String,
  trend: String,
  bgColor: String,
  textColor: String,
})
</script>
