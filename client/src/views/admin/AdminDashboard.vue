<script setup>
import { ref, computed, markRaw, onMounted, onUnmounted } from "vue";
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

// Use markRaw for icon components to prevent Vue from making them reactive
const menuItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: markRaw({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
    }),
  },
  {
    path: "/admin/customers",
    label: "Customer",
    icon: markRaw({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
    }),
  },
  {
    path: "/admin/products",
    label: "Products",
    icon: markRaw({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>',
    }),
  },
  {
    path: "/admin/bundles",
    label: "Products",
    icon: markRaw({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>',
    }),
  },
  {
    path: "/admin/payments",
    label: "Payments",
    icon: markRaw({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>',
    }),
  },
  {
    path: "/admin/orders",
    label: "Orders",
    icon: markRaw({
      template:
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>',
    }),
  },
];

// Methods
const isActive = (path) => {
  return route.path === path;
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

// Lifecycle hooks for real-time connection
onMounted(async () => {
  console.log("🚀 [AdminDashboard] Component mounted");
  await adminStore.fetchDashboardStats();

  // Connect to Socket.IO if not already connected
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.warn(
      "⚠️ [AdminDashboard] No access token found. User needs to login."
    );
    return;
  }

  console.log(
    "🔑 [AdminDashboard] Token found:",
    token.substring(0, 20) + "..."
  );

  if (token && !socketStore.connected) {
    console.log("🔌 [AdminDashboard] Connecting to admin socket...");
    socketStore.connectAdminSocket(token);

    // Wait a bit for connection to establish, then subscribe
    setTimeout(() => {
      if (socketStore.connected) {
        console.log(
          "✅ [AdminDashboard] Socket connected, subscribing to updates..."
        );
        socketStore.subscribeToDashboard(5000); // Update every 5 seconds
      }
    }, 1000);
  } else if (socketStore.connected && !socketStore.dashboardSubscribed) {
    // Already connected, just subscribe
    console.log("📊 [AdminDashboard] Subscribing to dashboard updates...");
    socketStore.subscribeToDashboard(5000);
  }
});

onUnmounted(() => {
  console.log("👋 [AdminDashboard] Component unmounting, unsubscribing...");

  // Unsubscribe from dashboard updates when leaving page
  if (socketStore.dashboardSubscribed) {
    socketStore.unsubscribeFromDashboard();
  }
});
</script>

<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Real-time Connection Status Banner -->
    <div
      v-if="!socketStore.connected"
      class="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-center text-white bg-yellow-600"
    >
      ⚠️ Disconnected from real-time updates. Reconnecting...
    </div>

    <div
      v-else-if="socketStore.connected && socketStore.dashboardSubscribed"
      class="fixed top-0 right-0 z-50 px-3 py-1 m-2 text-xs font-medium text-green-800 bg-green-100 border border-green-300 rounded-full"
    >
      <span
        class="inline-block w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"
      ></span>
      Live
    </div>

    <!-- Sidebar -->
    <aside
      class="flex flex-col w-64 transition-colors bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      :class="{ hidden: !sidebarOpen, block: sidebarOpen }"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
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

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <div class="space-y-1">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-4 py-3 space-x-3 transition-colors rounded-lg"
            :class="
              isActive(item.path)
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            "
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="logout"
          class="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 00-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span class="font-medium">Log Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <router-view />
    </div>
  </div>
</template>
