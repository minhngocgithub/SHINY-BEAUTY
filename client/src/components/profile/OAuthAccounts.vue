<template>
  <div class="space-y-4">
    <!-- Google Account -->
    <div
      class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
    >
      <div class="flex items-center space-x-3">
        <div
          class="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full"
        >
          <svg class="w-5 h-5 text-red-600" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Google</h4>
          <p class="text-sm text-gray-500">
            {{ user.googleId ? "Connected" : "Not connected" }}
          </p>
        </div>
      </div>
      <button
        v-if="user.googleId"
        @click="unlinkAccount('google')"
        :disabled="isUnlinking"
        class="px-3 py-1 text-sm text-red-600 transition-colors border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
      >
        {{ isUnlinking ? "Unlinking..." : "Unlink" }}
      </button>
      <button
        v-else
        @click="linkAccount('google')"
        :disabled="isLinking"
        class="px-3 py-1 text-sm text-blue-600 transition-colors border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50"
      >
        {{ isLinking ? "Linking..." : "Link" }}
      </button>
    </div>

    <!-- Facebook Account -->
    <div
      class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
    >
      <div class="flex items-center space-x-3">
        <div
          class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full"
        >
          <svg class="w-5 h-5 text-blue-600" fill="#1877F2" viewBox="0 0 24 24">
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Facebook</h4>
          <p class="text-sm text-gray-500">
            {{ user.facebookId ? "Connected" : "Not connected" }}
          </p>
        </div>
      </div>
      <button
        v-if="user.facebookId"
        @click="unlinkAccount('facebook')"
        :disabled="isUnlinking"
        class="px-3 py-1 text-sm text-red-600 transition-colors border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
      >
        {{ isUnlinking ? "Unlinking..." : "Unlink" }}
      </button>
      <button
        v-else
        @click="linkAccount('facebook')"
        :disabled="isLinking"
        class="px-3 py-1 text-sm text-blue-600 transition-colors border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50"
      >
        {{ isLinking ? "Linking..." : "Link" }}
      </button>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="message"
      class="p-3 mt-4 rounded-md"
      :class="
        messageType === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      "
    >
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../store/auth.store";
import {
  linkOAuthAccount,
  unlinkOAuthAccount,
} from "../../service/auth.service";

const authStore = useAuthStore();
const isLinking = ref(false);
const isUnlinking = ref(false);
const message = ref("");
const messageType = ref("success");

const user = computed(() => authStore.user || {});

const showMessage = (msg, type = "success") => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
  }, 5000);
};

const linkAccount = async (provider) => {
  isLinking.value = true;
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    window.location.href = `${baseUrl}/api/v1/auth/oauth/${provider}`;
  } catch (error) {
    console.error("Link account error:", error);
    showMessage("Failed to link account", "error");
  } finally {
    isLinking.value = false;
  }
};

const unlinkAccount = async (provider) => {
  if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) {
    return;
  }

  isUnlinking.value = true;
  try {
    await unlinkOAuthAccount({ provider });
    showMessage(`${provider} account unlinked successfully`);
    // Reload user info
    if (authStore.getUserInfo) {
      await authStore.getUserInfo();
    }
  } catch (error) {
    console.error("Unlink account error:", error);
    showMessage("Failed to unlink account", "error");
  } finally {
    isUnlinking.value = false;
  }
};

onMounted(() => {
  if (!authStore.state?.user && authStore.getUserInfo) {
    authStore.getUserInfo();
  }
});
</script>