<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
  >
    <div class="flex gap-4">
      <!-- Product Image -->
      <div class="flex-shrink-0">
        <img
          :src="itemImage"
          :alt="itemName"
          class="w-24 h-24 object-cover rounded-md"
        />
      </div>

      <!-- Product Info -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between gap-4">
          <div class="flex-1">
            <h3
              class="text-base font-medium text-gray-900 dark:text-white truncate"
            >
              {{ itemName }}
            </h3>
            <p
              v-if="item.product?.brand"
              class="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
            >
              {{ item.product.brand }}
            </p>

            <!-- Sale Badge -->
            <div
              v-if="hasDiscount"
              class="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            >
              Save {{ formatCurrency(item.savings) }}
            </div>

            <!-- Stock Warning -->
            <div
              v-if="stockWarning"
              class="mt-2 text-xs text-amber-600 dark:text-amber-400"
            >
              Only {{ availableStock }} left in stock
            </div>
          </div>

          <!-- Price -->
          <div class="text-right">
            <div
              v-if="hasDiscount"
              class="text-sm text-gray-400 dark:text-gray-500 line-through"
            >
              {{ formatCurrency(item.product?.price || item.bundle?.price) }}
            </div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formatCurrency(item.finalPrice) }}
            </div>
          </div>
        </div>

        <!-- Quantity Controls & Remove -->
        <div class="flex items-center justify-between mt-4">
          <div
            class="flex items-center border border-gray-300 dark:border-gray-600 rounded-md"
          >
            <button
              @click="decreaseQuantity"
              :disabled="loading || item.quantity <= 1"
              class="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <input
              type="text"
              :value="item.quantity"
              readonly
              class="w-12 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white"
            />
            <button
              @click="increaseQuantity"
              :disabled="loading || item.quantity >= availableStock"
              class="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>

          <button
            @click="$emit('remove', item._id)"
            :disabled="loading"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update-quantity", "remove"]);

const itemName = computed(() => {
  return props.item.product?.name || props.item.bundle?.name || "Unknown Item";
});

const itemImage = computed(() => {
  const product = props.item.product;
  const bundle = props.item.bundle;

  if (product?.images?.[0]?.url) return product.images[0].url;
  if (bundle?.image?.url) return bundle.image.url;

  return "/placeholder.jpg";
});

const hasDiscount = computed(() => {
  return props.item.savings > 0;
});

const availableStock = computed(() => {
  return props.item.product?.stock || props.item.bundle?.stock || 0;
});

const stockWarning = computed(() => {
  return availableStock.value > 0 && availableStock.value <= 5;
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const increaseQuantity = () => {
  if (props.item.quantity < availableStock.value) {
    emit("update-quantity", props.item._id, props.item.quantity + 1);
  }
};

const decreaseQuantity = () => {
  if (props.item.quantity > 1) {
    emit("update-quantity", props.item._id, props.item.quantity - 1);
  }
};
</script>
