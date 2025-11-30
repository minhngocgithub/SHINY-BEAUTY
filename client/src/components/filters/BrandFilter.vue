<template>
  <div class="brand-filter" role="group" aria-labelledby="brand-filter-label">
    <div class="flex items-center justify-between mb-4">
      <h3 id="brand-filter-label" class="text-sm font-semibold text-gray-900">
        Brand
      </h3>
      <button
        v-if="modelValue.length > 0"
        @click="clearAll"
        type="button"
        class="text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 rounded px-2 py-1"
        aria-label="Clear all brand filters"
      >
        Clear
      </button>
    </div>

    <!-- Search -->
    <div v-if="brands.length > 5" class="mb-3">
      <label for="brand-search" class="sr-only">Search brands</label>
      <input
        id="brand-search"
        v-model="searchQuery"
        type="search"
        placeholder="Search brands..."
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors bg-white"
        aria-label="Search brands"
      />
    </div>

    <!-- Brand List -->
    <div
      class="space-y-1 max-h-64 overflow-y-auto custom-scrollbar"
      role="list"
    >
      <label
        v-for="brand in filteredBrands"
        :key="brand"
        class="flex items-center gap-2.5 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-colors"
        role="listitem"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(brand)"
          @change="toggleBrand(brand)"
          class="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          :aria-label="`${brand} (${getBrandCount(brand)} products)`"
        />
        <span
          class="flex-1 text-sm text-gray-700 group-hover:text-gray-900 font-normal"
        >
          {{ brand }}
        </span>
        <span class="text-xs text-gray-500 font-medium" aria-hidden="true">
          {{ getBrandCount(brand) }}
        </span>
      </label>
    </div>

    <!-- Show More/Less -->
    <button
      v-if="brands.length > 10 && !showAll"
      @click="showAll = true"
      type="button"
      class="mt-3 text-xs font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 rounded px-2 py-1"
      aria-label="Show more brands"
    >
      + Show {{ brands.length - 10 }} more
    </button>

    <!-- No Results -->
    <div
      v-if="filteredBrands.length === 0"
      class="py-4 text-sm text-center text-gray-500"
    >
      No brands found
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  brands: {
    type: Array,
    default: () => [],
  },
  brandCounts: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const searchQuery = ref("");
const showAll = ref(false);

const filteredBrands = computed(() => {
  let filtered = props.brands;

  // Apply search filter
  if (searchQuery.value) {
    filtered = filtered.filter((brand) =>
      brand.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Limit display count
  if (!showAll.value && !searchQuery.value) {
    filtered = filtered.slice(0, 10);
  }

  return filtered;
});

const toggleBrand = (brand) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(brand);

  if (index > -1) {
    newValue.splice(index, 1);
  } else {
    newValue.push(brand);
  }

  emit("update:modelValue", newValue);
};

const clearAll = () => {
  emit("update:modelValue", []);
};

const getBrandCount = (brand) => {
  return props.brandCounts[brand] || 0;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
</style>
