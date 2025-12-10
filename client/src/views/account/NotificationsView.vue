<template>
  <div
    class="min-h-screen py-8 bg-gradient-to-br from-rose-50 via-white to-violet-50"
  >
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="$router.back()"
        class="flex items-center gap-2 px-4 py-2 mb-6 transition-all duration-200 border border-gray-200 shadow-sm bg-white/90 backdrop-blur-xl rounded-xl hover:shadow-md hover:border-rose-200 text-gray-700 hover:text-rose-600 group"
      >
        <svg
          class="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-medium">Back</span>
      </button>

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1
            class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-violet-600"
          >
            All Notifications
          </h1>
          <p class="mt-2 text-gray-600">
            {{ unreadCount }} unread notification{{
              unreadCount !== 1 ? "s" : ""
            }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="hasUnread"
            @click="handleMarkAllAsRead"
            class="px-4 py-2 text-sm font-medium transition-all duration-200 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50"
          >
            Mark all as read
          </button>
          <router-link
            to="/account/notifications/preferences"
            class="px-4 py-2 text-sm font-medium text-white transition-all duration-200 shadow-md bg-gradient-to-r from-rose-500 to-violet-500 rounded-lg hover:from-rose-600 hover:to-violet-600 hover:shadow-lg"
          >
            ⚙️ Preferences
          </router-link>
        </div>
      </div>

      <!-- Tabs -->
      <div
        class="flex gap-4 p-2 mb-6 bg-white border border-gray-200 shadow-lg rounded-xl"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg"
          :class="
            activeTab === tab.value
              ? 'bg-gradient-to-r from-rose-500 to-violet-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          "
        >
          {{ tab.label }}
          <span
            v-if="tab.value === 'unread' && unreadCount > 0"
            class="ml-2 px-2 py-0.5 text-xs rounded-full"
            :class="
              activeTab === tab.value
                ? 'bg-white/20'
                : 'bg-rose-100 text-rose-700'
            "
          >
            {{ unreadCount }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="relative w-16 h-16">
          <div
            class="absolute inset-0 border-4 border-rose-200 rounded-full animate-ping"
          ></div>
          <div
            class="relative w-16 h-16 border-4 border-t-rose-600 border-r-violet-600 border-b-transparent border-l-transparent rounded-full animate-spin"
          ></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredNotifications.length === 0"
        class="p-12 text-center bg-white border border-gray-200 shadow-xl rounded-2xl"
      >
        <div
          class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-100 to-violet-100"
        >
          <svg
            class="w-10 h-10 text-rose-500"
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
        </div>
        <h3 class="mb-2 text-xl font-bold text-gray-900">No notifications</h3>
        <p class="text-gray-600">
          {{
            activeTab === "unread"
              ? "You're all caught up!"
              : "You don't have any notifications yet"
          }}
        </p>
      </div>

      <!-- Notifications List -->
      <div v-else class="space-y-3">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="relative p-6 transition-all duration-200 bg-white border border-gray-200 shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl hover:border-rose-200"
          :class="{ 'bg-blue-50/30 border-blue-200': !notification.read }"
        >
          <!-- Unread Indicator -->
          <div
            v-if="!notification.read"
            class="absolute w-3 h-3 rounded-full top-6 left-3 bg-rose-500"
          ></div>

          <div class="flex gap-4 ml-4">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <div
                class="flex items-center justify-center w-14 h-14 rounded-xl shadow-sm"
                :class="getNotificationIconClass(notification.type)"
              >
                <span class="text-2xl">{{
                  getNotificationIcon(notification.type)
                }}</span>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3
                    class="text-lg font-bold text-gray-900"
                    :class="{ 'font-extrabold': !notification.read }"
                  >
                    {{ notification.title }}
                  </h3>
                  <p class="mt-2 text-gray-600">
                    {{ notification.message || notification.body }}
                  </p>
                  <div class="flex items-center gap-4 mt-3">
                    <span class="text-sm text-gray-400">
                      {{ formatTimeAgo(notification.createdAt) }}
                    </span>
                    <span
                      v-if="notification.type"
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getTypeClass(notification.type)"
                    >
                      {{ getTypeLabel(notification.type) }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                  <button
                    v-if="!notification.read"
                    @click.stop="handleMarkAsRead(notification.id)"
                    class="p-2 text-gray-400 transition-colors duration-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600"
                    title="Mark as read"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    @click.stop="handleDelete(notification.id)"
                    class="p-2 text-gray-400 transition-colors duration-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useNotificationStore } from "../../store/notification.store";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const router = useRouter();
const notificationStore = useNotificationStore();
const {
  sortedNotifications,
  unreadNotifications,
  readNotifications,
  loading,
  unreadCount,
  hasUnread,
} = storeToRefs(notificationStore);

const activeTab = ref("all");

const tabs = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

const filteredNotifications = computed(() => {
  if (activeTab.value === "unread") return unreadNotifications.value;
  if (activeTab.value === "read") return readNotifications.value;
  return sortedNotifications.value;
});

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    await notificationStore.markAsRead(notification.id);
  }

  if (
    notification.type === "order_update" ||
    notification.type === "delivery_reminder"
  ) {
    const orderId = notification.data?.orderId;
    if (orderId) router.push(`/orders/${orderId}`);
  } else if (notification.type === "price_drop") {
    const productId = notification.data?.productId;
    if (productId) router.push(`/product/${productId}`);
  }
};

const handleMarkAsRead = async (notificationId) => {
  await notificationStore.markAsRead(notificationId);
};

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleDelete = async (notificationId) => {
  await notificationStore.deleteNotification(notificationId);
};

const getNotificationIcon = (type) => {
  const icons = {
    order_update: "📦",
    delivery_reminder: "🚚",
    price_drop: "💰",
    promotion: "🎉",
    loyalty: "⭐",
    review_reminder: "⭐",
    product_recommendation: "✨",
    default: "🔔",
  };
  return icons[type] || icons.default;
};

const getNotificationIconClass = (type) => {
  const classes = {
    order_update: "bg-blue-100 text-blue-600",
    delivery_reminder: "bg-green-100 text-green-600",
    price_drop: "bg-yellow-100 text-yellow-600",
    promotion: "bg-purple-100 text-purple-600",
    loyalty: "bg-orange-100 text-orange-600",
    review_reminder: "bg-pink-100 text-pink-600",
    product_recommendation: "bg-indigo-100 text-indigo-600",
    default: "bg-gray-100 text-gray-600",
  };
  return classes[type] || classes.default;
};

const getTypeLabel = (type) => {
  const labels = {
    order_update: "Order",
    delivery_reminder: "Delivery",
    price_drop: "Price Drop",
    promotion: "Promotion",
    loyalty: "Loyalty",
    review_reminder: "Review",
    product_recommendation: "Recommendation",
    default: "General",
  };
  return labels[type] || labels.default;
};

const getTypeClass = (type) => {
  const classes = {
    order_update: "bg-blue-100 text-blue-700",
    delivery_reminder: "bg-green-100 text-green-700",
    price_drop: "bg-yellow-100 text-yellow-700",
    promotion: "bg-purple-100 text-purple-700",
    loyalty: "bg-orange-100 text-orange-700",
    review_reminder: "bg-pink-100 text-pink-700",
    product_recommendation: "bg-indigo-100 text-indigo-700",
    default: "bg-gray-100 text-gray-700",
  };
  return classes[type] || classes.default;
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return past.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  notificationStore.fetchNotifications(50);
});
</script>
