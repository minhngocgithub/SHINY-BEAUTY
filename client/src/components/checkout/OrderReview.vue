<template>
  <div class="space-y-6">
    <!-- Shipping Address -->
    <div
      class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          Shipping Address
        </h3>
        <button
          @click="$emit('edit', 'shipping')"
          class="text-sm bg-gray-800 hover:text-gray-900 dark:hover:text-[#FFFF]"
        >
          Edit
        </button>
      </div>
      <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <p class="font-medium text-gray-900 dark:text-white">
          {{ shippingAddress.fullName }}
        </p>
        <p>{{ shippingAddress.phone }}</p>
        <p>{{ shippingAddress.address }}</p>
        <p>
          {{ shippingAddress.ward }}, {{ shippingAddress.district }},
          {{ shippingAddress.city }}
        </p>
        <p v-if="shippingAddress.note" class="italic">
          Note: {{ shippingAddress.note }}
        </p>
      </div>
    </div>

    <!-- Payment Method -->
    <div
      class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          Payment Method
        </h3>
        <button
          @click="$emit('edit', 'payment')"
          class="text-sm bg-gray-800 hover:text-gray-900 dark:hover:text-[#FFFF]"
        >
          Edit
        </button>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ getPaymentMethodName(paymentMethod) }}
      </p>
    </div>

    <!-- Order Items -->
    <div
      class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
    >
      <h3 class="mb-4 font-semibold text-gray-900 dark:text-white">
        Order Items
      </h3>
      <div class="space-y-4">
        <div
          v-for="item in cartItems"
          :key="item._id"
          class="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
        >
          <img
            :src="getItemImage(item)"
            :alt="getItemName(item)"
            class="object-cover w-16 h-16 rounded"
          />
          <div class="flex-1 min-w-0">
            <h4
              class="text-sm font-medium text-gray-900 truncate dark:text-white"
            >
              {{ getItemName(item) }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Qty: {{ item.quantity }}
            </p>
          </div>
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ formatCurrency(item.finalPrice * item.quantity) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div
      class="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
    >
      <h3 class="mb-4 font-semibold text-gray-900 dark:text-white">
        Order Summary
      </h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span class="text-gray-900 dark:text-white">{{
            formatCurrency(summary?.subtotal || 0)
          }}</span>
        </div>
        <div
          v-if="(summary?.totalDiscount || 0) > 0"
          class="flex justify-between"
        >
          <span class="text-gray-600 dark:text-gray-400">Discount</span>
          <span class="text-red-600 dark:text-red-400"
            >-{{ formatCurrency(summary?.totalDiscount || 0) }}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Shipping</span>
          <div class="text-right">
            <span
              v-if="shippingFee === 0"
              class="font-semibold text-green-600 dark:text-green-400"
            >
              FREE
            </span>
            <span v-else class="text-gray-900 dark:text-white">
              {{ formatCurrency(shippingFee) }}
            </span>
            <div v-if="shippingReasonText" class="text-xs text-gray-500 mt-0.5">
              {{ shippingReasonText }}
            </div>
            <!-- Distance-based shipping details -->
            <div
              v-if="calculatedShipping && calculatedShipping.distance"
              class="text-xs text-gray-500 mt-0.5"
            >
              📍 {{ calculatedShipping.distance }}km •
              {{ calculatedShipping.deliveryEstimate }}
            </div>
          </div>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Tax (10%)</span>
          <span class="text-gray-900 dark:text-white">{{
            formatCurrency(tax)
          }}</span>
        </div>
        <div
          class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          <span class="font-semibold text-gray-900 dark:text-white">Total</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">{{
            formatCurrency(total)
          }}</span>
        </div>
      </div>
    </div>

    <!-- Terms -->
    <div class="flex items-start gap-3">
      <input
        v-model="termsAccepted"
        type="checkbox"
        id="terms"
        class="w-4 h-4 mt-1 border-gray-300 rounded dark:border-gray-600 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
      />
      <label for="terms" class="text-sm text-gray-600 dark:text-gray-400">
        I agree to the
        <a href="#" class="text-gray-900 underline dark:text-white"
          >Terms & Conditions</a
        >
        and
        <a href="#" class="text-gray-900 underline dark:text-white"
          >Privacy Policy</a
        >
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  calculateOrderPricing,
  formatShippingReason,
} from "../../service/payment.service";

const props = defineProps({
  shippingAddress: {
    type: Object,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  cartItems: {
    type: Array,
    default: () => [],
  },
  summary: {
    type: Object,
    default: () => ({}),
  },
  calculatedShipping: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["edit", "update:termsAccepted"]);

const termsAccepted = ref(false);

// ✅ Use payment.service.js for consistent pricing
const pricing = computed(() => {
  return calculateOrderPricing(
    props.cartItems || [],
    0, // loyaltyPoints
    0, // couponDiscount
    props.summary?.cartBenefits || {},
    {
      userLoyaltyTier: null,
      shippingAddress: props.shippingAddress,
      paymentMethod: props.paymentMethod,
      calculatedShipping: props.calculatedShipping, // Pass calculated shipping from API
    }
  );
});

const tax = computed(() => pricing.value.taxPrice);
const shippingFee = computed(() => pricing.value.shippingPrice);
const total = computed(() => pricing.value.totalPrice);
const shippingReasonText = computed(() =>
  formatShippingReason(pricing.value.shippingReason)
);

const getPaymentMethodName = (method) => {
  const methods = {
    cod: "Cash on Delivery",
    vnpay: "VNPay",
    momo: "Momo",
    paypal: "PayPal",
  };
  return methods[method] || method;
};

const getItemName = (item) => {
  return item.product?.name || item.bundle?.name || "Unknown Item";
};

const getItemImage = (item) => {
  // Check product.image (array)
  if (
    item.product?.image &&
    Array.isArray(item.product.image) &&
    item.product.image.length > 0
  ) {
    return item.product.image[0].url;
  }

  // Check bundle.image
  if (item.bundle?.image) {
    return Array.isArray(item.bundle.image)
      ? item.bundle.image[0]?.url
      : item.bundle.image.url;
  }

  return "/placeholder.jpg";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

defineExpose({ termsAccepted });
</script>
