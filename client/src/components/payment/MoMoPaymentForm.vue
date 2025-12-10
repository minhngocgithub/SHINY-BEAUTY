<template>
  <div
    class="p-6 mt-4 border-2 border-pink-200 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50"
  >
    <div class="flex items-center gap-3 mb-4">
      <div
        class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
      >
        <span class="text-2xl">📱</span>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-800">MoMo Payment</h3>
        <p class="text-sm text-gray-600">Enter your MoMo account details</p>
      </div>
    </div>

    <div class="space-y-4">
      <!-- Phone Number -->
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <div class="relative">
          <span
            class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
          >
            +84
          </span>
          <input
            v-model="formData.phoneNumber"
            @input="validatePhone"
            type="tel"
            placeholder="912345678"
            maxlength="10"
            class="w-full py-3 pl-12 pr-4 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            :class="
              errors.phoneNumber
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            "
          />
        </div>
        <p v-if="errors.phoneNumber" class="mt-1 text-xs text-red-600">
          {{ errors.phoneNumber }}
        </p>
        <p v-else class="mt-1 text-xs text-gray-500">
          Enter your registered MoMo phone number
        </p>
      </div>

      <!-- OTP Simulation -->
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          OTP Code *
        </label>
        <div class="flex gap-2">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            v-model="otpDigits[index]"
            @input="handleOTPInput($event, index)"
            @keydown.backspace="handleOTPBackspace($event, index)"
            :ref="(el) => (otpInputs[index] = el)"
            type="text"
            maxlength="1"
            class="w-12 h-12 text-xl font-bold text-center transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            :class="errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
        </div>
        <p v-if="errors.otp" class="mt-1 text-xs text-red-600">
          {{ errors.otp }}
        </p>
        <p v-else class="mt-1 text-xs text-gray-500">
          Enter OTP code sent to your phone (Demo: 123456)
        </p>
      </div>

      <!-- Demo Info -->
      <div class="p-3 border-l-4 border-pink-500 rounded-lg bg-pink-50">
        <div class="flex items-start gap-2">
          <svg
            class="w-5 h-5 mt-0.5 text-pink-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="text-xs text-pink-800">
            <p class="font-semibold">Demo Mode</p>
            <p class="mt-1">Phone: Any 10-digit number | OTP: 123456</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const emit = defineEmits(["update:valid", "update:data"]);

const formData = ref({
  phoneNumber: "",
  otp: "",
});

const otpDigits = ref(["", "", "", "", "", ""]);
const otpInputs = ref([]);
const errors = ref({});

const validatePhone = () => {
  const phone = formData.value.phoneNumber;
  if (!phone) {
    errors.value.phoneNumber = "Phone number is required";
    return false;
  }
  if (!/^\d{9,10}$/.test(phone)) {
    errors.value.phoneNumber = "Invalid phone number (9-10 digits)";
    return false;
  }
  delete errors.value.phoneNumber;
  return true;
};

const handleOTPInput = (event, index) => {
  const value = event.target.value;
  if (!/^\d$/.test(value)) {
    otpDigits.value[index] = "";
    return;
  }

  otpDigits.value[index] = value;

  // Auto focus next input
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }

  updateOTP();
};

const handleOTPBackspace = (event, index) => {
  if (!otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
};

const updateOTP = () => {
  formData.value.otp = otpDigits.value.join("");
  validateOTP();
};

const validateOTP = () => {
  const otp = formData.value.otp;
  if (!otp || otp.length < 6) {
    errors.value.otp = "Please enter 6-digit OTP";
    return false;
  }
  // Demo: Accept 123456 as valid OTP
  if (otp !== "123456") {
    errors.value.otp = "Invalid OTP code (Demo: 123456)";
    return false;
  }
  delete errors.value.otp;
  return true;
};

const isValid = computed(() => {
  return (
    validatePhone() && validateOTP() && Object.keys(errors.value).length === 0
  );
});

// Emit validation status and data
watch(
  [() => formData.value, isValid],
  () => {
    emit("update:valid", isValid.value);
    emit("update:data", formData.value);
  },
  { deep: true }
);
</script>
