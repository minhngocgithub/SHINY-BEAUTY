<template>
  <div
    class="p-6 mt-4 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50"
  >
    <div class="flex items-center gap-3 mb-4">
      <div
        class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
      >
        <span class="text-2xl">💳</span>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-800">PayPal Payment</h3>
        <p class="text-sm text-gray-600">
          Enter your PayPal account or card details
        </p>
      </div>
    </div>

    <div class="mb-4">
      <div class="flex gap-2">
        <button
          @click="paymentType = 'paypal'"
          class="flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg"
          :class="
            paymentType === 'paypal'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          "
        >
          PayPal Account
        </button>
        <button
          @click="paymentType = 'card'"
          class="flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg"
          :class="
            paymentType === 'card'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          "
        >
          Debit/Credit Card
        </button>
      </div>
    </div>

    <!-- PayPal Account Form -->
    <div v-if="paymentType === 'paypal'" class="space-y-4">
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          PayPal Email *
        </label>
        <input
          v-model="formData.email"
          @input="validateEmail"
          type="email"
          placeholder="your@email.com"
          class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-red-600">
          {{ errors.email }}
        </p>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Password *
        </label>
        <div class="relative">
          <input
            v-model="formData.password"
            @input="validatePassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your PayPal password"
            class="w-full px-4 py-3 pr-12 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="
              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
            "
          />
          <button
            @click="showPassword = !showPassword"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          >
            <svg
              v-if="showPassword"
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
        <p v-if="errors.password" class="mt-1 text-xs text-red-600">
          {{ errors.password }}
        </p>
      </div>
    </div>

    <!-- Card Form -->
    <div v-else class="space-y-4">
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Card Number *
        </label>
        <input
          v-model="formData.cardNumber"
          @input="formatCardNumber"
          type="text"
          placeholder="1234 5678 9012 3456"
          maxlength="19"
          class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="
            errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
          "
        />
        <p v-if="errors.cardNumber" class="mt-1 text-xs text-red-600">
          {{ errors.cardNumber }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Expiry Date *
          </label>
          <input
            v-model="formData.expiryDate"
            @input="formatExpiryDate"
            type="text"
            placeholder="MM/YY"
            maxlength="5"
            class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="
              errors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
            "
          />
          <p v-if="errors.expiryDate" class="mt-1 text-xs text-red-600">
            {{ errors.expiryDate }}
          </p>
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            CVV *
          </label>
          <input
            v-model="formData.cvv"
            @input="validateCVV"
            type="text"
            placeholder="123"
            maxlength="3"
            class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          />
          <p v-if="errors.cvv" class="mt-1 text-xs text-red-600">
            {{ errors.cvv }}
          </p>
        </div>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">
          Cardholder Name *
        </label>
        <input
          v-model="formData.cardholderName"
          @input="validateCardholderName"
          type="text"
          placeholder="JOHN DOE"
          class="w-full px-4 py-3 transition-all duration-200 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="
            errors.cardholderName
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          "
        />
        <p v-if="errors.cardholderName" class="mt-1 text-xs text-red-600">
          {{ errors.cardholderName }}
        </p>
      </div>
    </div>

    <!-- Demo Info -->
    <div class="p-3 mt-4 border-l-4 border-blue-500 rounded-lg bg-blue-50">
      <div class="flex items-start gap-2">
        <svg
          class="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="text-xs text-blue-800">
          <p class="font-semibold">Demo Mode</p>
          <p class="mt-1" v-if="paymentType === 'paypal'">
            Email: demo@paypal.com | Password: demo123
          </p>
          <p class="mt-1" v-else>
            Card: 4242 4242 4242 4242 | Expiry: 12/25 | CVV: 123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const emit = defineEmits(["update:valid", "update:data"]);

const paymentType = ref("paypal"); // 'paypal' or 'card'
const showPassword = ref(false);

const formData = ref({
  email: "",
  password: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardholderName: "",
});

const errors = ref({});

// PayPal validations
const validateEmail = () => {
  const email = formData.value.email;
  if (!email) {
    errors.value.email = "Email is required";
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.value.email = "Invalid email format";
    return false;
  }
  delete errors.value.email;
  return true;
};

const validatePassword = () => {
  const password = formData.value.password;
  if (!password) {
    errors.value.password = "Password is required";
    return false;
  }
  if (password.length < 6) {
    errors.value.password = "Password must be at least 6 characters";
    return false;
  }
  delete errors.value.password;
  return true;
};

// Card validations
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, "");
  value = value.replace(/\D/g, "");
  value = value.substring(0, 16);
  formData.value.cardNumber = value.match(/.{1,4}/g)?.join(" ") || value;

  if (!value) {
    errors.value.cardNumber = "Card number is required";
  } else if (value.length < 16) {
    errors.value.cardNumber = "Card number must be 16 digits";
  } else {
    delete errors.value.cardNumber;
  }
};

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  formData.value.expiryDate = value;

  if (!value) {
    errors.value.expiryDate = "Expiry date is required";
  } else if (value.length < 5) {
    errors.value.expiryDate = "Invalid expiry date";
  } else {
    delete errors.value.expiryDate;
  }
};

const validateCVV = () => {
  const cvv = formData.value.cvv.replace(/\D/g, "");
  formData.value.cvv = cvv;

  if (!cvv) {
    errors.value.cvv = "CVV is required";
    return false;
  }
  if (cvv.length < 3) {
    errors.value.cvv = "CVV must be 3 digits";
    return false;
  }
  delete errors.value.cvv;
  return true;
};

const validateCardholderName = () => {
  const name = formData.value.cardholderName;
  if (!name) {
    errors.value.cardholderName = "Cardholder name is required";
    return false;
  }
  delete errors.value.cardholderName;
  return true;
};

const isValid = computed(() => {
  if (paymentType.value === "paypal") {
    return validateEmail() && validatePassword();
  } else {
    const cardValid =
      formData.value.cardNumber.replace(/\s/g, "").length === 16;
    const expiryValid = formData.value.expiryDate.length === 5;
    const cvvValid = formData.value.cvv.length === 3;
    const nameValid = !!formData.value.cardholderName;
    return (
      cardValid &&
      expiryValid &&
      cvvValid &&
      nameValid &&
      Object.keys(errors.value).length === 0
    );
  }
});

watch(
  [() => formData.value, isValid, paymentType],
  () => {
    emit("update:valid", isValid.value);
    emit("update:data", { ...formData.value, paymentType: paymentType.value });
  },
  { deep: true }
);
</script>
