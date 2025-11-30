<template>
  <div
    class="p-6 transition-all shadow-lg bg-[#FEFEFF] rounded-xl hover:shadow-lg"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div>
          <p class="mb-1 text-sm font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text">
            {{ title }}
          </p>
          <p class="text-2xl font-bold text-[#52525C] ">
            {{ formattedValue }}
          </p>
          <p
            v-if="subtitle"
            class="mt-1 text-xs text-gray-500 dark:text-gray-500"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Optional trend indicator -->
    <div v-if="trend" class="flex items-center gap-1 text-sm">
      <span :class="trend > 0 ? 'text-green-500' : 'text-red-500'">
        {{ trend > 0 ? "↑" : "↓" }}
      </span>
      <span class="text-gray-600 dark:text-gray-400">
        {{ Math.abs(trend) }}% from last month
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "blue",
    validator: (value) =>
      ["blue", "green", "purple", "gray", "pink"].includes(value),
  },
  trend: {
    type: Number,
    default: null,
  },
});

const formattedValue = computed(() => {
  if (typeof props.value === "number") {
    return props.value.toLocaleString("en-US");
  }
  return props.value;
});

const colorClasses = computed(() => {
  const colors = {
    blue: {
      bg: "border-l-4 border-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
    },
    green: {
      bg: "border-l-4 border-green-500",
      iconBg: "bg-green-50 dark:bg-green-900/20",
    },
    purple: {
      bg: "border-l-4 border-purple-500",
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
    },
    gray: {
      bg: "border-l-4 border-gray-500",
      iconBg: "bg-gray-50 dark:bg-gray-700",
    },
    pink: {
      bg: "border-l-4 border-pink-500",
      iconBg: "bg-pink-50 dark:bg-pink-900/20",
    },
  };
  return colors[props.color] || colors.blue;
});
</script>
