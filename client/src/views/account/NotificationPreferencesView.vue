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
      <div class="mb-8">
        <h1
          class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-violet-600"
        >
          Notification Preferences
        </h1>
        <p class="mt-2 text-gray-600">
          Manage how you receive notifications and updates
        </p>
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

      <!-- Preferences Form -->
      <div v-else class="space-y-6">
        <!-- Email Notifications -->
        <div class="p-6 bg-white border border-gray-200 shadow-xl rounded-2xl">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-violet-100"
            >
              <svg
                class="w-6 h-6 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Email Notifications
              </h2>
              <p class="text-sm text-gray-600">Receive updates via email</p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(enabled, key) in localPreferences.email"
              :key="key"
              class="flex items-center justify-between p-4 transition-all duration-200 border border-gray-200 rounded-xl hover:border-rose-200 hover:bg-rose-50/30"
            >
              <div>
                <p class="font-medium text-gray-900">
                  {{ getPreferenceLabel(key) }}
                </p>
                <p class="mt-1 text-sm text-gray-600">
                  {{ getPreferenceDescription(key) }}
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="localPreferences.email[key]"
                  class="sr-only peer"
                  @change="markAsChanged"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-violet-500"
                ></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Push Notifications -->
        <div class="p-6 bg-white border border-gray-200 shadow-xl rounded-2xl">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100"
            >
              <svg
                class="w-6 h-6 text-violet-600"
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
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Push Notifications
              </h2>
              <p class="text-sm text-gray-600">
                Get instant browser notifications
              </p>
            </div>
          </div>

          <!-- Browser Permission Status -->
          <div
            v-if="!browserNotificationsEnabled"
            class="p-4 mb-4 border-l-4 border-yellow-500 rounded-lg bg-yellow-50"
          >
            <div class="flex items-start gap-3">
              <svg
                class="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="flex-1">
                <p class="font-medium text-yellow-800">
                  Browser notifications are disabled
                </p>
                <p class="mt-1 text-sm text-yellow-700">
                  Enable browser notifications to receive instant updates
                </p>
                <button
                  @click="requestBrowserPermission"
                  class="px-4 py-2 mt-3 text-sm font-medium text-white transition-all duration-200 shadow-md bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 hover:shadow-lg"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(enabled, key) in localPreferences.push"
              :key="key"
              class="flex items-center justify-between p-4 transition-all duration-200 border border-gray-200 rounded-xl hover:border-violet-200 hover:bg-violet-50/30"
            >
              <div>
                <p class="font-medium text-gray-900">
                  {{ getPreferenceLabel(key) }}
                </p>
                <p class="mt-1 text-sm text-gray-600">
                  {{ getPreferenceDescription(key) }}
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="localPreferences.push[key]"
                  class="sr-only peer"
                  @change="markAsChanged"
                  :disabled="!browserNotificationsEnabled"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                ></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div
          class="flex items-center justify-between p-6 bg-white border border-gray-200 shadow-xl rounded-2xl"
        >
          <div>
            <p class="font-medium text-gray-900">Save your preferences</p>
            <p class="mt-1 text-sm text-gray-600">
              Changes will be applied immediately
            </p>
          </div>
          <button
            @click="savePreferences"
            :disabled="!hasChanges || saving"
            class="px-6 py-3 font-semibold text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-rose-500 to-violet-500 rounded-xl hover:from-rose-600 hover:to-violet-600 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            {{ saving ? "Saving..." : "Save Changes" }}
          </button>
        </div>

        <!-- Success Message -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showSuccess"
            class="p-4 border-l-4 border-green-500 rounded-lg bg-green-50"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="font-medium text-green-800">
                Preferences saved successfully!
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useNotificationStore } from "../../store/notification.store";
import { storeToRefs } from "pinia";

const notificationStore = useNotificationStore();
const { preferences, loading } = storeToRefs(notificationStore);

const localPreferences = ref({
  email: {},
  push: {},
});
const hasChanges = ref(false);
const saving = ref(false);
const showSuccess = ref(false);
const browserNotificationsEnabled = ref(false);

const markAsChanged = () => {
  hasChanges.value = true;
};

const getPreferenceLabel = (key) => {
  const labels = {
    orderUpdates: "Order Updates",
    promotions: "Promotions & Offers",
    newsletter: "Newsletter",
    productRecommendations: "Product Recommendations",
    loyaltyUpdates: "Loyalty & Rewards",
  };
  return labels[key] || key;
};

const getPreferenceDescription = (key) => {
  const descriptions = {
    orderUpdates:
      "Get notified about order status changes and delivery updates",
    promotions: "Receive exclusive deals, discounts, and special offers",
    newsletter: "Stay updated with our latest news and articles",
    productRecommendations:
      "Personalized product suggestions based on your preferences",
    loyaltyUpdates: "Points earned, rewards available, and tier changes",
  };
  return descriptions[key] || "";
};

const requestBrowserPermission = async () => {
  const granted = await notificationStore.requestNotificationPermission();
  browserNotificationsEnabled.value = granted;

  if (granted) {
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  }
};

const savePreferences = async () => {
  saving.value = true;

  const success = await notificationStore.updatePreferences(
    localPreferences.value
  );

  if (success) {
    hasChanges.value = false;
    showSuccess.value = true;

    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  }

  saving.value = false;
};

onMounted(async () => {
  await notificationStore.fetchPreferences();

  // Clone preferences for local editing
  localPreferences.value = JSON.parse(JSON.stringify(preferences.value));

  // Check browser notification permission
  if ("Notification" in window) {
    browserNotificationsEnabled.value = Notification.permission === "granted";
  }
});
</script>
