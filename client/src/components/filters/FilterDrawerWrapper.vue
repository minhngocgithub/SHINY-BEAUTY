<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-0 z-50 overflow-hidden"
        @click.self="closeDrawer"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 transition-opacity bg-black bg-opacity-50"
          @click="closeDrawer"
        ></div>

        <!-- Drawer -->
        <div
          class="absolute inset-y-0 right-0 flex flex-col w-full max-w-sm bg-white shadow-xl"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              @click="closeDrawer"
              class="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
              aria-label="Close filters"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          <!-- Active Filter Count -->
          <div v-if="activeFilterCount > 0" class="px-4 py-2 bg-gray-50">
            <span
              class="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-gray-900 rounded-md"
            >
              {{ activeFilterCount }} active
              {{ activeFilterCount === 1 ? "filter" : "filters" }}
            </span>
          </div>

          <!-- Filters Content -->
          <div class="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
            <!-- Sort By -->
            <div>
              <label class="block mb-2 text-sm font-semibold text-gray-900"
                >Sort By</label
              >
              <select
                :value="filters.sortBy"
                @change="updateFilter('sortBy', $event.target.value)"
                class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
            />

            <!-- Brand -->
            <BrandFilter
              v-if="
                availableFilters.brands && availableFilters.brands.length > 0
              "
              :modelValue="filters.brands"
              :brands="availableFilters.brands"
              @update:modelValue="updateFilter('brands', $event)"
            />

            <!-- Rating -->
            <RatingFilter
              :modelValue="filters.rating"
              @update:modelValue="updateFilter('rating', $event)"
            />

            <!-- Availability -->
            <AvailabilityFilter
              :modelValue="filters.availability"
              @update:modelValue="updateFilter('availability', $event)"
            />
          </div>

          <!-- Footer Actions -->
          <div class="px-4 py-4 space-y-2 border-t bg-gray-50">
            <button
              @click="clearAndClose"
              class="w-full px-4 py-3 font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear All Filters
            </button>
            <button
              @click="closeDrawer"
              class="w-full px-4 py-3 font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from "vue";
import PriceRangeFilter from "./PriceRangeFilter.vue";
import BrandFilter from "./BrandFilter.vue";
import RatingFilter from "./RatingFilter.vue";
import AvailabilityFilter from "./AvailabilityFilter.vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    required: true,
  },
  availableFilters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:open", "update:filters", "clear-all"]);

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

const closeDrawer = () => {
  emit("update:open", false);
};

const clearAndClose = () => {
  emit("clear-all");
  closeDrawer();
};

// Prevent body scroll when drawer is open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .absolute,
.drawer-leave-active .absolute {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .absolute.inset-y-0,
.drawer-leave-to .absolute.inset-y-0 {
  transform: translateX(100%);
}
</style>
