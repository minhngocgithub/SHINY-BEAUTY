<template>
  <div class="relative">
    <!-- Bell Button -->
    <button
      ref="bellRef"
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 transition-all duration-200 rounded-lg hover:bg-gray-100 hover:text-rose-600 group"
      :class="{ 'bg-rose-50 text-rose-600': showDropdown }"
    >
      <!-- Bell Icon -->
      <svg
        class="w-6 h-6 transition-transform duration-200"
        :class="{ 'animate-wiggle': hasUnread }"
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

      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 shadow-lg animate-pulse"
      >
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="showDropdown"
        ref="dropdownRef"
        class="absolute right-0 z-50 mt-2 origin-top-right"
      >
        <NotificationCenter @close="closeDropdown" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "../../store/notification.store";
import { useAuthStore } from "../../store/auth.store";
import { storeToRefs } from "pinia";
import NotificationCenter from "./NotificationCenter.vue";

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const { unreadCount, hasUnread } = storeToRefs(notificationStore);

const showDropdown = ref(false);

const toggleDropdown = async () => {
  if (!showDropdown.value) {
    // Fetch latest notifications when opening
    await notificationStore.fetchNotifications();
  }
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

// Click outside handling using refs
import { ref as vueRef } from "vue";
const bellRef = vueRef(null);
const dropdownRef = vueRef(null);

const handleDocumentClick = (event) => {
  if (!showDropdown.value) return;

  const dropdownEl = dropdownRef.value;
  const bellEl = bellRef.value;

  // If click is inside dropdown or bell button, do nothing
  if (
    dropdownEl &&
    (dropdownEl === event.target || dropdownEl.contains(event.target))
  )
    return;
  if (bellEl && (bellEl === event.target || bellEl.contains(event.target)))
    return;

  // Otherwise close
  showDropdown.value = false;
};

onMounted(() => {
  // Initial fetch
  (async () => {
    await notificationStore.fetchNotifications();

    // Connect to socket for real-time updates
    if (authStore.state.isLoggedIn && authStore.state.user?._id) {
      notificationStore.connectNotificationSocket(authStore.state.user._id);
      notificationStore.requestNotificationPermission();
    }
  })();

  document.addEventListener("click", handleDocumentClick);

  // Auto-refresh every 5 minutes
  const refreshInterval = setInterval(() => {
    notificationStore.fetchNotifications();
  }, 300000);

  onUnmounted(() => {
    clearInterval(refreshInterval);
    notificationStore.disconnectNotificationSocket();
    document.removeEventListener("click", handleDocumentClick);
  });
});
</script>

<style scoped>
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.animate-wiggle {
  animation: wiggle 0.5s ease-in-out infinite;
}
</style>
