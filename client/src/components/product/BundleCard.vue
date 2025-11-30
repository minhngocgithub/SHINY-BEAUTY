<template>
  <div
    class="flex flex-col h-[380px] overflow-hidden bg-white rounded-xl w-full relative group  transition-all duration-300 hover:shadow-xl"
    @mouseenter="showQuickLook = true"
    @mouseleave="showQuickLook = false"
  >
    <div
      v-if="bundle.discountPercentage > 0"
      class="absolute z-30 top-2 right-2"
    >
      <div
        class="px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-red-500 to-pink-500"
      >
        -{{ bundle.discountPercentage }}%
      </div>
    </div>

    <!-- Quick Look Overlay -->
    <div
      v-show="showQuickLook"
      class="absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-20"
    >
      <button
        @click.stop.prevent="openQuickLook"
        class="px-6 py-2 text-sm font-medium text-white transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
      >
        Quick Look
      </button>
    </div>

    <!-- Image Section -->
    <div @click="viewDetails" class="cursor-pointer">
      <LazyImg
        class-style="h-[200px] object-cover w-full flex-shrink-0"
        :src="bundleImage"
        :alt="bundle.name"
      />
    </div>

    <!-- Content Section -->
    <div class="flex flex-col flex-1 p-4">
      <!-- Bundle Name -->
      <h3
        @click="viewDetails"
        class="h-12 mb-2 text-base font-bold leading-6 text-gray-900 transition-colors cursor-pointer line-clamp-2 hover:text-gray-600"
      >
        {{ bundle.name }}
      </h3>

      <!-- Items Count -->
      <div class="flex items-center gap-2 mb-3 text-sm text-gray-600">
        <svg
          class="size-6"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="url(#grad1)"
        >
          <defs>
            <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#ef4444" />
              <!-- red-500 -->
              <stop offset="100%" stop-color="#ec4899" />
              <!-- pink-500 -->
            </linearGradient>
          </defs>

          <path
            fill-rule="evenodd"
            d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
          />
        </svg>

        <span>{{ itemsCount }} items</span>
      </div>

      <!-- Price Section -->
      <div class="mb-3">
        <div class="flex items-baseline gap-2 mb-1">
          <span class="text-2xl font-bold text-red-600">
            ${{ bundlePrice }}
          </span>
          <span class="text-sm text-gray-400 line-through">
            ${{ originalPrice }}
          </span>
        </div>
        <p class="text-xs font-semibold text-green-700">Save ${{ savings }}</p>
      </div>
    </div>

    <!-- Quick Look Modal -->
    <BundleQuickLookModal
      :is-open="isQuickLookOpen"
      :bundle="bundle"
      @close="isQuickLookOpen = false"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import LazyImg from "../atoms/LazyImg.vue";
import BundleQuickLookModal from "./BundleQuickLookModal.vue";

const props = defineProps({
  bundle: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["add-to-cart", "view-details"]);

// State
const showQuickLook = ref(false);
const isQuickLookOpen = ref(false);
const isProcessing = ref(false);

// Computed
const bundleImage = computed(() => {
  if (props.bundle.image && props.bundle.image.length > 0) {
    return props.bundle.image[0].url || "https://via.placeholder.com/400";
  }
  return "https://via.placeholder.com/400";
});

const itemsCount = computed(() => {
  return props.bundle.items?.length || 0;
});

const originalPrice = computed(() => {
  return (props.bundle.originalPrice || 0).toFixed(2);
});

const bundlePrice = computed(() => {
  return (props.bundle.bundlePrice || 0).toFixed(2);
});

const savings = computed(() => {
  return (props.bundle.originalPrice - props.bundle.bundlePrice).toFixed(2);
});

// Methods
const openQuickLook = () => {
  isQuickLookOpen.value = true;
};

const viewDetails = () => {
  emit("view-details", props.bundle);
};

const addToCart = async () => {
  if (isProcessing.value || !props.bundle.isActive) return;

  isProcessing.value = true;
  try {
    emit("add-to-cart", props.bundle);
    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>