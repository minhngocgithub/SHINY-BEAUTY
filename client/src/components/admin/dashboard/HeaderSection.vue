<template>
  <div
    class="sticky top-0 z-40 bg-white border-b shadow-sm dark:bg-slate-900 border-slate-200 dark:border-slate-800"
  >
    <div class="flex items-center justify-between px-6 py-3">
      <div class="flex items-center flex-1 max-w-2xl gap-3">
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products, orders, customers..."
            class="search-input w-full py-2.5 pl-10 pr-4 transition bg-white border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Advanced Search Button -->
        <button
          @click="showAdvancedSearch = !showAdvancedSearch"
          class="flex items-center gap-2 px-4 py-2.5 transition rounded-lg bg-slate-50hover:text-[#FFFF] border border-slate-300 dark:border-slate-700 whitespace-nowrap"
          :class="{ 'bg-slate-100 dark:bg-slate-800': showAdvancedSearch }"
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
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span class="hidden text-sm font-medium lg:inline">Advanced</span>
        </button>
      </div>

      <!-- Right Side: Time, Dark Mode, Notifications, Messages, User -->
      <div class="flex items-center gap-2 ml-4">
        <!-- Socket Connection Status (only show when disconnected) -->
        <div
          v-if="!isSocketConnected"
          class="flex items-center gap-2 px-3 py-2 text-xs text-orange-600 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400"
          title="Real-time updates disconnected"
        >
          <svg
            class="w-4 h-4 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="hidden xl:inline">Reconnecting...</span>
        </div>

        <!-- Time & Timezone -->
        <div
          class="items-center hidden gap-2 px-3 py-2 rounded-lg xl:flex bg-slate-50 dark:bg-slate-800"
        >
          <svg
            class="w-5 h-5 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="flex flex-col">
            <span
              class="text-sm font-semibold text-slate-900 dark:text-white"
              >{{ currentTime }}</span
            >
            <span class="text-xs text-slate-500 dark:text-slate-400">{{
              timezone
            }}</span>
          </div>
        </div>

        <!-- Dark Mode Toggle -->
        <button
          @click="$emit('toggleDarkMode')"
          class="p-2.5 transition rounded-lg text-slate-600 bg-slate-50 dark:bg-slate-800 dark:hover:text-[#FFFF]"
          title="Toggle dark mode"
        >
          <svg
            v-if="!isDarkMode"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.657 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <!-- Notifications -->
        <div class="relative notification-dropdown">
          <button
            @click="showNotifications = !showNotifications"
            data-dropdown-trigger
            class="relative p-2.5 transition rounded-lg text-slate-600 bg-slate-50 dark:bg-slate-800 dark:hover:text-[#FFFF]"
            title="Notifications"
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
            <span
              v-if="notificationCount > 0"
              class="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full top-1 right-1"
              >{{ notificationCount > 9 ? "9+" : notificationCount }}</span
            >
          </button>

          <!-- Notifications Dropdown -->
          <transition name="dropdown">
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 overflow-hidden bg-white border rounded-lg shadow-lg w-80 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              @click.stop
            >
              <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 class="font-semibold text-slate-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              <div class="overflow-y-auto max-h-96">
                <div
                  v-if="notifications.length === 0"
                  class="p-8 text-center text-slate-500"
                >
                  No new notifications
                </div>
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  @click="handleNotificationClick(notification)"
                  class="p-4 border-b cursor-pointer border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  :class="{
                    'bg-blue-50 dark:bg-blue-900/10': !notification.read,
                  }"
                >
                  <p class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ notification.title }}
                  </p>
                  <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {{ notification.message }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-500">
                    {{ formatNotificationTime(notification.createdAt) }}
                  </p>
                </div>
              </div>
              <div
                class="p-3 text-center border-t border-slate-200 dark:border-slate-700"
              >
                <button
                  @click="viewAllNotifications"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Messages -->
        <div class="relative messages-dropdown">
          <button
            @click="showMessages = !showMessages"
            data-dropdown-trigger
            class="relative p-2.5 transition rounded-lg text-slate-600 bg-slate-50 dark:bg-slate-800 dark:hover:text-[#FFFF]"
            title="Messages"
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span
              v-if="messageCount > 0"
              class="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-green-500 rounded-full top-1 right-1"
              >{{ messageCount > 9 ? "9+" : messageCount }}</span
            >
          </button>

          <!-- Messages Dropdown -->
          <transition name="dropdown">
            <div
              v-if="showMessages"
              class="absolute right-0 mt-2 overflow-hidden bg-white border rounded-lg shadow-lg w-80 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              @click.stop
            >
              <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 class="font-semibold text-slate-900 dark:text-white">
                  Messages
                </h3>
              </div>
              <div class="overflow-y-auto max-h-96">
                <div
                  v-if="messages.length === 0"
                  class="p-8 text-center text-slate-500"
                >
                  No new messages
                </div>
                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="p-4 border-b cursor-pointer border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"
                    >
                      <span
                        class="text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >{{ message.avatar }}</span
                      >
                    </div>
                    <div class="flex-1">
                      <p
                        class="text-sm font-medium text-slate-900 dark:text-white"
                      >
                        {{ message.from }}
                      </p>
                      <p
                        class="text-xs truncate text-slate-600 dark:text-slate-400"
                      >
                        {{ message.preview }}
                      </p>
                      <p
                        class="mt-1 text-xs text-slate-500 dark:text-slate-500"
                      >
                        {{ message.time }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="p-3 text-center border-t border-slate-200 dark:border-slate-700"
              >
                <button
                  @click="viewAllMessages"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all messages
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- User Account -->
        <div class="relative user-dropdown">
          <button
            @click="showUserMenu = !showUserMenu"
            data-dropdown-trigger
            class="flex items-center gap-3 pl-3 transition border-l rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <Avatar
              :current-avatar="
                authStore.user?.avatar?.url || '@/assets/image/vue.svg'
              "
              :size="36"
            />
            <div class="hidden pr-3 text-left lg:block">
              <p class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ userName }}
              </p>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                {{ userRole }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Search Panel (Collapsible) -->
    <transition name="slide">
      <div
        v-if="showAdvancedSearch"
        class="px-6 pb-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
      >
        <div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label
              class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >Search In</label
            >
            <select
              v-model="searchFilters.searchIn"
              class="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
              <option value="campaigns">Campaigns</option>
            </select>
          </div>
          <div>
            <label
              class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >Status</label
            >
            <select
              v-model="searchFilters.status"
              class="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label
              class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >Date From</label
            >
            <input
              v-model="searchFilters.dateFrom"
              type="date"
              class="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >Date To</label
            >
            <input
              v-model="searchFilters.dateTo"
              type="date"
              class="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex items-end gap-2">
            <button
              @click="handleAdvancedSearch"
              class="flex-1 px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
            <button
              @click="resetFilters"
              class="px-4 py-2 text-sm font-medium transition bg-white border rounded-lg text-slate-700 dark:text-slate-300 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../store/auth.store";
import { useDarkMode } from "../../../store/darkMode";
import { useAdminStore } from "../../../store/admin/admin.store";
import { useAdminSocketStore } from "../../../store/admin/adminSocket.store";
import Avatar from "../../atoms/Avatar.vue";

defineProps({
  isDarkMode: Boolean,
  userName: String,
});

const emit = defineEmits(["toggleDarkMode"]);

const authStore = useAuthStore();
const adminStore = useAdminStore();
const adminSocketStore = useAdminSocketStore();
const router = useRouter();

// State
const searchQuery = ref("");
const showAdvancedSearch = ref(false);
const showNotifications = ref(false);
const showMessages = ref(false);
const showUserMenu = ref(false);
const currentTime = ref("");

// Advanced search filters
const searchFilters = ref({
  searchIn: "",
  status: "",
  dateFrom: "",
  dateTo: "",
});

// Computed
const timezone = computed(() => {
  const offset = new Date().getTimezoneOffset() / -60;
  return `GMT${offset >= 0 ? "+" : ""}${offset}`;
});

// Real notifications from socket store
const notifications = computed(() => adminSocketStore.notifications);
const notificationCount = computed(
  () => adminSocketStore.unreadNotificationCount
);

// Mock messages (can be replaced with real message store later)
const messageCount = ref(0);
const messages = computed(() => {
  // TODO: Integrate with real messaging system
  return [];
});

// Dashboard stats for quick access
const dashboardStats = computed(() => adminStore.dashboardStats);
const pendingOrdersCount = computed(() => adminStore.pendingOrdersCount);
const lowStockCount = computed(() => adminStore.lowStockCount);

// User info
const userName = computed(() => authStore.user?.name || "Admin");
const userEmail = computed(() => authStore.user?.email || "");
const userRole = computed(() => {
  const role = authStore.user?.role || "admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
});

// Connection status
const isSocketConnected = computed(() => adminSocketStore.connected);
const hasUnreadNotifications = computed(() => notificationCount.value > 0);

// Methods
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim();
    const searchIn = searchFilters.value.searchIn || "all";

    // Build search params
    const searchParams = {
      search: query,
      ...(searchFilters.value.status && { status: searchFilters.value.status }),
      ...(searchFilters.value.dateFrom && {
        dateFrom: searchFilters.value.dateFrom,
      }),
      ...(searchFilters.value.dateTo && { dateTo: searchFilters.value.dateTo }),
    };

    // Route to appropriate page with search params
    switch (searchIn.toLowerCase()) {
      case "products":
        router.push({ name: "AdminProducts", query: searchParams });
        break;
      case "orders":
        router.push({ name: "AdminOrders", query: searchParams });
        break;
      case "customers":
        router.push({ name: "AdminUsers", query: searchParams });
        break;
      case "campaigns":
        router.push({ name: "AdminCampaigns", query: searchParams });
        break;
      default:
        // Global search - search across all entities
        performGlobalSearch(query, searchParams);
    }
  }
};

const performGlobalSearch = async (query, filters) => {
  try {
    // Show loading state
    const results = {
      products: [],
      orders: [],
      customers: [],
      campaigns: [],
    };

    // Search in all entities in parallel
    const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
      searchProducts(query, filters),
      searchOrders(query, filters),
      searchUsers(query, filters),
    ]);

    // Process results
    if (productsRes.status === "fulfilled")
      results.products = productsRes.value;
    if (ordersRes.status === "fulfilled") results.orders = ordersRes.value;
    if (usersRes.status === "fulfilled") results.customers = usersRes.value;

    // Navigate to search results page with data
    router.push({
      name: "AdminGlobalSearch",
      query: { q: query },
      state: { results },
    });
  } catch (error) {
    console.error("Global search error:", error);
    adminSocketStore.showNotification("Search Error", error.message, "error");
  }
};

const searchProducts = async (query, filters) => {
  try {
    const { searchProductApi } = await import(
      "../../../service/product.service"
    );
    const params = new URLSearchParams({
      q: query,
      limit: 5,
      ...filters,
    });
    const response = await searchProductApi(params.toString());
    return response.data?.products || [];
  } catch (error) {
    console.error("Product search error:", error);
    return [];
  }
};

const searchOrders = async (query, filters) => {
  try {
    const { getAllOrdersApi } = await import("../../../service/order.service");
    const response = await getAllOrdersApi({
      search: query,
      limit: 5,
      ...filters,
    });
    return response.data?.orders || [];
  } catch (error) {
    console.error("Order search error:", error);
    return [];
  }
};

const searchUsers = async (query, filters) => {
  try {
    const { getAllUsersApi } = await import("../../../service/admin.service");
    const response = await getAllUsersApi({
      search: query,
      limit: 5,
      ...filters,
    });
    return response.data?.users || [];
  } catch (error) {
    console.error("User search error:", error);
    return [];
  }
};

const handleAdvancedSearch = () => {
  handleSearch();
  showAdvancedSearch.value = false;
};

const resetFilters = () => {
  searchQuery.value = "";
  searchFilters.value = {
    searchIn: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  };
};

const handleNotificationClick = async (notification) => {
  // Mark as read
  adminSocketStore.markNotificationAsRead(notification.id);

  // Navigate based on notification type and data
  try {
    switch (notification.type) {
      case "order":
        if (notification.data?.orderId) {
          router.push({
            name: "AdminOrderDetail",
            params: { id: notification.data.orderId },
          });
        } else {
          router.push({ name: "AdminOrders" });
        }
        break;

      case "product":
        if (notification.data?.productId) {
          router.push({
            name: "AdminProductEdit",
            params: { id: notification.data.productId },
          });
        } else {
          router.push({ name: "AdminProducts" });
        }
        break;

      case "user":
        if (notification.data?.userId) {
          router.push({
            name: "AdminUserDetail",
            params: { id: notification.data.userId },
          });
        } else {
          router.push({ name: "AdminUsers" });
        }
        break;

      case "inventory":
        router.push({
          name: "AdminInventory",
          query: { filter: "low-stock" },
        });
        break;

      case "review":
        if (notification.data?.reviewId) {
          router.push({
            name: "AdminReviews",
            query: { reviewId: notification.data.reviewId },
          });
        } else {
          router.push({ name: "AdminReviews" });
        }
        break;

      case "campaign":
        if (notification.data?.campaignId) {
          router.push({
            name: "AdminCampaignDetail",
            params: { id: notification.data.campaignId },
          });
        } else {
          router.push({ name: "AdminCampaigns" });
        }
        break;

      default:
        // For general notifications, go to dashboard
        router.push({ name: "AdminDashboard" });
    }
  } catch (error) {
    console.error("Navigation error:", error);
  }

  showNotifications.value = false;
};

const markAllAsRead = () => {
  adminSocketStore.markAllNotificationsAsRead();
};

const viewAllNotifications = () => {
  router.push({ name: "AdminNotifications" });
  showNotifications.value = false;
};

const viewAllMessages = () => {
  router.push({ name: "AdminMessages" });
  showMessages.value = false;
};

const handleProfileClick = () => {
  router.push({ name: "AdminProfile" });
  showUserMenu.value = false;
};

const handleSettingsClick = () => {
  router.push({ name: "AdminSettings" });
  showUserMenu.value = false;
};

const handleHelpClick = () => {
  router.push({ name: "AdminHelp" });
  showUserMenu.value = false;
};

const handleSignOut = async () => {
  try {
    showUserMenu.value = false;

    // Show confirmation
    if (!confirm("Are you sure you want to sign out?")) {
      return;
    }

    // Disconnect admin socket
    adminSocketStore.disconnect();

    // Call logout API
    const { logoutAccountApi } = await import("../../../service/auth.service");
    await logoutAccountApi();

    // Clear auth store
    authStore.logout();

    // Clear admin store
    adminStore.resetStore();

    // Redirect to login
    router.push({ name: "Login" });
  } catch (error) {
    console.error("Logout error:", error);

    // Force logout even if API fails
    adminSocketStore.disconnect();
    authStore.logout();
    adminStore.resetStore();
    router.push({ name: "Login" });
  }
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Format notification time
const formatNotificationTime = (date) => {
  if (!date) return "Just now";

  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return notifDate.toLocaleDateString();
};

// Quick actions from notifications
const handleQuickAction = async (notification, action) => {
  try {
    switch (action) {
      case "confirm_order":
        if (notification.data?.orderId) {
          adminSocketStore.quickConfirmOrder(notification.data.orderId);
          adminSocketStore.showNotification(
            "Success",
            "Order confirmed",
            "success"
          );
        }
        break;

      case "view_order":
        handleNotificationClick(notification);
        break;

      case "dismiss":
        adminSocketStore.markNotificationAsRead(notification.id);
        break;

      default:
        console.warn("Unknown action:", action);
    }
  } catch (error) {
    console.error("Quick action error:", error);
    adminSocketStore.showNotification("Error", error.message, "error");
  }
};

// Refresh dashboard data manually
const refreshDashboard = async () => {
  try {
    if (adminSocketStore.connected) {
      adminSocketStore.refreshDashboard();
    } else {
      await adminStore.fetchDashboardStats();
    }
    adminSocketStore.showNotification(
      "Success",
      "Dashboard refreshed",
      "success"
    );
  } catch (error) {
    console.error("Refresh error:", error);
    adminSocketStore.showNotification(
      "Error",
      "Failed to refresh dashboard",
      "error"
    );
  }
};

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  const clickedInsideDropdown =
    event.target.closest(".notification-dropdown") ||
    event.target.closest(".messages-dropdown") ||
    event.target.closest(".user-dropdown") ||
    event.target.closest("[data-dropdown-trigger]");

  if (!clickedInsideDropdown) {
    showNotifications.value = false;
    showMessages.value = false;
    showUserMenu.value = false;
  }
};

// Lifecycle
let timeInterval;
let handleKeyPress;

onMounted(async () => {
  updateTime();
  timeInterval = setInterval(updateTime, 60000); // Update every minute

  document.addEventListener("click", handleClickOutside);

  // Keyboard shortcuts
  handleKeyPress = (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      document.querySelector(".search-input")?.focus();
    }

    // Ctrl/Cmd + / for advanced search
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      showAdvancedSearch.value = !showAdvancedSearch.value;
    }

    // Ctrl/Cmd + N for notifications
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      showNotifications.value = !showNotifications.value;
    }

    // Ctrl/Cmd + M for messages
    if ((e.ctrlKey || e.metaKey) && e.key === "m") {
      e.preventDefault();
      showMessages.value = !showMessages.value;
    }

    // Escape to close dropdowns
    if (e.key === "Escape") {
      showNotifications.value = false;
      showMessages.value = false;
      showUserMenu.value = false;
      showAdvancedSearch.value = false;
    }
  };

  document.addEventListener("keydown", handleKeyPress);

  // Connect to admin socket if not already connected
  if (!adminSocketStore.connected && authStore.isLoggedIn) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      adminSocketStore.connectAdminSocket(token);
    }
  }

  // Fetch initial dashboard stats if not loaded
  if (!adminStore.isDataFresh) {
    await adminStore.fetchDashboardStats();
  }

  // Request desktop notification permission if enabled
  if (
    adminSocketStore.desktopNotificationsEnabled &&
    "Notification" in window
  ) {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }
});

onUnmounted(() => {
  clearInterval(timeInterval);
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyPress);
});

// Watch for auth changes
watch(
  () => authStore.isLoggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn) {
      // User logged out, disconnect socket
      adminSocketStore.disconnect();
    } else if (!adminSocketStore.connected) {
      // User logged in, connect socket
      const token = localStorage.getItem("accessToken");
      if (token) {
        adminSocketStore.connectAdminSocket(token);
      }
    }
  }
);

// Watch for notifications count changes (for browser tab title)
watch(
  () => notificationCount.value,
  (newCount) => {
    if (newCount > 0) {
      document.title = `(${newCount}) Admin Dashboard - Shiny Beauty`;
    } else {
      document.title = "Admin Dashboard - Shiny Beauty";
    }
  }
);

// Watch for socket connection changes
watch(
  () => adminSocketStore.connected,
  (isConnected) => {
    if (isConnected) {
      console.log(
        "[HeaderSection] Socket connected, subscribing to dashboard..."
      );
      adminSocketStore.subscribeToDashboard();
    } else {
      console.log("[HeaderSection] Socket disconnected");
    }
  }
);
</script>

<style scoped>
/* Dropdown animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Slide animation for advanced search */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>