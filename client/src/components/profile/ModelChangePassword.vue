<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-md p-6 bg-white border border-gray-100 shadow-2xl rounded-3xl"
      @click.stop
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800">Change Password</h3>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 transition-colors bg-white rounded-lg hover:text-gray-600"
        >
          <span class="text-2xl">×</span>
        </button>
      </div>
      <div
        v-if="authStore.user?.isOAuthUser"
        class="p-4 mb-4 border border-amber-200 bg-amber-50 rounded-xl"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl">⚠️</span>
          <div>
            <p class="font-medium text-amber-800">OAuth Account</p>
            <p class="text-sm text-amber-700">
              You're using OAuth login. Password management is not available for
              OAuth accounts.
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Current Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Current Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="passwordForm.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="w-full px-4 py-3 pr-12 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
            >
              <svg
                v-if="showCurrentPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            New Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="passwordForm.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="w-full px-4 py-3 pr-12 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              :class="{ 'border-red-300': passwordError }"
              placeholder="Enter new password (min 6 chars)"
              required
              minlength="6"
              maxlength="50"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
            >
              <svg
                v-if="showNewPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          <p v-if="passwordError" class="mt-1 text-xs text-red-600">
            {{ passwordError }}
          </p>
          <p v-else class="mt-1 text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Confirm New Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="passwordForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="w-full px-4 py-3 pr-12 transition-all border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              :class="{ 'border-red-300': confirmError }"
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
            >
              <svg
                v-if="showConfirmPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          <p v-if="confirmError" class="mt-1 text-xs text-red-600">
            {{ confirmError }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-3 font-medium text-gray-600 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="flex-1 px-4 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Changing..." : "Change Password" }}
          </button>
        </div>
      </form>

      <!-- OAuth Close Button -->
      <button
        v-if="authStore.user?.isOAuthUser"
        @click="$emit('close')"
        class="w-full px-4 py-3 font-medium text-gray-600 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "../../store/user.store";
import { useAuthStore } from "../../store/auth.store";
import { showErrorAlert, showSuccessAlert } from "../../../utils/sweetAlert";

const emit = defineEmits(["close"]);
const userStore = useUserStore();
const authStore = useAuthStore();

// Password visibility toggles
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Form data
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isLoading = ref(false);

const passwordError = computed(() => {
  if (!passwordForm.value.newPassword) return "";
  if (passwordForm.value.newPassword.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (passwordForm.value.newPassword.length > 50) {
    return "Password must not exceed 50 characters";
  }
  return "";
});

const confirmError = computed(() => {
  if (!passwordForm.value.confirmPassword) return "";
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    return "Passwords do not match";
  }
  return "";
});

const isFormValid = computed(() => {
  return (
    passwordForm.value.currentPassword.length > 0 &&
    passwordForm.value.newPassword.length >= 6 &&
    passwordForm.value.newPassword.length <= 50 &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
    !passwordError.value &&
    !confirmError.value
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    if (passwordError.value) {
      showErrorAlert("Validation Error", passwordError.value);
    } else if (confirmError.value) {
      showErrorAlert("Validation Error", confirmError.value);
    } else {
      showErrorAlert("Validation Error", "Please fill in all fields correctly");
    }
    return;
  }

  try {
    isLoading.value = true;

    const response = await userStore.changeUserPassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    if (response && response.success) {
      showSuccessAlert("Success!", "Password changed successfully!");

      passwordForm.value = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      emit("close");
    } else {
      throw new Error(response?.message || "Failed to change password");
    }
  } catch (error) {
    console.error("Change password error:", error);

    const errorMessage =
      error.response?.data?.message ||
      userStore.error ||
      error.message ||
      "Failed to change password. Please check your current password.";

    showErrorAlert("Error", errorMessage);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>