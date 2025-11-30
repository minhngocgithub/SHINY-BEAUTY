<template>
  <aside
    class="sticky p-6 bg-white rounded-lg shadow-sm top-4"
    role="complementary"
    aria-label="Product filters"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
      <button
        v-if="activeFilterCount > 0"
        @click="$emit('clear-all')"
        type="button"
        class="px-3 py-1 text-xs font-semibold text-gray-600 transition-colors rounded hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label="Clear all filters"
      >
        Clear All
      </button>
    </div>

    <!-- Active Filter Count -->
    <div v-if="activeFilterCount > 0" class="mb-4">
      <span
        class="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-gray-900 rounded-md"
      >
        {{ activeFilterCount }} active
        {{ activeFilterCount === 1 ? "filter" : "filters" }}
      </span>
    </div>

    <!-- Sort By -->
    <div class="mb-6">
      <label class="block mb-2 text-sm font-semibold text-gray-900"
        >Sort By</label
      >
      <select
        :value="filters.sortBy"
        @change="updateFilter('sortBy', $event.target.value)"
        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
      >
        <option value="relevance">Most Relevant</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest First</option>
        <option value="popular">Most Popular</option>
        <option value="rating">Highest Rated</option>
      </select>
    </div>

    <!-- Price Range -->
    <PriceRangeFilter
      :modelValue="filters.priceRange"
      :limits="availableFilters.priceRange || { min: 0, max: 1000 }"
      @update:modelValue="updateFilter('priceRange', $event)"
      class="mb-6"
    />

    <!-- Brand -->
    <BrandFilter
      v-if="availableFilters.brands && availableFilters.brands.length > 0"
      :modelValue="filters.brands"
      :brands="availableFilters.brands"
      @update:modelValue="updateFilter('brands', $event)"
      class="mb-6"
    />

    <!-- Rating -->
    <RatingFilter
      :modelValue="filters.rating"
      @update:modelValue="updateFilter('rating', $event)"
      class="mb-6"
    />

    <!-- Availability -->
    <AvailabilityFilter
      :modelValue="filters.availability"
      @update:modelValue="updateFilter('availability', $event)"
      class="mb-6"
    />
  </aside>
</template>

<script setup>
import { computed } from "vue";
import PriceRangeFilter from "./PriceRangeFilter.vue";
import BrandFilter from "./BrandFilter.vue";
import RatingFilter from "./RatingFilter.vue";
import AvailabilityFilter from "./AvailabilityFilter.vue";

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  availableFilters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:filters", "clear-all"]);

const activeFilterCount = computed(() => {
  let count = 0;
  if (props.filters.priceRange?.min || props.filters.priceRange?.max) count++;
  if (props.filters.brands?.length > 0) count++;
  if (props.filters.categories?.length > 0) count++;
  if (props.filters.rating) count++;
  if (props.filters.availability !== "all") count++;
  return count;
});

const updateFilter = (key, value) => {
  emit("update:filters", { [key]: value });
};
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
