<template>
  <div
    class="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse"
  >
    <!-- Image Skeleton -->
    <div class="relative w-full h-48 bg-gray-200 sm:h-56 md:h-64"></div>

    <!-- Content Skeleton -->
    <div class="p-4 space-y-3">
      <!-- Brand -->
      <div class="w-20 h-3 bg-gray-200 rounded"></div>

      <!-- Title -->
      <div class="space-y-2">
        <div class="w-full h-4 bg-gray-200 rounded"></div>
        <div class="w-3/4 h-4 bg-gray-200 rounded"></div>
      </div>

      <!-- Rating -->
      <div class="flex items-center gap-2">
        <div class="w-24 h-4 bg-gray-200 rounded"></div>
        <div class="w-12 h-3 bg-gray-200 rounded"></div>
      </div>

      <!-- Price -->
      <div class="flex items-center gap-2">
        <div class="w-20 h-6 bg-gray-200 rounded"></div>
        <div class="w-16 h-4 bg-gray-200 rounded"></div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2 pt-2">
        <div class="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Skeleton loading component for product cards
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
