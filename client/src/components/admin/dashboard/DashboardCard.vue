<template>
  <div
    class="p-6 transition bg-white border rounded-lg shadow cursor-pointer dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg"
    :class="{
      'ring-2 ring-blue-500 dark:ring-blue-400 animate-pulse-slow': highlight,
      'opacity-50': isLoading,
    }"
  >
    <div class="flex items-start justify-between mb-4">
      <div
        :class="[
          'p-3 rounded-lg transition-all',
          bgColor,
          highlight ? 'scale-110' : 'scale-100',
        ]"
      >
        <!-- Icons -->
        <svg
          class="w-6 h-6"
          :class="textColor"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="icon === 'users'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a4 4 0 0116 0v-2a8 8 0 00-16 0v2z"
          />
          <path
            v-else-if="icon === 'package'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
          <path
            v-else-if="icon === 'shopping-cart'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <span
        :class="[
          'text-sm font-semibold transition-all',
          trend.includes('-')
            ? 'text-red-600 dark:text-red-400'
            : 'text-green-600 dark:text-green-400',
          highlight ? 'scale-110' : 'scale-100',
        ]"
      >
        {{ trend }}
      </span>
    </div>
    <p class="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
      {{ title }}
    </p>
    <p
      class="text-3xl font-bold transition-all text-slate-900 dark:text-white"
      :class="{ 'scale-110': highlight }"
    >
      {{ isLoading ? "..." : value }}
    </p>

    <!-- Loading indicator -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-lg"
    >
      <svg
        class="w-8 h-8 text-blue-600 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  trend: String,
  bgColor: String,
  textColor: String,
  highlight: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 1.5s cubic-bezier(0.4, 0, 0.6, 1) 2;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:active {
  transform: scale(0.98);
}
</style>
