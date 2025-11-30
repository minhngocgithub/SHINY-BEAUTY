<template>
  <div class="space-y-6">
    <!-- Password Change -->
    <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
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
    <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">🔗</span>
        <h2 class="text-xl font-semibold text-gray-700">Linked Accounts</h2>
      </div>
      <OAuthAccounts />
    </div>

    <!-- Notifications -->
    <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">🔔</span>
        <h2 class="text-xl font-semibold text-gray-700">Notifications</h2>
      </div>
      <div class="space-y-4">
        <label
          v-for="pref in notificationOptions"
          :key="pref.key"
          class="flex items-center justify-between cursor-pointer"
        >
          <div>
            <span class="font-medium text-gray-700">{{ pref.label }}</span>
            <p class="text-sm text-gray-500">{{ pref.description }}</p>
          </div>
          <div class="relative">
            <input
              type="checkbox"
              class="sr-only peer"
              v-model="notificationPreferences[pref.key]"
              @change="$emit('update-notifications')"
            />
            <div class="w-12 h-6 transition-all duration-200 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-rose-300 peer-checked:to-violet-300"></div>
            <div class="absolute w-4 h-4 transition-all duration-200 bg-white rounded-full shadow-md left-1 top-1 peer-checked:translate-x-6"></div>
          </div>
        </label>
      </div>
    </div>

    <!-- Privacy & Security -->
    <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-2xl">🛡️</span>
        <h2 class="text-xl font-semibold text-gray-700">Privacy & Security</h2>
      </div>
      <div class="space-y-3">
        <button class="w-full px-4 py-3 text-left transition-all duration-200 border border-gray-200 rounded-xl hover:bg-gray-50">
          <div class="font-medium text-gray-700">Download My Data</div>
          <p class="text-sm text-gray-500">Download a copy of your data</p>
        </button>
        <button class="w-full px-4 py-3 text-left text-red-600 transition-all duration-200 border border-red-200 rounded-xl hover:bg-red-50">
          <div class="font-medium">Delete Account</div>
          <p class="text-sm text-red-500">Permanently delete your account and data</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import OAuthAccounts from './OAuthAccounts.vue'

defineProps({
  notificationPreferences: {
    type: Object,
    default: () => ({
      email: true,
      sms: false,
      push: true,
      orderUpdates: true,
      promotions: true,
      newsletter: false
    })
  },
  loading: Boolean
})

defineEmits(['show-password-modal', 'update-notifications'])

const notificationOptions = [
  {
    key: 'email',
    label: 'Email Notifications',
    description: 'Receive email notifications'
  },
  {
    key: 'orderUpdates',
    label: 'Order Updates',
    description: 'Get notified about order status changes'
  },
  {
    key: 'promotions',
    label: 'Promotions',
    description: 'Receive promotional offers and deals'
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    description: 'Receive weekly newsletter'
  }
]
</script>