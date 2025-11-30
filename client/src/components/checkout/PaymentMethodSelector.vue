<template>
  <div class="space-y-4">
    <div
      v-for="method in paymentMethods"
      :key="method.id"
      @click="selectMethod(method.id)"
      class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer transition-all"
      :class="{
        'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800':
          selected === method.id,
        'hover:border-gray-400 dark:hover:border-gray-500':
          selected !== method.id,
      }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            :class="{
              'border-gray-900 dark:border-white': selected === method.id,
              'border-gray-300 dark:border-gray-600': selected !== method.id,
            }"
          >
            <div
              v-if="selected === method.id"
              class="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white"
            ></div>
          </div>
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              {{ method.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ method.description }}
            </p>
          </div>
        </div>
        <span
          v-if="method.badge"
          class="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
        >
          {{ method.badge }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "cod",
  },
});

const emit = defineEmits(["update:modelValue"]);

const selected = ref(props.modelValue);

const paymentMethods = [
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    badge: "Popular",
  },
  {
    id: "vnpay",
    name: "VNPay",
    description: "Pay securely with VNPay gateway",
    badge: "",
  },
  {
    id: "momo",
    name: "Momo",
    description: "Pay with Momo e-wallet",
    badge: "",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account",
    badge: "",
  },
];

const selectMethod = (methodId) => {
  selected.value = methodId;
  emit("update:modelValue", methodId);
};
</script>
