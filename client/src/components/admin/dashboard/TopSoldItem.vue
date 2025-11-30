<template>
  <div>
    <div class="flex items-center justify-between mb-1">
      <p class="text-sm font-medium text-slate-900 dark:text-white">
        {{ name }}
      </p>
      <p class="text-xs font-semibold text-slate-600 dark:text-slate-400">
        {{ totalSold }} sold
      </p>
    </div>
    <div class="flex items-center justify-between mb-2">
      <p class="text-xs text-slate-500">${{ revenue?.toFixed(2) || "0.00" }}</p>
      <p class="text-xs font-medium text-slate-700 dark:text-slate-300">
        {{ percentage.toFixed(1) }}%
      </p>
    </div>
    <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        :class="['h-2 rounded-full transition-all', color]"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  percentage: Number,
  totalSold: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  color: String,
});
</script>
