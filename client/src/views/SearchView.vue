<template>
  <div class="min-h-screen bg-gray-50">
    <div class="px-4 py-8 mx-auto max-w-7xl">
      <!-- Search Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          Search Results
          <span v-if="searchQuery.keyword" class="text-purple-600"
            >for "{{ searchQuery.keyword }}"</span
          >
        </h1>
        <p v-if="!loading" class="mt-1 text-gray-600">
          {{ pagination.total }} products found
        </p>
      </div>

      <div class="flex flex-col gap-6 lg:flex-row">
        <!-- Filters Sidebar - Desktop -->
        <div class="hidden lg:block lg:flex-shrink-0 lg:w-64">
          <FilterSidebarWrapper
            :filters="filterState"
            :available-filters="availableFilters"
            @update:filters="updateFilters"
            @clear-all="clearAllFilters"
          />
        </div>

        <!-- Filter Drawer - Mobile -->
        <FilterDrawerWrapper
          :open="showMobileFilters"
          :filters="filterState"
          :available-filters="availableFilters"
          @update:open="showMobileFilters = $event"
          @update:filters="updateFilters"
          @clear-all="clearAllFilters"
        />

        <!-- Products Grid -->
        <div class="flex-1 min-w-0">
          <!-- Mobile Filter Button -->
          <div class="mb-4 lg:hidden">
            <button
              @click="showMobileFilters = true"
              class="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filters</span>
              <span
                v-if="activeFiltersCount > 0"
                class="px-2 py-0.5 text-xs font-bold text-white bg-purple-600 rounded-full"
              >
                {{ activeFiltersCount }}
              </span>
            </button>
          </div>

          <!-- Sort By - Mobile -->
          <div class="mb-4 lg:hidden">
            <select
              v-model="filterState.sortBy"
              @change="applyFilters"
              class="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          <!-- Loading State -->
          <div
            v-if="loading"
            class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <div
              v-for="n in 12"
              :key="n"
              class="p-4 bg-white rounded-lg shadow-sm animate-pulse"
            >
              <div class="h-48 mb-4 bg-gray-200 rounded"></div>
              <div class="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
              <div class="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>

          <!-- No Results -->
          <div
            v-else-if="products.length === 0"
            class="p-12 text-center bg-white rounded-lg shadow-sm"
          >
            <svg
              class="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 class="mb-2 text-lg font-medium text-gray-900">
              No products found
            </h3>
            <p class="mb-4 text-gray-600">
              Try adjusting your filters or search terms
            </p>
            <button
              @click="clearAllFilters"
              class="px-6 py-2 font-medium text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Clear All Filters
            </button>
          </div>

          <!-- Products Grid -->
          <div v-else>
            <div
              class="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <CardProduct
                v-for="product in products"
                :key="product._id"
                :product="product"
              />
            </div>

            <!-- Pagination -->
            <nav
              v-if="pagination.totalPages > 1"
              class="flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <button
                type="button"
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-3 py-2 text-sm font-bold text-gray-700 transition-all bg-white border border-gray-300 sm:px-4 sm:py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                :aria-label="
                  pagination.page === 1
                    ? 'Previous page (disabled)'
                    : 'Go to previous page'
                "
              >
                <span class="hidden sm:inline">← Previous</span>
                <span class="sm:hidden">←</span>
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                type="button"
                @click="changePage(page)"
                :class="[
                  'px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1',
                  page === pagination.page
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
                ]"
                :aria-label="
                  page === pagination.page
                    ? `Current page ${page}`
                    : `Go to page ${page}`
                "
                :aria-current="page === pagination.page ? 'page' : undefined"
              >
                {{ page }}
              </button>

              <button
                type="button"
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page === pagination.totalPages"
                class="px-3 py-2 text-sm font-bold text-gray-700 transition-all bg-white border border-gray-300 sm:px-4 sm:py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                :aria-label="
                  pagination.page === pagination.totalPages
                    ? 'Next page (disabled)'
                    : 'Go to next page'
                "
              >
                <span class="hidden sm:inline">Next →</span>
                <span class="sm:hidden">→</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import CardProduct from "../components/product/CardProduct.vue";
import FilterSidebarWrapper from "../components/filters/FilterSidebarWrapper.vue";
import FilterDrawerWrapper from "../components/filters/FilterDrawerWrapper.vue";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const products = ref([]);
const availableFilters = ref({});
const showMobileFilters = ref(false);

const pagination = ref({
  page: 1,
  limit: 24,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

const filterState = ref({
  sortBy: "relevance",
  priceRange: { min: null, max: null },
  brands: [],
  categories: [],
  rating: null,
  availability: "all",
});

const searchQuery = ref({
  keyword: route.query.keyword || "",
});

// Computed properties
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filterState.value.priceRange.min || filterState.value.priceRange.max)
    count++;
  if (filterState.value.brands.length > 0) count++;
  if (filterState.value.categories.length > 0) count++;
  if (filterState.value.rating) count++;
  if (filterState.value.availability !== "all") count++;
  return count;
});

const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Methods
const fetchProducts = async () => {
  loading.value = true;

  try {
    const params = {
      keyword: searchQuery.value.keyword,
      sortBy: filterState.value.sortBy,
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (filterState.value.priceRange.min)
      params.minPrice = filterState.value.priceRange.min;
    if (filterState.value.priceRange.max)
      params.maxPrice = filterState.value.priceRange.max;
    if (filterState.value.brands.length > 0)
      params.brand = filterState.value.brands.join(",");
    if (filterState.value.categories.length > 0)
      params.category = filterState.value.categories.join(",");
    if (filterState.value.rating) params.minRating = filterState.value.rating;
    if (filterState.value.availability === "inStock") params.inStock = true;

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/product/search`,
      {
        params,
      }
    );

    if (response.data.success) {
      products.value = response.data.products;
      pagination.value = response.data.pagination;
      availableFilters.value = response.data.filters || {};
    }
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    loading.value = false;
  }
};

const updateFilters = (newFilters) => {
  filterState.value = { ...filterState.value, ...newFilters };
  applyFilters();
};

const applyFilters = () => {
  pagination.value.page = 1;
  fetchProducts();
};

const clearAllFilters = () => {
  filterState.value = {
    sortBy: "relevance",
    priceRange: { min: null, max: null },
    brands: [],
    categories: [],
    rating: null,
    availability: "all",
  };
  applyFilters();
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// Watch route changes
watch(
  () => route.query.keyword,
  (newKeyword) => {
    searchQuery.value.keyword = newKeyword || "";
    clearAllFilters();
  }
);

// Initial load
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
/* Custom scrollbar for filters */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>