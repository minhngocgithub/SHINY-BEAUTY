<template>
  <div class="p-6 border shadow-sm bg-gradient-to-br from-white to-rose-50 rounded-2xl border-rose-100">
    <div v-if="priceInfo.type === 'regular'" class="space-y-2">
      <div class="text-4xl font-bold text-gray-900">${{ priceInfo.displayPrice.toFixed(2) }}</div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-baseline gap-3">
        <div class="text-4xl font-bold text-red-600">${{ priceInfo.displayPrice.toFixed(2) }}</div>
        <div class="text-2xl text-gray-400 line-through">${{ priceInfo.originalPrice.toFixed(2) }}</div>
      </div>

      <div v-if="priceInfo.discountPercentage > 0" class="flex flex-wrap items-center gap-3">
        <span class="inline-flex items-center px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full">
          Save {{ priceInfo.discountPercentage }}%
        </span>
        <span class="text-sm font-semibold text-green-600">
          You save ${{ savingsAmount }}
        </span>
      </div>

      <Countdown
        v-if="shouldShowCountdown"
        :end-date="activeSaleProgram.endDate"
        class="mt-2"
      />

      <div v-if="priceInfo.type === 'flash_sale'" class="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold text-yellow-600">⚡ Flash Sale</span>
          <span class="text-gray-600">{{ flashSaleStockInfo }}</span>
        </div>
        <div v-if="product.flashSale?.maxQuantityPerUser" class="mt-1 text-xs text-gray-500">
          Max {{ product.flashSale.maxQuantityPerUser }} per customer
        </div>
      </div>

      <div v-if="activeSaleProgram && priceInfo.type === 'sale_program'" class="p-3 border border-blue-200 rounded-lg bg-blue-50">
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold text-blue-600">{{ saleProgramBadge?.text || '🔥 Sale' }}</span>
          <span class="text-gray-600">{{ activeSaleProgram.title }}</span>
        </div>
        <div v-if="activeSaleProgram.description" class="mt-1 text-xs text-gray-500 line-clamp-2">
          {{ activeSaleProgram.description }}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 mt-4 text-sm font-medium">
      <div v-if="isInStock && !isLowStock" class="flex items-center text-green-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>In Stock ({{ product.countInstock }} available)</span>
      </div>

      <div v-else-if="isInStock && isLowStock" class="flex items-center text-orange-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>Low Stock - Only {{ product.countInstock }} left!</span>
      </div>

      <div v-else class="flex items-center text-red-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>Out of Stock</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from "vue";
import Countdown from "../atoms/Countdown.vue";
import { useSaleProgramStore } from "../../store/saleProgram.store";
import { calculateProductPrice } from "../../helpers/caculatorPrice";

const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (value) => value && value.price !== undefined,
  },
});

const saleProgramStore = useSaleProgramStore();

const LOW_STOCK_THRESHOLD = 5;

// Ensure active programs are loaded
onMounted(async () => {
  if (saleProgramStore.activePrograms.length === 0) {
    console.log('🔄 Loading active sale programs...')
    await saleProgramStore.fetchActivePrograms()
    console.log('✅ Active programs loaded:', saleProgramStore.activePrograms.length)
  }
})

// Get active sale program for this product
const activeSaleProgram = computed(() => {
  const program = saleProgramStore.getProgramForProduct(props.product);
  
  console.log('🎯 Active Sale Program:', {
    productName: props.product.name,
    foundProgram: !!program,
    programTitle: program?.title,
    discountPercentage: program?.benefits?.discountPercentage,
    totalActivePrograms: saleProgramStore.activePrograms.length
  });
  
  return program;
});

const priceInfo = computed(() => {
  const program = activeSaleProgram.value;
  const result = calculateProductPrice(props.product, program);
  
  console.log('💵 Price Info Result:', {
    productName: props.product.name,
    type: result.type,
    displayPrice: result.displayPrice,
    originalPrice: result.originalPrice,
    discountPercentage: result.discountPercentage,
    hasSaleProgram: !!program
  });
  
  return result;
});

// Watch for changes in product or active programs
watch(
  () => [props.product._id, saleProgramStore.activePrograms.length],
  ([productId, programCount]) => {
    console.log('🔄 Dependencies changed:', {
      productId,
      activeProgramsCount: programCount
    });
  },
  { immediate: true }
);

const saleProgramBadge = computed(() => {
  if (!activeSaleProgram.value) return null;
  return saleProgramStore.getProgramBadge(activeSaleProgram.value);
});

const savingsAmount = computed(() => {
  const savings = Math.max(0, priceInfo.value.originalPrice - priceInfo.value.displayPrice);
  return savings.toFixed(2);
});

const isInStock = computed(() => {
  return (props.product.countInstock || 0) > 0;
});

const isLowStock = computed(() => {
  const stock = props.product.countInstock || 0;
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
});

const flashSaleStockInfo = computed(() => {
  if (priceInfo.value.type !== 'flash_sale') return "";

  const saleStock = props.product.flashSale?.saleStock || 0;

  if (saleStock <= 0) return "Sold out at this price!";
  if (saleStock < 5) return `Almost gone! Only ${saleStock} left at this price!`;
  return `Only ${saleStock} left at this price!`;
});

const shouldShowCountdown = computed(() => {
  if (!activeSaleProgram.value?.endDate) return false;

  const now = new Date();
  const endDate = new Date(activeSaleProgram.value.endDate);

  return now < endDate;
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>