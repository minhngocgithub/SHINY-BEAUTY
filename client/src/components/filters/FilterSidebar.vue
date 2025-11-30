<template>
  <aside
    class="flex flex-col h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm filter-sidebar"
    role="complementary"
    aria-label="Product filters"
  >
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-gray-900">Filters</h2>
        <button
          v-if="filterStore.activeFilterCount > 0"
          @click="clearAllAndApply()"
          type="button"
          class="text-xs font-semibold text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 rounded px-3 py-1.5 transition-colors"
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>

      <!-- Active Filter Count -->
      <div v-if="filterStore.activeFilterCount > 0" class="mt-2">
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-700 text-white"
        >
          {{ filterStore.activeFilterCount }} active
          {{ filterStore.activeFilterCount === 1 ? "filter" : "filters" }}
        </span>
      </div>
    </div>

    <!-- Filter Sections -->
    <div class="flex-1 px-5 py-5 space-y-6 overflow-y-auto custom-scrollbar">
      <!-- Price Range -->
      <section class="pb-5 border-b border-gray-200">
        <PriceRangeFilter
          v-model="filterStore.priceRange"
          :limits="filterStore.priceRangeLimits"
          @update:modelValue="handleFilterChange"
        />
      </section>

      <!-- Brand -->
      <section class="pb-5 border-b border-gray-200">
        <BrandFilter
          v-model="filterStore.selectedBrands"
          :brands="filterStore.availableBrands"
          :brand-counts="brandCounts"
          @update:modelValue="handleFilterChange"
        />
      </section>

      <!-- Rating -->
      <section class="pb-5 border-b border-gray-200">
        <RatingFilter
          v-model="filterStore.minRating"
          @update:modelValue="handleFilterChange"
        />
      </section>

      <!-- Availability -->
      <section class="pb-5">
        <AvailabilityFilter
          v-model="filterStore.inStock"
          @update:modelValue="handleFilterChange"
        />
      </section>
    </div>
  </aside>
</template>

<script setup>
import { useFilterStore } from "../../store/filter.store";
import { debounce } from "../../utils/debounce";
import PriceRangeFilter from "./PriceRangeFilter.vue";
import BrandFilter from "./BrandFilter.vue";
import RatingFilter from "./RatingFilter.vue";
import AvailabilityFilter from "./AvailabilityFilter.vue";

defineProps({
  brandCounts: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["apply"]);
const filterStore = useFilterStore();

// Debounce auto-apply to avoid firing too many requests while user adjusts controls
const debouncedApply = debounce(() => emit("apply"), 300);

const handleFilterChange = () => {
  // Auto-apply filters on change (debounced)
  debouncedApply();
};

const clearAllAndApply = () => {
  filterStore.resetFilters();
  emit("apply");
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f9fafb;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
