<template>
  <div class="price-display">
    <!-- Regular Price -->
    <div v-if="!isOnSale" class="flex items-baseline">
      <span class="text-2xl font-bold text-gray-900">
        ${{ originalPrice }}
      </span>
      <span v-if="unit" class="ml-1 text-sm text-gray-500"> /{{ unit }} </span>
    </div>

    <!-- Sale Price -->
    <div v-else class="space-y-1">
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-red-600"> ${{ salePrice }} </span>
        <span class="text-lg text-gray-400 line-through">
          ${{ originalPrice }}
        </span>
        <span
          v-if="discountPercentage > 0"
          class="text-sm font-semibold text-red-600"
        >
          -{{ discountPercentage }}%
        </span>
      </div>

      <div v-if="showSavings" class="text-sm text-green-600">
        You save ${{ savingsAmount }}
      </div>
    </div>

    <!-- Price Range -->
    <div v-if="isPriceRange" class="flex items-baseline">
      <span class="text-2xl font-bold text-gray-900">
        ${{ minPrice }} - ${{ maxPrice }}
      </span>
      <span v-if="unit" class="ml-1 text-sm text-gray-500"> /{{ unit }} </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  originalPrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    default: null,
  },
  minPrice: {
    type: Number,
    default: null,
  },
  maxPrice: {
    type: Number,
    default: null,
  },
  unit: {
    type: String,
    default: "",
  },
  showSavings: {
    type: Boolean,
    default: true,
  },
});

const isOnSale = computed(() => {
  return props.salePrice && props.salePrice < props.originalPrice;
});

const isPriceRange = computed(() => {
  return props.minPrice && props.maxPrice && props.minPrice !== props.maxPrice;
});

const discountPercentage = computed(() => {
  if (!isOnSale.value) return 0;
  return Math.round(
    ((props.originalPrice - props.salePrice) / props.originalPrice) * 100
  );
});

const savingsAmount = computed(() => {
  if (!isOnSale.value) return 0;
  return (props.originalPrice - props.salePrice).toFixed(2);
});
</script>






