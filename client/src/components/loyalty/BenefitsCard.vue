<template>
  <div class="p-6 shadow-lg bg-[#FEFEFF] rounded-xl hover:shadow-lg">
    <h3 class="mb-6 text-xl font-bold text-[#52525C]">
      <span class="text-2xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 text-rose-500"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
          />
        </svg>
      </span>
      <p
        class="mb-1 text-xl font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text"
      >
        Your Benefits
      </p>
    </h3>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <!-- Discount Rate -->
      <div
        class="flex items-start gap-3 p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800"
      >
        <span class="text-2xl hover:text-[#ffff]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 6h.008v.008H6V6Z"
            />
          </svg>
        </span>
        <div>
          <p class="font-semibold text-gray-800 dark:text-white">
            {{ (benefits?.discountRate || 0) * 100 }}% Discount
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">On every order</p>
        </div>
      </div>

      <!-- Free Shipping -->
      <div
        class="flex items-start gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
      >
        <span class="text-2xl hover:text-[#ffff]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
            />
          </svg>
        </span>
        <div>
          <p class="font-semibold text-gray-800 dark:text-white">
            Free Shipping
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ freeShippingText }}
          </p>
        </div>
      </div>

      <!-- Points Multiplier -->
      <div
        class="flex items-start gap-3 p-4 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/20 dark:border-white-800"
      >
        <span class="text-2xl hover:text-[#ffff]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 bg-oklch(87.9% 0.169 91.605)"
          >
            <path
              class=""
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </span>
        <div>
          <p class="font-semibold text-gray-800 dark:text-white">
            {{ benefits?.pointsMultiplier || 1 }}x Points
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Earn more on purchases
          </p>
        </div>
      </div>

      <!-- Birthday Gift - Always show, locked for NEW_CUSTOMER -->
      <div
        :class="[
          'flex items-start gap-3 p-4 border rounded-lg transition-all duration-300',
          benefits?.birthdayGift
            ? 'border-pink-200 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-800'
            : 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed',
          benefits?.birthdayGift ? birthdayGiftClass : '',
        ]"
      >
        <span class="text-2xl">{{ benefits?.birthdayGift ? "🎁" : "🔒" }}</span>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p
              class="font-semibold"
              :class="
                benefits?.birthdayGift
                  ? 'text-gray-800 dark:text-white'
                  : 'text-gray-500'
              "
            >
              Birthday Gift
            </p>
            <span
              v-if="!benefits?.birthdayGift"
              class="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full"
            >
              Unlock at Regular
            </span>
          </div>
          <p
            class="text-sm"
            :class="
              benefits?.birthdayGift
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-500'
            "
          >
            {{
              benefits?.birthdayGift
                ? birthdayGiftText
                : "Available for Regular tier and above"
            }}
          </p>
        </div>
      </div>

      <!-- Early Access - Always show, locked for non-VIP -->
      <div
        :class="[
          'flex items-start gap-3 p-4 border rounded-lg transition-all duration-300',
          benefits?.earlyAccess
            ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
            : 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed',
        ]"
      >
        <span class="text-2xl">{{ benefits?.earlyAccess ? "⚡" : "🔒" }}</span>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p
              class="font-semibold"
              :class="
                benefits?.earlyAccess
                  ? 'text-gray-800 dark:text-white'
                  : 'text-gray-500'
              "
            >
              Early Access
            </p>
            <span
              v-if="!benefits?.earlyAccess"
              class="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full"
            >
              Unlock at VIP
            </span>
          </div>
          <p
            class="text-sm"
            :class="
              benefits?.earlyAccess
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-500'
            "
          >
            {{
              benefits?.earlyAccess
                ? "Sales & new products"
                : "Available for VIP tier and above"
            }}
          </p>
        </div>
      </div>

      <!-- Exclusive Products - Always show, locked for non-VIP -->
      <div
        :class="[
          'flex items-start gap-3 p-4 border rounded-lg transition-all duration-300',
          benefits?.exclusiveProducts
            ? 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800'
            : 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed',
        ]"
      >
        <span class="text-2xl">{{
          benefits?.exclusiveProducts ? "👔" : "🔒"
        }}</span>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p
              class="font-semibold"
              :class="
                benefits?.exclusiveProducts
                  ? 'text-gray-800 dark:text-white'
                  : 'text-gray-500'
              "
            >
              Exclusive Products
            </p>
            <span
              v-if="!benefits?.exclusiveProducts"
              class="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full"
            >
              Unlock at VIP
            </span>
          </div>
          <p
            class="text-sm"
            :class="
              benefits?.exclusiveProducts
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-500'
            "
          >
            {{
              benefits?.exclusiveProducts
                ? "VIP-only items"
                : "Available for VIP tier and above"
            }}
          </p>
        </div>
      </div>

      <!-- Concierge Service - Always show, locked for non-PLATINUM -->
      <div
        :class="[
          'flex items-start gap-3 p-4 border rounded-lg transition-all duration-300',
          benefits?.conciergeService
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
            : 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed',
        ]"
      >
        <span class="text-2xl">{{
          benefits?.conciergeService ? "👨‍💼" : "🔒"
        }}</span>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p
              class="font-semibold"
              :class="
                benefits?.conciergeService
                  ? 'text-gray-800 dark:text-white'
                  : 'text-gray-500'
              "
            >
              Concierge Service
            </p>
            <span
              v-if="!benefits?.conciergeService"
              class="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full"
            >
              Unlock at Platinum
            </span>
          </div>
          <p
            class="text-sm"
            :class="
              benefits?.conciergeService
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-500'
            "
          >
            {{
              benefits?.conciergeService
                ? "Personal assistant"
                : "Available for Platinum tier only"
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatCurrency } from "../../service/loyalty.service";

const props = defineProps({
  benefits: {
    type: Object,
    required: true,
  },
  tier: {
    type: String,
    required: true,
  },
  userBirthDate: {
    type: String,
    default: null,
  },
});

const freeShippingText = computed(() => {
  const threshold = props.benefits?.freeShippingThreshold || 0;
  if (threshold === 0) {
    return "Always free!";
  }
  return `Orders over ${formatCurrency(threshold)}`;
});

// ==================== BIRTHDAY CHECKS ====================
const isBirthdayToday = computed(() => {
  if (!props.userBirthDate) return false;
  const today = new Date();
  const birthDate = new Date(props.userBirthDate);
  return (
    today.getDate() === birthDate.getDate() &&
    today.getMonth() === birthDate.getMonth()
  );
});

const isBirthdayMonth = computed(() => {
  if (!props.userBirthDate) return false;
  const today = new Date();
  const birthDate = new Date(props.userBirthDate);
  return today.getMonth() === birthDate.getMonth();
});

const isBirthdaySoon = computed(() => {
  if (!props.userBirthDate) return false;
  const today = new Date();
  const birthDate = new Date(props.userBirthDate);
  const thisYearBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // Check if birthday is within next 7 days
  const daysUntilBirthday = Math.ceil(
    (thisYearBirthday - today) / (1000 * 60 * 60 * 24)
  );
  return daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
});

const birthdayGiftText = computed(() => {
  if (isBirthdayToday.value) {
    return "🎉 Happy Birthday! Claim your gift!";
  }
  if (isBirthdaySoon.value) {
    return "Coming soon on your birthday!";
  }
  if (isBirthdayMonth.value) {
    return "Birthday month special 🎂";
  }
  return "Special surprise on your birthday";
});

const birthdayGiftClass = computed(() => {
  if (isBirthdayToday.value) {
    return "animate-pulse ring-2 ring-pink-400";
  }
  if (isBirthdaySoon.value) {
    return "ring-1 ring-pink-300";
  }
  return "";
});
</script>
