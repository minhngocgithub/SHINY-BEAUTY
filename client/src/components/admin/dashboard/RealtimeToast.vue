<template>
  <transition-group
    name="toast"
    tag="div"
    class="fixed z-50 space-y-3 pointer-events-none bottom-6 right-6"
  >
    <div
      v-for="toast in visibleToasts"
      :key="toast.id"
      class="pointer-events-auto w-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      :class="getToastClass(toast.type)"
    >
      <div class="flex items-start p-4">
        <!-- Icon -->
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          :class="getIconBgClass(toast.type)"
        >
          <svg
            class="w-6 h-6"
            :class="getIconColorClass(toast.type)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <!-- Success -->
            <path
              v-if="toast.type === 'success'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
            <!-- Error -->
            <path
              v-else-if="toast.type === 'error'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
            <!-- Warning -->
            <path
              v-else-if="toast.type === 'warning' || toast.type === 'inventory'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
            <!-- Order -->
            <path
              v-else-if="toast.type === 'order'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
            <!-- User -->
            <path
              v-else-if="toast.type === 'user'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
            <!-- Product -->
            <path
              v-else-if="toast.type === 'product'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
            <!-- Revenue -->
            <path
              v-else-if="toast.type === 'revenue'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <!-- Review -->
            <path
              v-else-if="toast.type === 'review'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
            <!-- Default Info -->
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 ml-3">
          <p class="text-sm font-semibold text-slate-900 dark:text-white">
            {{ toast.title }}
          </p>
          <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {{ toast.message }}
          </p>
          <!-- Progress bar -->
          <div
            class="w-full h-1 mt-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
          >
            <div
              class="h-full transition-all duration-100 ease-linear"
              :class="getProgressBarClass(toast.type)"
              :style="{ width: `${toast.progress || 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Close button -->
        <button
          @click="dismissToast(toast.id)"
          class="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </transition-group>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAdminSocketStore } from "../../../store/admin/adminSocket.store";

const adminSocketStore = useAdminSocketStore();

// Local toast state
const toasts = ref([]);
const visibleToasts = computed(() => toasts.value.slice(0, 5)); // Show max 5 toasts

// Watch for new notifications from socket store
watch(
  () => adminSocketStore.notifications.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      // New notification added
      const latestNotification = adminSocketStore.notifications[0];
      if (latestNotification && !latestNotification.read) {
        addToast(latestNotification);
      }
    }
  }
);

// Methods
const addToast = (notification) => {
  const toast = {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type || "info",
    progress: 100,
    duration: 5000, // 5 seconds
  };

  toasts.value.unshift(toast);

  // Auto dismiss after duration
  const interval = setInterval(() => {
    const existingToast = toasts.value.find((t) => t.id === toast.id);
    if (existingToast) {
      existingToast.progress -= 2; // Decrease by 2% every 100ms
      if (existingToast.progress <= 0) {
        dismissToast(toast.id);
        clearInterval(interval);
      }
    } else {
      clearInterval(interval);
    }
  }, 100);
};

const dismissToast = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const getToastClass = (type) => {
  const classes = {
    success: "border-l-4 border-green-500",
    error: "border-l-4 border-red-500",
    warning: "border-l-4 border-yellow-500",
    order: "border-l-4 border-purple-500",
    user: "border-l-4 border-blue-500",
    product: "border-l-4 border-emerald-500",
    revenue: "border-l-4 border-orange-500",
    inventory: "border-l-4 border-yellow-500",
    review: "border-l-4 border-pink-500",
  };
  return classes[type] || "border-l-4 border-slate-500";
};

const getIconBgClass = (type) => {
  const classes = {
    success: "bg-green-100 dark:bg-green-900",
    error: "bg-red-100 dark:bg-red-900",
    warning: "bg-yellow-100 dark:bg-yellow-900",
    order: "bg-purple-100 dark:bg-purple-900",
    user: "bg-blue-100 dark:bg-blue-900",
    product: "bg-emerald-100 dark:bg-emerald-900",
    revenue: "bg-orange-100 dark:bg-orange-900",
    inventory: "bg-yellow-100 dark:bg-yellow-900",
    review: "bg-pink-100 dark:bg-pink-900",
  };
  return classes[type] || "bg-slate-100 dark:bg-slate-900";
};

const getIconColorClass = (type) => {
  const classes = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    order: "text-purple-600 dark:text-purple-400",
    user: "text-blue-600 dark:text-blue-400",
    product: "text-emerald-600 dark:text-emerald-400",
    revenue: "text-orange-600 dark:text-orange-400",
    inventory: "text-yellow-600 dark:text-yellow-400",
    review: "text-pink-600 dark:text-pink-400",
  };
  return classes[type] || "text-slate-600 dark:text-slate-400";
};

const getProgressBarClass = (type) => {
  const classes = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    order: "bg-purple-500",
    user: "bg-blue-500",
    product: "bg-emerald-500",
    revenue: "bg-orange-500",
    inventory: "bg-yellow-500",
    review: "bg-pink-500",
  };
  return classes[type] || "bg-slate-500";
};
</script>

<style scoped>
.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
