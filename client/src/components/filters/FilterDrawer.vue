<template>
  <div>
    <Transition name="fade">
      <div
        v-if="isOpen"
        @click="close"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        role="presentation"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <aside
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-sm bg-white shadow-2xl lg:hidden"
        role="dialog"
        aria-label="Filter products"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50"
        >
          <div>
            <h2 class="text-base font-bold text-gray-900">Filters</h2>
            <span
              v-if="filterStore.activeFilterCount > 0"
              class="inline-flex items-center mt-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-700 text-white"
            >
              {{ filterStore.activeFilterCount }} active
            </span>
          </div>
          <button
            @click="close"
            type="button"
            class="p-2 text-gray-500 transition-colors rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close filters"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Filter Content (Scrollable) -->
        <div
          class="flex-1 px-5 py-5 space-y-6 overflow-y-auto custom-scrollbar"
        >
          <!-- Price Range -->
          <section class="pb-5 border-b border-gray-200">
            <PriceRangeFilter
              v-model="filterStore.priceRange"
              :limits="filterStore.priceRangeLimits"
            />
          </section>

          <!-- Brand -->
          <section class="pb-5 border-b border-gray-200">
            <BrandFilter
              v-model="filterStore.selectedBrands"
              :brands="filterStore.availableBrands"
              :brand-counts="brandCounts"
            />
          </section>

          <!-- Rating -->
          <section class="pb-5 border-b border-gray-200">
            <RatingFilter v-model="filterStore.minRating" />
          </section>

          <!-- Availability -->
          <section class="pb-5">
            <AvailabilityFilter v-model="filterStore.inStock" />
          </section>
        </div>

        <!-- Footer Actions -->
        <div class="px-5 py-4 space-y-3 border-t border-gray-200 bg-gray-50">
          <button
            @click="applyFilters"
            type="button"
            class="w-full px-4 py-3 text-sm font-bold text-white transition-colors bg-gray-900 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Show {{ resultCount }} Result{{ resultCount !== 1 ? "s" : "" }}
          </button>
          <button
            v-if="filterStore.activeFilterCount > 0"
            @click="clearFilters"
            type="button"
            class="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Clear All Filters
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { useFilterStore } from "../../store/filter.store";
import PriceRangeFilter from "./PriceRangeFilter.vue";
import BrandFilter from "./BrandFilter.vue";
import RatingFilter from "./RatingFilter.vue";
import AvailabilityFilter from "./AvailabilityFilter.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  brandCounts: {
    type: Object,
    default: () => ({}),
  },
  resultCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["close", "apply"]);

const filterStore = useFilterStore();

const close = () => {
  emit("close");
};

const applyFilters = () => {
  emit("apply");
  close();
};

const clearFilters = () => {
  filterStore.resetFilters();
  applyFilters();
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f9fafb;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
