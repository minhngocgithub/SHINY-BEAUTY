<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../store/auth.store";
import { useAdminStore } from "../../store/admin/admin.store";
import { useAdminSocketStore } from "../../store/admin/adminSocket.store";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const adminStore = useAdminStore();
const socketStore = useAdminSocketStore();

// Reactive state
const sidebarOpen = ref(true);
const showNotifications = ref(false);
const isLoading = ref(true);
const error = ref(null);

// Menu items
const menuItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    path: "/admin/customers",
    label: "Customer",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    path: "/admin/products",
    label: "Products",
    icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
  },
  {
    path: "/admin/bundles",
    label: "Bundles",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    path: "/admin/payments",
    label: "Payments",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    path: "/admin/orders",
    label: "Orders",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
];

// Computed
const isActive = (path) => route.path === path;

const connectionStatusClass = computed(() => {
  if (!socketStore.connected) return "bg-yellow-600";
  if (socketStore.connected && socketStore.dashboardSubscribed)
    return "bg-green-100 border-green-300 text-green-800";
  return "bg-gray-100 border-gray-300 text-gray-800";
});

const unreadNotifications = computed(() => socketStore.unreadCount || 0);

const recentNotifications = computed(() => {
  return socketStore.notifications?.slice(0, 5) || [];
});

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const markNotificationAsRead = (notificationId) => {
  socketStore.markNotificationAsRead(notificationId);
};

const markAllAsRead = () => {
  socketStore.markAllNotificationsAsRead();
};

const clearAllNotifications = () => {
  socketStore.clearAllNotifications();
  showNotifications.value = false;
};

const getNotificationIcon = (type) => {
  const icons = {
    order: "📦",
    inventory: "⚠️",
    user: "👤",
    product: "🏷️",
    revenue: "💰",
    review: "⭐",
  };
  return icons[type] || "🔔";
};

const formatNotificationTime = (date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const logout = () => {
  // Unsubscribe from socket before logout
  if (socketStore.dashboardSubscribed) {
    socketStore.unsubscribeFromDashboard();
  }
  socketStore.disconnect();

  authStore.logout();
  router.push("/login");
};

const initializeAdminDashboard = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Fetch initial dashboard stats (force fresh data on initial load)
    await adminStore.fetchDashboardStats(false);

    // Setup socket connection
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.warn("⚠️ [AdminDashboard] No access token found");
      error.value = "Authentication required";
      router.push("/login");
      return;
    }

    // Connect if not connected
    if (!socketStore.connected) {
      socketStore.connectAdminSocket(token);
    }
  } catch (err) {
    console.error("[AdminDashboard] Initialization error:", err);
    error.value = err.message || "Failed to load dashboard";
  } finally {
    isLoading.value = false;
  }
};

const refreshDashboard = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Force fresh data (no cache)
    await adminStore.fetchDashboardStats(false);

    // Also trigger socket refresh
    if (socketStore.connected) {
      socketStore.refreshDashboard();
    }
  } catch (err) {
    console.error("[AdminDashboard] Refresh error:", err);
    error.value = err.message || "Failed to refresh dashboard";
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => socketStore.connected,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      if (!socketStore.dashboardSubscribed) {
        socketStore.subscribeToDashboard(5000);
      }
    } else if (!newVal && oldVal) {
      console.log("❌ [AdminDashboard] Socket disconnected");
    }
  }
);

// Watch for socket errors
watch(
  () => socketStore.error,
  (newError) => {
    if (newError) {
      console.error("[AdminDashboard] Socket error:", newError);
      error.value = newError;
    }
  }
);

// Lifecycle hooks
onMounted(() => {
  initializeAdminDashboard();
});

onUnmounted(() => {
  if (socketStore.dashboardSubscribed) {
    socketStore.unsubscribeFromDashboard();
  }
});
</script>

<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Connection Status Banner -->
    <Transition name="slide-down">
      <div
        v-if="!socketStore.connected"
        class="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-center text-white bg-yellow-600 shadow-lg"
      >
        <div class="flex items-center justify-center space-x-2">
          <svg
            class="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>⚠️ Disconnected from real-time updates. Reconnecting...</span>
        </div>
      </div>
    </Transition>

    <!-- Live Indicator -->
    <Transition name="fade">
      <div
        v-if="socketStore.connected && socketStore.dashboardSubscribed"
        class="fixed top-0 right-0 z-50 px-3 py-1 m-2 text-xs font-medium text-green-800 bg-green-100 border border-green-300 rounded-full shadow-sm"
      >
        <span
          class="inline-block w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"
        ></span>
        Live
      </div>
    </Transition>

    <!-- Error Alert -->
    <Transition name="slide-down">
      <div
        v-if="error && !isLoading"
        class="fixed z-50 w-full max-w-md mx-4 transform -translate-x-1/2 top-16 left-1/2"
      >
        <div
          class="px-4 py-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-lg shadow-lg"
        >
          <div class="flex items-start">
            <svg
              class="w-5 h-5 mr-2 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="flex-1">
              <p class="font-medium">{{ error }}</p>
            </div>
            <button
              @click="error = null"
              class="ml-2 text-red-500 hover:text-red-700"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide-left">
      <aside
        v-show="sidebarOpen"
        class="flex flex-col w-64 transition-all bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <!-- Logo -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span class="text-xl font-bold text-gray-900 dark:text-white"
                >E-Commerce</span
              >
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 overflow-y-auto">
          <div class="space-y-1">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-3 space-x-3 transition-all rounded-lg group"
              :class="
                isActive(item.path)
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              "
            >
              <svg
                class="w-5 h-5 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.icon"
                />
              </svg>
              <span class="font-medium">{{ item.label }}</span>
            </router-link>
          </div>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="logout"
            class="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 transition-all rounded-lg dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 group"
          >
            <svg
              class="w-5 h-5 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span class="font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </Transition>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Top Bar -->
      <header
        class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="flex items-center space-x-4">
          <!-- Mobile Menu Toggle -->
          <button
            @click="toggleSidebar"
            class="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
          >
            <svg
              v-if="!sidebarOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ route.meta.title || "Dashboard" }}
          </h1>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center space-x-4">
          <!-- Refresh Button -->
          <button
            @click="refreshDashboard"
            :disabled="isLoading"
            class="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Refresh Dashboard (Force Fresh Data)"
          >
            <svg
              :class="{ 'animate-spin': isLoading }"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              @click="toggleNotifications"
              class="relative p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span
                v-if="unreadNotifications > 0"
                class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
              >
                {{ unreadNotifications > 9 ? "9+" : unreadNotifications }}
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <Transition name="fade">
              <div
                v-if="showNotifications"
                class="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-80 dark:bg-gray-800 dark:border-gray-700"
              >
                <!-- Header -->
                <div
                  class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700"
                >
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="unreadNotifications > 0"
                      @click="markAllAsRead"
                      class="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400"
                    >
                      Mark all read
                    </button>
                    <button
                      @click="clearAllNotifications"
                      class="text-xs text-gray-800 bg-transparent hover:text-gray-400 dark:text-[#FFFF]"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <!-- Notifications List -->
                <div class="overflow-y-auto max-h-96">
                  <div
                    v-if="recentNotifications.length === 0"
                    class="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <svg
                      class="w-12 h-12 mx-auto mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p class="text-sm">No notifications</p>
                  </div>

                  <div
                    v-for="notification in recentNotifications"
                    :key="notification.id"
                    @click="markNotificationAsRead(notification.id)"
                    class="px-4 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    :class="{
                      'bg-purple-50 dark:bg-purple-900/10': !notification.read,
                    }"
                  >
                    <div class="flex items-start space-x-3">
                      <span class="text-2xl">
                        {{ getNotificationIcon(notification.type) }}
                      </span>
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ notification.title }}
                        </p>
                        <p
                          class="text-sm text-gray-600 truncate dark:text-gray-400"
                        >
                          {{ notification.message }}
                        </p>
                        <p
                          class="mt-1 text-xs text-gray-500 dark:text-gray-500"
                        >
                          {{ formatNotificationTime(notification.createdAt) }}
                        </p>
                      </div>
                      <span
                        v-if="!notification.read"
                        class="w-2 h-2 mt-2 bg-purple-500 rounded-full"
                      ></span>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div
                  class="px-4 py-3 text-center border-t border-gray-200 dark:border-gray-700"
                >
                  <router-link
                    to="/admin/notifications"
                    class="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                    @click="showNotifications = false"
                  >
                    View all notifications
                  </router-link>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center flex-1 bg-gray-50 dark:bg-gray-900"
      >
        <div class="text-center">
          <svg
            class="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <p class="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>

      <!-- Router View -->
      <main
        v-else
        class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>