<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <div
      class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6"
    >
      <svg
        class="w-12 h-12 text-gray-400 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    </div>

    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
      Your cart is empty
    </h2>

    <p class="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
      Looks like you haven't added any items to your cart yet. Start shopping to
      fill it up!
    </p>

    <button
      @click="$emit('start-shopping')"
      class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
    >
      Start Shopping
    </button>
  </div>
</template>

<script setup>
defineEmits(["start-shopping"]);
</script>
