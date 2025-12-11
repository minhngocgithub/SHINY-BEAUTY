<template>
  <div class="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute w-64 h-64 rounded-full opacity-20 -top-10 -left-10 bg-gradient-to-br from-purple-400 to-pink-400 blur-3xl animate-blob"></div>
      <div class="absolute w-64 h-64 rounded-full opacity-20 top-1/3 -right-10 bg-gradient-to-br from-blue-400 to-purple-400 blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute w-64 h-64 rounded-full opacity-20 -bottom-10 left-1/3 bg-gradient-to-br from-pink-400 to-rose-400 blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 w-full max-w-md px-4 py-8">
      <!-- Card -->
      <div class="overflow-hidden transition-all duration-300 bg-white shadow-2xl rounded-3xl hover:shadow-3xl">
        <!-- Header Section -->
        <div class="px-8 pt-10 pb-6 text-center bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500">
          <div class="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg">
            <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 class="mb-2 text-3xl font-bold text-white">Forgot Password?</h1>
          <p class="text-sm text-white/90">No worries! Enter your email and we'll send you reset instructions.</p>
        </div>

        <!-- Form Section -->
        <div class="px-8 py-8">
          <Form 
            @submit="handleForgotPassword" 
            :validation-schema="schema"
            class="space-y-6"
          >
            <!-- Email Input -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <Field 
                  id="email"
                  name="email" 
                  type="email" 
                  class="w-full py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400" 
                  placeholder="your@email.com"
                  :disabled="isLoading"
                />
              </div>
              <ErrorMessage name="email" class="text-sm text-red-500" />
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full py-3.5 font-semibold text-white transition-all duration-300 transform rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span v-if="!isLoading" class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Reset Instructions
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            </button>

            <!-- Success/Error Message -->
            <div 
              v-if="message" 
              class="p-4 rounded-xl animate-fadeIn"
              :class="isSuccess 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'"
            >
              <div class="flex items-start gap-3">
                <svg 
                  v-if="isSuccess"
                  class="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg 
                  v-else
                  class="flex-shrink-0 w-5 h-5 text-red-500 mt-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm font-medium">{{ message }}</p>
              </div>
            </div>

            <!-- Back to Login -->
            <div class="text-center">
              <router-link 
                to="/auth/login" 
                class="inline-flex items-center gap-2 text-sm font-medium transition-colors text-purple-600 hover:text-purple-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </router-link>
            </div>
          </Form>
        </div>

        <!-- Footer -->
        <div class="px-8 py-6 text-center bg-gray-50">
          <p class="text-xs text-gray-600">
            Need help? 
            <button @click="showSupportModal = true" class="font-medium text-purple-600 hover:text-purple-700 underline">
              Contact Support
            </button>
          </p>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account? 
          <router-link to="/auth/register" class="font-semibold text-purple-600 hover:text-purple-700">
            Sign up now
          </router-link>
        </p>
      </div>
    </div>

    <!-- Support Modal -->
    <div
      v-if="showSupportModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeSupportModal"
    >
      <div class="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl">
        <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              💬 Contact Support
            </h3>
            <button @click="closeSupportModal" class="text-gray-400 transition-colors hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">Name *</label>
            <input
              v-model="supportData.guestInfo.name"
              type="text"
              placeholder="Your name"
              class="w-full px-4 py-3 text-gray-900 transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">Email *</label>
            <input
              v-model="supportData.guestInfo.email"
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-3 text-gray-900 transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">Issue Type *</label>
            <select v-model="supportData.type" class="w-full px-4 py-3 text-gray-900 transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="account_issue">👤 Account Issue</option>
              <option value="technical_issue">⚙️ Technical Issue</option>
              <option value="question">❓ Question</option>
              <option value="other">ℹ️ Other</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">Description *</label>
            <textarea
              v-model="supportData.message"
              rows="4"
              placeholder="Please describe your issue in detail..."
              class="w-full px-4 py-3 text-gray-900 placeholder-gray-400 transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">{{ supportData.message.length }}/2000 characters</p>
          </div>

          <div v-if="supportMessage" class="p-3 mb-4 rounded-lg" :class="supportSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
            <p class="text-sm">{{ supportMessage }}</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="submitSupport"
              :disabled="!canSubmitSupport || supportLoading"
              class="flex-1 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl hover:from-purple-600 hover:to-pink-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ supportLoading ? '⏳ Sending...' : '📤 Send Request' }}
            </button>
            <button
              @click="closeSupportModal"
              :disabled="supportLoading"
              class="px-6 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import Loading from '../../components/Loading.vue';
import { forgotPasswordApi } from '../../service/auth.service';
import { createFeedbackApi } from '../../service/feedback.service'
const schema = yup.object({
  email: yup
    .string()
    .required("Email is required!")
    .email("Email is Invalid!")
    .max(50, "Must be maximum 50 characters!")
});

export default {
  name: "ForgotPassword",
  components: {
    Form,
    Field,
    ErrorMessage,
    Loading
  },
  setup() {
    const isLoading = ref(false);
    const message = ref("");
    const isSuccess = ref(false);

    // Support Modal States
    const showSupportModal = ref(false);
    const supportData = ref({
      type: 'account_issue',
      message: '',
      guestInfo: {
        name: '',
        email: ''
      }
    });
    const supportLoading = ref(false);
    const supportMessage = ref('');
    const supportSuccess = ref(false);

    const canSubmitSupport = computed(() => {
      return (
        supportData.value.guestInfo.name.trim().length > 0 &&
        supportData.value.guestInfo.email.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportData.value.guestInfo.email) &&
        supportData.value.message.trim().length >= 10 &&
        supportData.value.message.length <= 2000
      );
    });

    const handleForgotPassword = async (values) => {
      message.value = "";
      isLoading.value = true;
      
      try {
        // Simulate some loading time to match your login behavior
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Make API request to your backend forgot password endpoint
        const response = await forgotPasswordApi({ email: values.email });
        
        isSuccess.value = true;
        message.value = "Password reset email has been sent to your email address. Please check your inbox.";
      } catch (error) {
        isSuccess.value = false;
        message.value = (error.response && error.response.data && error.response.data.message) || 
                        "Failed to send password reset email. Please try again later.";
      } finally {
        isLoading.value = false;
      }
    };

    const closeSupportModal = () => {
      showSupportModal.value = false;
      supportData.value = {
        type: 'account_issue',
        message: '',
        guestInfo: { name: '', email: '' }
      };
      supportMessage.value = '';
      supportSuccess.value = false;
    };

    const submitSupport = async () => {
      if (!canSubmitSupport.value || supportLoading.value) return;

      try {
        supportLoading.value = true;
        supportMessage.value = '';

        const feedbackData = {
          type: supportData.value.type,
          message: supportData.value.message,
          guestInfo: supportData.value.guestInfo
        };

        const response = await createFeedbackApi(feedbackData);

        if (response.data.success) {
          supportSuccess.value = true;
          supportMessage.value = '✅ Thanks for contact! We will reach out to you via email soon.';
          
          setTimeout(() => {
            closeSupportModal();
          }, 2000);
        }
      } catch (err) {
        console.error('Submit support error:', err);
        supportSuccess.value = false;
        supportMessage.value = err.response?.data?.message || 'Failed to submit support request. Please try again.';
      } finally {
        supportLoading.value = false;
      }
    };

    return {
      isLoading,
      message,
      isSuccess,
      schema,
      handleForgotPassword,
      showSupportModal,
      supportData,
      supportLoading,
      supportMessage,
      supportSuccess,
      canSubmitSupport,
      closeSupportModal,
      submitSupport
    };
  }
};
</script>
<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Hover effect for card */
.hover\:shadow-3xl:hover {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
}
</style>