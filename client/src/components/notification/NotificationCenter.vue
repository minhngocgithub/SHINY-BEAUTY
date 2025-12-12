<template>
  <div
    class="w-96 max-h-[600px] flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-violet-50"
    >
      <h3
        class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-violet-600"
      >
        Notifications
      </h3>
      <div class="flex items-center gap-2">
        <button
          v-if="sortedNotifications.length > 0"
          @click="handleClearAll"
          class="px-3 py-1 text-xs font-medium transition-all duration-200 border rounded-lg text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-red-600 hover:border-red-300"
          title="Clear all notifications"
        >
          Clear all
        </button>
        <button
          v-if="hasUnread"
          @click="handleMarkAllAsRead"
          class="px-3 py-1 text-xs font-medium transition-all duration-200 border rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          Mark all read
        </button>
        <button
          @click="$emit('close')"
          class="p-1 text-gray-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 hover:text-gray-600"
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
    </div>

    <!-- Notifications List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="relative w-12 h-12">
          <div
            class="absolute inset-0 border-4 rounded-full border-rose-200 animate-ping"
          ></div>
          <div
            class="relative w-12 h-12 border-4 rounded-full border-t-rose-600 border-r-violet-600 border-b-transparent border-l-transparent animate-spin"
          ></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="sortedNotifications.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-rose-100 to-violet-100"
        >
          <svg
            class="w-8 h-8 text-rose-500"
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
        <p class="text-sm font-medium text-gray-600">No notifications yet</p>
        <p class="mt-1 text-xs text-gray-400">
          We'll notify you when something arrives
        </p>
      </div>

      <!-- Notification Items -->
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="notification in sortedNotifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="relative p-4 transition-all duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-violet-50/50"
          :class="{ 'bg-blue-50/30': !notification.read }"
        >
          <!-- Unread Indicator -->
          <div
            v-if="!notification.read"
            class="absolute w-2 h-2 rounded-full top-6 left-2 bg-rose-500"
          ></div>

          <div class="flex gap-3 ml-3">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full"
                :class="getNotificationIconClass(notification.type)"
              >
                <span class="text-lg">{{
                  getNotificationIcon(notification.type)
                }}</span>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-semibold text-gray-900"
                :class="{ 'font-bold': !notification.read }"
              >
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm text-gray-600 line-clamp-2">
                {{ notification.message || notification.body }}
              </p>
              <p class="mt-2 text-xs text-gray-400">
                {{ formatTimeAgo(notification.createdAt) }}
              </p>
            </div>

            <!-- Delete Button -->
            <button
              @click.stop="handleDelete(notification.id)"
              class="flex-shrink-0 p-1 text-gray-400 transition-colors duration-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
            >
              <svg
                class="w-4 h-4"
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

    <!-- Footer -->
    <div class="p-3 border-t border-gray-200 bg-gray-50">
      <button
        @click="viewAllNotifications"
        class="w-full px-4 py-2 text-sm font-medium text-center transition-all duration-200 rounded-lg text-rose-600 hover:bg-rose-50"
      >
        View All Notifications
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useNotificationStore } from "../../store/notification.store";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const emit = defineEmits(["close"]);
const router = useRouter();
const notificationStore = useNotificationStore();
const { sortedNotifications, loading, hasUnread } =
  storeToRefs(notificationStore);

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    await notificationStore.markAsRead(notification.id);
  }

  if (notification.actionUrl) {
    const url = notification.actionUrl.startsWith("/")
      ? notification.actionUrl
      : `/${notification.actionUrl}`;
    router.push(url);
    emit("close");
    return;
  }

  const type = String(notification.type || "").toLowerCase();
  const data = notification.data || {};

  // Handle different notification types
  // Order related
  if (type.includes("order") || type === "delivery_reminder") {
    const orderId = data.orderId || data.orderID || data.order?.id;
    if (orderId) {
      router.push(`/orders/${orderId}`);
    } else {
      router.push("/orders");
    }
    emit("close");
    return;
  }

  // Review related
  if (type === "review_reply" || type === "review_approved") {
    const productId = data.productId || data.product?.id;
    if (productId) {
      router.push(`/product/${productId}`);
    } else {
      router.push("/account/profile?tab=reviews");
    }
    emit("close");
    return;
  }

  // Sale Program related
  if (type === "new_sale_program" || type === "flash_sale") {
    const saleProgramId = data.saleProgramId || data.programId;
    const categorySlug = data.categorySlug;

    if (saleProgramId) {
      router.push(`/sale/${saleProgramId}`);
    } else if (categorySlug) {
      router.push(`/shop/${categorySlug}`);
    } else {
      router.push("/sale");
    }
    emit("close");
    return;
  }

  // Product related
  if (
    type === "new_product" ||
    type === "product_back_in_stock" ||
    type === "product_recommendation" ||
    type === "price_drop" ||
    type === "wishlist_price_drop"
  ) {
    const productId = data.productId || data.product?.id;
    if (productId) {
      router.push(`/product/${productId}`);
    } else {
      router.push("/shop");
    }
    emit("close");
    return;
  }

  // Loyalty & Rewards
  if (
    type === "loyalty_points_earned" ||
    type === "loyalty_tier_upgrade" ||
    type === "reward_available" ||
    type === "points_expiring"
  ) {
    router.push("/account/profile?tab=loyalty");
    emit("close");
    return;
  }

  // Coupon related
  if (type === "coupon_available") {
    router.push("/account/profile?tab=coupons");
    emit("close");
    return;
  }

  // Default: no navigation or go to profile
  if (type !== "welcome" && type !== "account_update") {
    router.push("/account/profile");
    emit("close");
  }
};

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleClearAll = async () => {
  if (
    confirm(
      "Are you sure you want to clear all notifications? This action cannot be undone."
    )
  ) {
    await notificationStore.clearAllNotifications();
  }
};

const handleDelete = async (notificationId) => {
  await notificationStore.deleteNotification(notificationId);
};

const viewAllNotifications = () => {
  router.push("/account/notifications");
  emit("close");
};

const getNotificationIcon = (type) => {
  const icons = {
    // Order related
    order_update: "📦",
    order_confirmed: "✅",
    order_shipped: "🚚",
    order_delivered: "✨",
    order_cancelled: "❌",
    delivery_reminder: "🚚",

    // Sale & Promotion
    new_sale_program: "🎉",
    sale_ending_soon: "⏰",
    flash_sale: "⚡",
    promotion: "🎁",
    price_drop: "💰",
    coupon_available: "🎟️",

    // Product related
    new_product: "🆕",
    product_back_in_stock: "📦",
    product_recommendation: "✨",
    wishlist_price_drop: "❤️",

    // Review related
    review_reply: "💬",
    review_approved: "✅",
    review_reminder: "⭐",
    helpful_review: "👍",

    // Loyalty & Rewards
    loyalty_points_earned: "⭐",
    loyalty_tier_upgrade: "🏆",
    reward_available: "🎁",
    points_expiring: "⏰",

    // Account related
    welcome: "👋",
    account_update: "🔔",
    security_alert: "🔒",

    default: "🔔",
  };
  return icons[type] || icons.default;
};

const getNotificationIconClass = (type) => {
  const classes = {
    // Order related
    order_update: "bg-blue-100 text-blue-600",
    order_confirmed: "bg-green-100 text-green-600",
    order_shipped: "bg-indigo-100 text-indigo-600",
    order_delivered: "bg-emerald-100 text-emerald-600",
    order_cancelled: "bg-red-100 text-red-600",
    delivery_reminder: "bg-green-100 text-green-600",

    // Sale & Promotion
    new_sale_program:
      "bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600",
    sale_ending_soon: "bg-orange-100 text-orange-600",
    flash_sale: "bg-yellow-100 text-yellow-600",
    promotion: "bg-purple-100 text-purple-600",
    price_drop: "bg-yellow-100 text-yellow-600",
    coupon_available: "bg-pink-100 text-pink-600",

    // Product related
    new_product: "bg-cyan-100 text-cyan-600",
    product_back_in_stock: "bg-teal-100 text-teal-600",
    product_recommendation: "bg-indigo-100 text-indigo-600",
    wishlist_price_drop: "bg-rose-100 text-rose-600",

    // Review related
    review_reply: "bg-blue-100 text-blue-600",
    review_approved: "bg-green-100 text-green-600",
    review_reminder: "bg-pink-100 text-pink-600",
    helpful_review: "bg-amber-100 text-amber-600",

    // Loyalty & Rewards
    loyalty_points_earned: "bg-orange-100 text-orange-600",
    loyalty_tier_upgrade: "bg-amber-100 text-amber-600",
    reward_available: "bg-purple-100 text-purple-600",
    points_expiring: "bg-red-100 text-red-600",

    // Account related
    welcome: "bg-blue-100 text-blue-600",
    account_update: "bg-gray-100 text-gray-600",
    security_alert: "bg-red-100 text-red-600",

    default: "bg-gray-100 text-gray-600",
  };
  return classes[type] || classes.default;
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
