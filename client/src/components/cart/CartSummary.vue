<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 sticky top-4"
  >
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Order Summary
    </h2>

    <div class="space-y-3 mb-4">
      <!-- Subtotal -->
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400"
          >Subtotal ({{ itemCount }} items)</span
        >
        <span class="text-gray-900 dark:text-white">{{
          formatCurrency(subtotal)
        }}</span>
      </div>

      <!-- Discount -->
      <div v-if="totalDiscount > 0" class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Discount</span>
        <span class="text-red-600 dark:text-red-400"
          >-{{ formatCurrency(totalDiscount) }}</span
        >
      </div>

      <!-- Shipping -->
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Shipping</span>
        <span
          v-if="freeShipping"
          class="text-green-600 dark:text-green-400 font-medium"
        >
          FREE
        </span>
        <span v-else class="text-gray-900 dark:text-white">
          {{ formatCurrency(shippingFee) }}
        </span>
      </div>

      <!-- Tax -->
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Tax (10%)</span>
        <span class="text-gray-900 dark:text-white">{{
          formatCurrency(tax)
        }}</span>
      </div>
    </div>

    <!-- Benefits Info -->
    <div
      v-if="benefits.length > 0"
      class="mb-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md"
    >
      <ul class="text-xs space-y-1">
        <li
          v-for="(benefit, index) in benefits"
          :key="index"
          class="text-green-700 dark:text-green-400"
        >
          {{ benefit }}
        </li>
      </ul>
    </div>

    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center mb-4">
        <span class="text-base font-semibold text-gray-900 dark:text-white"
          >Total</span
        >
        <span class="text-xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(total) }}
        </span>
      </div>

      <button
        @click="$emit('checkout')"
        :disabled="loading || itemCount === 0"
        class="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Proceed to Checkout
      </button>

      <button
        @click="$emit('continue-shopping')"
        class="w-full mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 transition-colors"
      >
        Continue Shopping
      </button>
    </div>

    <!-- Total Savings -->
    <div
      v-if="totalSavings > 0"
      class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center"
    >
      <p class="text-sm text-green-600 dark:text-green-400 font-medium">
        You're saving {{ formatCurrency(totalSavings) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["checkout", "continue-shopping"]);

const itemCount = computed(() => props.summary.totalItems || 0);
const subtotal = computed(() => props.summary.subtotal || 0);
const totalDiscount = computed(() => props.summary.totalDiscount || 0);
const shippingFee = computed(() => props.summary.shippingFee || 30000);
const freeShipping = computed(
  () => props.summary.cartBenefits?.freeShipping || false
);
const tax = computed(() => Math.round(subtotal.value * 0.1));

const total = computed(() => {
  const shipping = freeShipping.value ? 0 : shippingFee.value;
  return subtotal.value - totalDiscount.value + shipping + tax.value;
});

const totalSavings = computed(() => {
  const itemSavings = totalDiscount.value;
  const shippingSavings = freeShipping.value ? shippingFee.value : 0;
  return itemSavings + shippingSavings;
});

const benefits = computed(() => {
  const result = [];
  const cartBenefits = props.summary.cartBenefits || {};

  if (cartBenefits.freeShipping) {
    result.push("Free shipping applied");
  }
  if (cartBenefits.additionalDiscount > 0) {
    result.push(`Extra ${formatCurrency(cartBenefits.additionalDiscount)} off`);
  }
  if (cartBenefits.gifts?.length > 0) {
    result.push(`${cartBenefits.gifts.length} free gift(s) included`);
  }

  return result;
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
</script>
