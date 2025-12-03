<template>
  <aside
    class="fixed top-0 left-0 w-64 h-screen pb-32 overflow-y-auto transition-all bg-white border-r dark:bg-slate-900 border-slate-200 dark:border-slate-800"
    :class="sidebarClass"
  >
    <div
      class="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
        >
          SC
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-900 dark:text-white"
            >Shiny Cosmetic</span
          >
          <div class="flex items-center gap-1.5">
            <span
              :class="[
                'inline-block w-1.5 h-1.5 rounded-full',
                connectionStatus.color,
              ]"
              :title="connectionStatus.text"
            ></span>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{
              connectionStatus.text
            }}</span>
          </div>
        </div>
      </div>
      <button
        @click="handleToggle"
        class="transition lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <nav class="p-4 space-y-6">
      <div v-for="section in menuSections" :key="section.id" class="space-y-2">
        <!-- Section Header (for expandable sections) -->
        <div
          v-if="section.expandable"
          @click="toggleSection(section.id)"
          class="flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-wider uppercase cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
        >
          <span>{{ section.label }}</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': expandedSections[section.id] }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Menu Items -->
        <div
          v-show="!section.expandable || expandedSections[section.id]"
          class="space-y-1"
        >
          <router-link
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition',
              isActive(item.path)
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
            ]"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              v-html="item.icon"
            ></svg>
            <span class="flex-1">{{ item.label }}</span>
            <span
              v-if="item.badge"
              :class="[
                'px-2 py-0.5 text-xs font-semibold rounded-full animate-pulse',
                getBadgeClass(item.badgeType),
              ]"
              >{{ item.badge }}</span
            >
          </router-link>
        </div>
      </div>
    </nav>

    <div class="my-4 border-t border-slate-200 dark:border-slate-800"></div>

    <nav class="p-4">
      <p
        class="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400"
      >
        Tools
      </p>
      <div class="space-y-2">
        <!-- Notifications -->
        <router-link
          to="/admin/notifications"
          class="relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span>Notifications</span>
          <span
            v-if="socketStore.unreadCount > 0"
            class="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse"
            >{{ socketStore.unreadCount }}</span
          >
        </router-link>

        <!-- Settings -->
        <router-link
          to="/admin/settings"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Settings</span>
        </router-link>

        <!-- Logout -->
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAdminStore } from "../../store/admin/admin.store";
import { useAdminOrderStore } from "../../store/admin/adminOrder.store";
import { useAdminSocketStore } from "../../store/admin/adminSocket.store";
import { logoutAccountApi } from "../../service/auth.service";

const props = defineProps({
  collapsed: Boolean,
});
const emit = defineEmits(["toggle"]);

// Stores
const adminStore = useAdminStore();
const adminOrderStore = useAdminOrderStore();
const socketStore = useAdminSocketStore();
const router = useRouter();
const route = useRoute();

// State for expandable sections
const expandedSections = ref({
  commerce: true,
  marketing: false,
  customers: false,
  content: false,
  system: false,
});

// Toggle section
function toggleSection(section) {
  expandedSections.value[section] = !expandedSections.value[section];
}

// Menu structure with categories
const menuSections = computed(() => [
  {
    id: "main",
    label: "Main",
    items: [
      {
        path: "/admin",
        label: "Dashboard",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`,
      },
    ],
  },
  {
    id: "commerce",
    label: "E-Commerce",
    expandable: true,
    items: [
      {
        path: "/admin/orders",
        label: "Orders",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />`,
        badge:
          adminStore.pendingOrdersCount > 0
            ? adminStore.pendingOrdersCount
            : null,
        badgeType: "danger",
      },
      {
        path: "/admin/products",
        label: "Products",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />`,
        badge: adminStore.lowStockCount > 0 ? adminStore.lowStockCount : null,
        badgeType: "warning",
      },
      {
        path: "/admin/bundles",
        label: "Bundles",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />`,
      },
      {
        path: "/admin/categories",
        label: "Categories",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />`,
      },
      {
        path: "/admin/inventory",
        label: "Inventory",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />`,
      },
      {
        path: "/admin/shipping",
        label: "Shipping",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />`,
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    expandable: true,
    items: [
      {
        path: "/admin/campaigns",
        label: "Campaigns",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />`,
        badge: null,
      },
      {
        path: "/admin/coupons",
        label: "Coupons",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />`,
      },
      {
        path: "/admin/sale-programs",
        label: "Sale Programs",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`,
      },
      {
        path: "/admin/loyalty",
        label: "Loyalty Program",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />`,
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    expandable: true,
    items: [
      {
        path: "/admin/users",
        label: "All Users",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />`,
        badge:
          adminStore.dashboardStats.users.newToday > 0
            ? `+${adminStore.dashboardStats.users.newToday}`
            : null,
        badgeType: "success",
      },
      {
        path: "/admin/reviews",
        label: "Reviews",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />`,
      },
      {
        path: "/admin/feedback",
        label: "Feedback",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />`,
      },
      {
        path: "/admin/support-tickets",
        label: "Support",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />`,
      },
    ],
  },
  {
    id: "content",
    label: "Content & Analytics",
    expandable: true,
    items: [
      {
        path: "/admin/analytics",
        label: "Analytics",
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />`,
      },
    ],
  },
]);

// Get only visible menu items (without expandable logic for main items)
const visibleMenuItems = computed(() => {
  return menuSections.value.flatMap((section) => {
    if (!section.expandable) {
      return section.items;
    }
    if (expandedSections.value[section.id]) {
      return section.items;
    }
    return [];
  });
});

// Connection status
const connectionStatus = computed(() => {
  if (socketStore.connected) {
    return {
      text: "Live",
      color: "bg-green-500",
      icon: "●",
    };
  }
  return {
    text: "Offline",
    color: "bg-gray-400",
    icon: "○",
  };
});

// Sidebar class
const sidebarClass = computed(() =>
  props.collapsed ? "-translate-x-full lg:translate-x-0" : ""
);

// Get badge class based on type
function getBadgeClass(badgeType) {
  switch (badgeType) {
    case "danger":
      return "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400";
    case "warning":
      return "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400";
    case "success":
      return "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400";
    default:
      return "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400";
  }
}

function handleToggle() {
  emit("toggle");
}

function isActive(path) {
  return route.path === path;
}

async function handleLogout() {
  try {
    // Disconnect socket before logout
    if (socketStore.connected) {
      socketStore.disconnect();
    }

    await logoutAccountApi();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Reset stores
    adminStore.resetStore();

    router.push("/");
  } catch (error) {
    console.error("[EnhancedSidebar] Logout error:", error);
    // Force logout even if API fails
    localStorage.clear();
    router.push("/");
  }
}

// Lifecycle
onMounted(() => {
  console.log("[EnhancedSidebar] Mounted");
});

onUnmounted(() => {
  console.log("[EnhancedSidebar] Unmounted");
});

// Helper functions
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatMoney(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + "M";
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + "K";
  }
  return amount.toFixed(0);
}

function getTimeAgo(date) {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
</script>
