<template>
  <div class="space-y-6">
    <!-- Password Change -->
    <div
      class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl"
    >
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">🔒</span>
        <h2 class="text-xl font-semibold text-gray-700">Change Password</h2>
      </div>
      <button
        @click="$emit('show-password-modal')"
        class="px-6 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl hover:from-blue-500 hover:to-indigo-500"
      >
        Change Password
      </button>
    </div>

    <!-- OAuth Accounts -->
    <div
      class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl"
    >
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">🔗</span>
        <h2 class="text-xl font-semibold text-gray-700">Linked Accounts</h2>
      </div>
      <OAuthAccounts />
    </div>

    <!-- Notifications -->
    <div
      class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl"
    >
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔔</span>
          <h2 class="text-xl font-semibold text-gray-700">Notifications</h2>
        </div>
        <router-link
          to="/account/notifications/preferences"
          class="px-4 py-2 text-sm font-medium text-white transition-all duration-200 shadow-md bg-gradient-to-r from-rose-500 to-violet-500 rounded-lg hover:from-rose-600 hover:to-violet-600"
        >
          Manage Preferences
        </router-link>
      </div>
      <div class="p-4 mb-4 border-l-4 border-blue-500 rounded-lg bg-blue-50">
        <p class="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Click "Manage Preferences" to customize your
          email and push notification settings in detail.
        </p>
      </div>
      <div class="space-y-4">
        <div
          class="flex items-center justify-between p-4 transition-all duration-200 border border-gray-200 rounded-xl hover:border-rose-200"
        >
          <div>
            <span class="font-medium text-gray-700">All Notifications</span>
            <p class="text-sm text-gray-500">
              Receive all types of notifications
            </p>
          </div>
          <router-link
            to="/account/notifications"
            class="px-4 py-2 text-sm font-medium transition-all duration-200 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            View All →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Privacy & Security -->
    <div
      class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl"
    >
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">🛡️</span>
        <h2 class="text-xl font-semibold text-gray-700">Privacy & Security</h2>
      </div>
      <div class="space-y-3">
        <button
          class="w-full px-4 py-3 text-left transition-all duration-200 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <div class="font-medium text-gray-700">Download My Data</div>
          <p class="text-sm text-gray-500">Download a copy of your data</p>
        </button>
        <button
          class="w-full px-4 py-3 text-left text-red-600 transition-all duration-200 border border-red-200 rounded-xl hover:bg-red-50"
        >
          <div class="font-medium">Delete Account</div>
          <p class="text-sm text-red-500">
            Permanently delete your account and data
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import OAuthAccounts from "./OAuthAccounts.vue";

defineProps({
  notificationPreferences: {
    type: Object,
    default: () => ({
      email: true,
      sms: false,
      push: true,
      orderUpdates: true,
      promotions: true,
      newsletter: false,
    }),
  },
  loading: Boolean,
});

defineEmits(["show-password-modal", "update-notifications"]);

const notificationOptions = [
  {
    key: "email",
    label: "Email Notifications",
    description: "Receive email notifications",
  },
  {
    key: "orderUpdates",
    label: "Order Updates",
    description: "Get notified about order status changes",
  },
  {
    key: "promotions",
    label: "Promotions",
    description: "Receive promotional offers and deals",
  },
  {
    key: "newsletter",
    label: "Newsletter",
    description: "Receive weekly newsletter",
  },
];
</script>