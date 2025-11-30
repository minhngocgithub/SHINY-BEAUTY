<template>
  <section class="w-full min-h-screen bg-white">
    <Header />

    <!-- Breadcrumb Section -->
    <nav
      class="w-full border-b border-gray-200 bg-gray-50"
      aria-label="Breadcrumb"
    >
      <div class="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </nav>

    <div class="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Category Header -->
      <header v-if="categoryInfo" class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-1 h-8 bg-gray-900 rounded-full"></div>
          <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
            {{ categoryInfo.name }}
          </h1>
        </div>
        <p
          v-if="categoryInfo.seoDescription"
          class="max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base"
        >
          {{ categoryInfo.seoDescription }}
        </p>

        <!-- Root Category with Children (show tabs) -->
        <nav
          v-if="filteredChildren.length > 0 && !categoryInfo.parent"
          class="mt-5"
          aria-label="Subcategories"
        >
          <div class="flex gap-2 pb-3 overflow-x-auto custom-scrollbar-x">
            <!-- "All" Button -->
            <button
              type="button"
              @click="selectSubcategory(null)"
              :class="[
                'flex-shrink-0 px-5 py-2.5 text-sm font-semibold transition-all rounded-lg whitespace-nowrap',
                selectedSubcategory === null
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50',
              ]"
              :aria-pressed="selectedSubcategory === null"
            >
              <span class="flex items-center gap-2">
                <svg
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                  />
                </svg>
                All {{ categoryInfo.name }}
              </span>
            </button>

            <!-- Child Categories -->
            <button
              v-for="child in filteredChildren"
              :key="child._id"
              type="button"
              @click="selectSubcategory(child.slug)"
              :class="[
                'flex-shrink-0 px-5 py-2.5 text-sm font-semibold transition-all rounded-lg whitespace-nowrap',
                selectedSubcategory === child.slug
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50',
              ]"
              :aria-pressed="selectedSubcategory === child.slug"
            >
              {{ child.name }}
            </button>
          </div>
        </nav>
      </header>

      <!-- Loading State -->
      <div
        v-if="
          (loading && !categoryProducts.length && !isBundleCategory) ||
          (isBundleCategory && bundlesLoading && bundles.length === 0)
        "
        class="flex items-center justify-center py-20"
      >
        <Loading />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error && !isBundleCategory"
        class="py-12 text-center"
        role="alert"
      >
        <div
          class="max-w-md p-8 mx-auto bg-white border-2 border-red-200 shadow-lg rounded-xl"
        >
          <div
            class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50"
          >
            <svg
              class="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p class="mb-6 text-base font-semibold text-red-600">{{ error }}</p>
          <button
            @click="fetchProducts"
            type="button"
            class="px-6 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Mobile Filter Button -->
      <div class="fixed z-30 lg:hidden bottom-6 right-6">
        <button
          type="button"
          @click="showMobileFilters = true"
          class="flex items-center gap-2 px-6 py-4 text-white transition-all bg-gray-900 rounded-full shadow-2xl hover:bg-gray-800 hover:shadow-gray-900/50 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          aria-label="Open filters"
        >
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-bold">Filters</span>
          <span
            v-if="activeFiltersCount > 0"
            class="px-2.5 py-0.5 text-xs font-bold bg-white rounded-full text-gray-900"
          >
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>

      <!-- Mobile Filter Drawer -->
      <FilterDrawer
        :is-open="showMobileFilters"
        :brand-counts="brandCounts"
        :result-count="pagination.total"
        @close="showMobileFilters = false"
        @apply="applyFiltersFromDrawer"
      />

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <!-- Desktop Sidebar Filters -->
        <aside class="hidden lg:block lg:col-span-3">
          <div class="sticky top-4">
            <FilterSidebar
              :brand-counts="brandCounts"
              @apply="applyFiltersFromSidebar"
            />
          </div>
        </aside>

        <!-- Main Content -->
        <main class="lg:col-span-9">
          <!-- Active Filters Display -->
          <div
            v-if="activeFiltersCount > 0"
            class="flex flex-wrap items-center gap-3 p-4 mb-5 border border-gray-200 rounded-lg bg-gray-50"
            role="region"
            aria-label="Active filters"
          >
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 text-gray-700"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-xs font-bold text-gray-900">
                Active Filters ({{ activeFiltersCount }})
              </span>
            </div>
            <div class="flex flex-wrap flex-1 gap-2">
              <button
                v-for="(filter, index) in activeFilters"
                :key="index"
                type="button"
                @click="removeFilter(filter)"
                class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                :aria-label="`Remove ${filter.label} filter`"
              >
                {{ filter.label }}
                <svg
                  class="w-3.5 h-3.5"
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
            <button
              type="button"
              @click="clearAllFilters"
              class="px-4 py-1.5 text-xs font-bold text-gray-600 transition-all border-2 border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          </div>

          <!-- Toolbar -->
          <div
            class="flex flex-col items-start justify-between gap-3 p-4 mb-5 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center"
          >
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-600">
                <span class="text-lg font-bold text-gray-900 sm:text-xl">{{
                  isBundleCategory
                    ? bundlesPagination.totalBundles || bundles.length
                    : pagination.total
                }}</span>
                <span class="ml-1">{{
                  isBundleCategory
                    ? bundlesPagination.totalBundles === 1 ||
                      bundles.length === 1
                      ? "bundle"
                      : "bundles"
                    : pagination.total === 1
                    ? "product"
                    : "products"
                }}</span>
              </div>
              <span
                v-if="filterLoading"
                class="flex items-center gap-2 px-2.5 py-1 text-xs font-bold rounded-md text-gray-700 bg-gray-100 animate-pulse"
                role="status"
                aria-live="polite"
              >
                <svg
                  class="w-3 h-3 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Filtering...
              </span>
            </div>

            <div class="flex items-center gap-3">
              <label
                for="sort-select"
                class="text-xs font-semibold text-gray-700"
                >Sort by:</label
              >
              <select
                id="sort-select"
                v-model="appliedFilters.sort"
                @change="applyFilters"
                class="px-3 py-2 text-sm font-medium transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-gray-400 focus:border-gray-400 hover:border-gray-400"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="best-selling">Best Selling</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          <!-- Render bundles or products in same grid layout -->
          <div>
            <!-- Loading State -->
            <div
              v-if="
                (loading && initialLoad) ||
                (isBundleCategory && bundlesLoading && initialLoad)
              "
              class="grid grid-cols-2 gap-4 mb-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <SkeletonProductCard v-for="n in 12" :key="n" />
            </div>

            <!-- Bundle Products Grid -->
            <div
              v-else-if="isBundleCategory && bundles.length > 0"
              class="grid grid-cols-2 gap-4 mb-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <BundleCard
                v-for="bundle in bundles"
                :key="bundle._id"
                :bundle="bundle"
                @add-to-cart="handleBundleAddToCart"
                @view-details="handleBundleViewDetails"
              />
            </div>

            <!-- Regular Products Grid -->
            <div
              v-else-if="!isBundleCategory && categoryProducts.length > 0"
              class="grid grid-cols-2 gap-4 mb-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <CardProduct
                v-for="product in categoryProducts"
                :key="product._id"
                :product="product"
                width="w-full"
                @add-to-cart="handleAddToCart"
                @add-to-wishlist="handleAddToWishlist"
              />
            </div>

            <!-- Error State for Bundles -->
            <div
              v-else-if="isBundleCategory && bundlesError"
              class="py-16 text-center"
            >
              <div class="max-w-md mx-auto">
                <div
                  class="flex items-center justify-center w-20 h-20 mx-auto mb-5 bg-red-100 rounded-full"
                >
                  <svg
                    class="w-10 h-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 class="mb-2 text-xl font-bold text-gray-900">
                  Failed to load bundles
                </h3>
                <p class="mb-6 text-sm text-gray-600">{{ bundlesError }}</p>
                <button
                  type="button"
                  @click="fetchProducts"
                  class="px-8 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="
                (isBundleCategory && bundles.length === 0 && !bundlesLoading) ||
                (!isBundleCategory && categoryProducts.length === 0)
              "
              class="py-16 text-center"
            >
              <div class="max-w-md mx-auto">
                <div
                  class="flex items-center justify-center w-20 h-20 mx-auto mb-5 bg-gray-100 rounded-full"
                >
                  <svg
                    class="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 class="mb-2 text-xl font-bold text-gray-900">
                  {{
                    isBundleCategory ? "No bundles found" : "No products found"
                  }}
                </h3>
                <p class="mb-6 text-sm text-gray-600">
                  Try adjusting your filters or search criteria to find what
                  you're looking for
                </p>
                <button
                  type="button"
                  @click="clearAllFilters"
                  class="px-8 py-2.5 text-sm font-semibold text-white transition-all rounded-lg bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <nav
            v-if="currentPagination.totalPages > 1"
            class="flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <button
              type="button"
              @click="changePage(currentPagination.page - 1)"
              :disabled="currentPagination.page === 1"
              class="px-3 py-2 text-sm font-bold text-gray-700 transition-all bg-white border border-gray-300 sm:px-4 sm:py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              :aria-label="
                currentPagination.page === 1
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
                page === currentPagination.page
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
              ]"
              :aria-label="
                page === currentPagination.page
                  ? `Current page ${page}`
                  : `Go to page ${page}`
              "
              :aria-current="
                page === currentPagination.page ? 'page' : undefined
              "
            >
              {{ page }}
            </button>

            <button
              type="button"
              @click="changePage(currentPagination.page + 1)"
              :disabled="
                currentPagination.page === currentPagination.totalPages
              "
              class="px-3 py-2 text-sm font-bold text-gray-700 transition-all bg-white border border-gray-300 sm:px-4 sm:py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              :aria-label="
                currentPagination.page === currentPagination.totalPages
                  ? 'Next page (disabled)'
                  : 'Go to next page'
              "
            >
              <span class="hidden sm:inline">Next →</span>
              <span class="sm:hidden">→</span>
            </button>
          </nav>
        </main>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useProductStore } from "../../store/product.store";
import { useFilterStore } from "../../store/filter.store";
import { useSaleProgramStore } from "../../store/saleProgram.store"; // ✅ ADDED
import { showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import { debounce } from "../../utils/debounce";
import Header from "../../components/Header.vue";
import Breadcrumb from "../../components/commons/BreadCrumb.vue";
import Loading from "../../components/Loading.vue";
import CardProduct from "../../components/product/CardProduct.vue";
import SkeletonProductCard from "../../components/category/SkeletonProductCard.vue";
import FilterSidebar from "../../components/filters/FilterSidebar.vue";
import FilterDrawer from "../../components/filters/FilterDrawer.vue";
import BundleCard from "../../components/product/BundleCard.vue";
import { getAllBundlesApi } from "../../service/bundle.service";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const filterStore = useFilterStore();
const saleProgramStore = useSaleProgramStore();

const {
  categoryProducts,
  categoryInfo,
  availableFilters,
  pagination,
  loading,
  error,
} = storeToRefs(productStore);

const filterLoading = ref(false);
const initialLoad = ref(true);
const selectedSubcategory = ref(null);
const bundles = ref([]);
const bundlesLoading = ref(false);
const bundlesError = ref(null);
const bundlesPagination = ref({
  page: 1,
  limit: 24,
  totalPages: 1,
  totalBundles: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

// Compute category slug from multi-level route params
const categorySlug = computed(() => {
  const { level1, level2, level3 } = route.params;

  if (level3) {
    return `${level1}/${level2}/${level3}`;
  } else if (level2) {
    return `${level1}/${level2}`;
  } else if (level1) {
    return level1;
  }

  return "";
});

const showMobileFilters = ref(false);
const isFetching = ref(false);

// Filter out children with names starting with "All "
const filteredChildren = computed(() => {
  if (!categoryInfo.value?.children) return [];
  return categoryInfo.value.children.filter(
    (child) => !child.name.startsWith("All ")
  );
});

// Detect if current category should show bundles instead of products.
// Check slug and display name for common bundle keywords to be robust.
const isBundleCategory = computed(() => {
  const slug = (
    categoryInfo.value?.slug ||
    categorySlug.value ||
    ""
  ).toLowerCase();
  const name = (categoryInfo.value?.name || "").toLowerCase();
  const keywords = [
    "bundle",
    "bundles",
    "bundle-sets",
    "value pack",
    "value-pack",
    "value-packs",
    "value packs",
    "bundle sets",
  ];

  for (const k of keywords) {
    if (slug.includes(k) || name.includes(k)) return true;
  }

  return false;
});

const breadcrumbItems = computed(() => {
  if (!categoryInfo.value) return [{ label: "Home", to: "/" }];
  const items = [{ label: "Home", to: "/" }];
  if (
    categoryInfo.value.breadcrumb &&
    categoryInfo.value.breadcrumb.length > 0
  ) {
    categoryInfo.value.breadcrumb.forEach((cat) => {
      items.push({
        label: cat.name,
        to: `/shop/${cat.slug}`,
      });
    });
  }

  return items;
});

const appliedFilters = ref({
  brand: [],
  priceMin: null,
  priceMax: null,
  rating: null,
  inStock: false,
  onSale: false,
  sort: "featured",
  page: 1,
  limit: 24,
});

// Brand counts for filter components
const brandCounts = computed(() => {
  const counts = {};
  if (availableFilters.value?.brands) {
    availableFilters.value.brands.forEach((brand) => {
      counts[brand.name] = brand.count || 0;
    });
  }
  return counts;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (appliedFilters.value.brand.length > 0)
    count += appliedFilters.value.brand.length;
  if (appliedFilters.value.priceMin || appliedFilters.value.priceMax) count++;
  if (appliedFilters.value.rating) count++;
  if (appliedFilters.value.inStock) count++;
  if (appliedFilters.value.onSale) count++;
  return count;
});

const activeFilters = computed(() => {
  const filters = [];

  if (appliedFilters.value.brand.length > 0) {
    appliedFilters.value.brand.forEach((brand) => {
      filters.push({
        type: "brand",
        label: brand,
        value: brand,
      });
    });
  }

  if (appliedFilters.value.priceMin || appliedFilters.value.priceMax) {
    const min = appliedFilters.value.priceMin || 0;
    const max = appliedFilters.value.priceMax || "∞";
    filters.push({
      type: "price",
      label: `$${min} - $${max}`,
      value: "price",
    });
  }

  if (appliedFilters.value.rating) {
    filters.push({
      type: "rating",
      label: `${appliedFilters.value.rating}★ & up`,
      value: appliedFilters.value.rating,
    });
  }

  if (appliedFilters.value.inStock) {
    filters.push({
      type: "inStock",
      label: "In Stock",
      value: true,
    });
  }

  if (appliedFilters.value.onSale) {
    filters.push({
      type: "onSale",
      label: "On Sale",
      value: true,
    });
  }

  return filters;
});

const syncWithFilterStore = () => {
  if (availableFilters.value) {
    if (availableFilters.value.brands) {
      filterStore.availableBrands = availableFilters.value.brands.map(
        (b) => b.name
      );
    }

    // Set price range limits
    if (availableFilters.value.priceRange) {
      filterStore.priceRangeLimits = {
        min: availableFilters.value.priceRange.min,
        max: availableFilters.value.priceRange.max,
      };
    }
  }

  // Sync applied filters to filter store
  filterStore.selectedBrands = appliedFilters.value.brand;
  filterStore.priceRange = {
    min: appliedFilters.value.priceMin || filterStore.priceRangeLimits.min,
    max: appliedFilters.value.priceMax || filterStore.priceRangeLimits.max,
  };
  filterStore.minRating = appliedFilters.value.rating || 0;
  filterStore.inStock = appliedFilters.value.inStock;
};

const fetchSalePrograms = async () => {
  try {
    await saleProgramStore.fetchActivePrograms();
  } catch (error) {
    console.error("CategoryProductsView: Error fetching sale programs:", error);
  }
};

// Build bundle API params from applied filters
const buildBundleFilters = () => {
  const params = {
    limit: appliedFilters.value.limit || 24,
    page: appliedFilters.value.page || 1,
  };

  // Map sort options from product sort to bundle sort
  const sortMap = {
    featured: "-featured",
    "best-selling": "-sold",
    "price-asc": "bundlePrice",
    "price-desc": "-bundlePrice",
    newest: "-createdAt",
    "rating-desc": "-rating",
    "name-asc": "name",
  };

  if (appliedFilters.value.sort) {
    const bundleSort = sortMap[appliedFilters.value.sort] || "-createdAt";
    params.sort = bundleSort;
  }

  // Brand filter - bundle API only supports single brand (RegExp match)
  // We'll use the first selected brand
  if (appliedFilters.value.brand && appliedFilters.value.brand.length > 0) {
    params.brand = appliedFilters.value.brand[0];
  }

  // Price filter
  if (appliedFilters.value.priceMin) {
    params.minPrice = appliedFilters.value.priceMin;
  }
  if (appliedFilters.value.priceMax) {
    params.maxPrice = appliedFilters.value.priceMax;
  }

  // Featured filter (if onSale is selected, might want featured bundles)
  if (appliedFilters.value.onSale) {
    params.featured = "true";
  }

  return params;
};

const fetchProducts = async () => {
  const slug = categorySlug.value;
  console.debug("CategoryProductsView.fetchProducts start", {
    slug,
    categoryInfo: categoryInfo.value,
    isBundle: isBundleCategory.value,
  });

  // Prevent re-entrant calls that can cause recursive updates
  if (isFetching.value) {
    console.warn(
      "CategoryProductsView.fetchProducts: re-entrant call detected — skipping"
    );
    return;
  }
  isFetching.value = true;
  // If this category is the Bundles category, skip fetching regular products
  // and let the `ValuesSet` component handle fetching bundles.
  if (isBundleCategory.value) {
    // clear product list so UI doesn't show stale data
    categoryProducts.value = [];

    // fetch bundles for this category with filters
    try {
      bundlesLoading.value = true;
      bundlesError.value = null;

      // Reset bundles pagination when fetching
      bundlesPagination.value.page = appliedFilters.value.page || 1;

      // Build bundle API params with applied filters
      const bundleParams = buildBundleFilters();
      console.log("🔍 Fetching bundles with filters:", bundleParams);

      const resp = await getAllBundlesApi(bundleParams);
      console.log("📦 Bundle API response:", resp);
      console.log("📦 Bundle API response.data:", resp?.data);

      if (resp?.data) {
        const data = resp.data;

        // Primary format: { success: true, bundles: [...], pagination: {...} }
        if (data.success === true && Array.isArray(data.bundles)) {
          bundles.value = data.bundles;

          // Update pagination info from API response
          if (data.pagination) {
            bundlesPagination.value = {
              page: data.pagination.page || bundlesPagination.value.page,
              limit: data.pagination.limit || bundlesPagination.value.limit,
              totalPages: data.pagination.totalPages || 1,
              totalBundles:
                data.pagination.totalBundles || bundles.value.length,
              hasNextPage: data.pagination.hasNextPage || false,
              hasPrevPage: data.pagination.hasPrevPage || false,
            };
          }

          console.log("✅ Bundles loaded successfully:", {
            count: bundles.value.length,
            pagination: bundlesPagination.value,
            bundles: bundles.value.slice(0, 2),
          });
        }
        // Fallback: bundles array present without success flag
        else if (Array.isArray(data.bundles)) {
          bundles.value = data.bundles;
          console.log("⚠️ Bundles loaded (no success flag):", {
            count: bundles.value.length,
          });
        }
        // Fallback: nested data structure
        else if (data.data && Array.isArray(data.data.bundles)) {
          bundles.value = data.data.bundles;
          console.log("⚠️ Bundles loaded (nested format):", {
            count: bundles.value.length,
          });
        }
        // Fallback: direct array response
        else if (Array.isArray(data)) {
          bundles.value = data;
          console.log("⚠️ Bundles loaded (direct array):", {
            count: bundles.value.length,
          });
        }
        // No bundles found
        else {
          bundles.value = [];
          const errorMsg = data.message || "No bundles returned from API";
          bundlesError.value = errorMsg;
          console.warn(
            "❌ No bundles found in API response. Response structure:",
            {
              hasSuccess: "success" in data,
              success: data.success,
              hasBundles: "bundles" in data,
              bundlesType: typeof data.bundles,
              isBundlesArray: Array.isArray(data.bundles),
              dataKeys: Object.keys(data),
              fullData: data,
            }
          );
        }
      } else {
        bundles.value = [];
        bundlesError.value = "No response from bundle API";
        console.error("❌ No response.data from bundle API. Response:", resp);
      }
    } catch (err) {
      console.error("❌ Failed to fetch bundles from category view:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response,
        responseData: err.response?.data,
      });
      bundles.value = [];
      bundlesError.value =
        err.response?.data?.message || err.message || "Failed to load bundles";
    } finally {
      bundlesLoading.value = false;
      // CRITICAL: Also set filterLoading to false to stop "filtering..." indicator
      filterLoading.value = false;
      isFetching.value = false;
      console.log("📦 Bundle fetch completed:", {
        bundlesCount: bundles.value.length,
        loading: bundlesLoading.value,
        filterLoading: filterLoading.value,
        error: bundlesError.value,
      });
    }

    return;
  }

  const filters = {
    page: appliedFilters.value.page,
    limit: appliedFilters.value.limit,
    sort: appliedFilters.value.sort,
  };

  if (appliedFilters.value.brand.length > 0) {
    filters.brand = appliedFilters.value.brand.join(",");
  }

  if (appliedFilters.value.priceMin) {
    filters.priceMin = appliedFilters.value.priceMin;
  }

  if (appliedFilters.value.priceMax) {
    filters.priceMax = appliedFilters.value.priceMax;
  }

  if (appliedFilters.value.rating && appliedFilters.value.rating > 0) {
    filters.rating = appliedFilters.value.rating;
  }

  if (appliedFilters.value.inStock) {
    filters.inStock = "true";
  }

  if (appliedFilters.value.onSale) {
    filters.onSale = "true";
  }

  console.log("🔍 Fetching products with filters:", {
    slug,
    filters,
    appliedFilters: appliedFilters.value,
  });

  updateURLParams(filters);

  try {
    await productStore.fetchProductsByCategory(slug, filters);
  } finally {
    // Ensure the fetch flag is cleared even if product store call errors
    isFetching.value = false;
  }
  if (initialLoad.value) {
    initialLoad.value = false;
  }
};

// Update URL query parameters
const updateURLParams = (filters) => {
  const query = {};

  if (filters.brand) query.brand = filters.brand;
  if (filters.priceMin) query.priceMin = filters.priceMin;
  if (filters.priceMax) query.priceMax = filters.priceMax;
  if (filters.rating) query.rating = filters.rating;
  if (filters.inStock) query.inStock = filters.inStock;
  if (filters.onSale) query.onSale = filters.onSale;
  if (filters.sort && filters.sort !== "featured") query.sort = filters.sort;
  if (filters.page && filters.page !== 1) query.page = filters.page;

  // Only replace the router query if it actually differs to avoid triggering
  // needless route updates which can cause reactive loops.
  try {
    const currentQuery = route.query || {};
    const newQuery = Object.keys(query).length === 0 ? {} : query;
    const same = JSON.stringify(currentQuery) === JSON.stringify(newQuery);
    if (!same) {
      router.replace({ query: newQuery });
    }
  } catch (e) {
    console.warn("Failed to compare/replace router query:", e);
    router.replace({ query });
  }
};

// Load filters from URL on mount
const loadFiltersFromURL = () => {
  const query = route.query;

  if (query.brand) {
    appliedFilters.value.brand = query.brand.split(",");
  }
  if (query.priceMin) {
    appliedFilters.value.priceMin = Number(query.priceMin);
  }
  if (query.priceMax) {
    appliedFilters.value.priceMax = Number(query.priceMax);
  }
  if (query.rating) {
    appliedFilters.value.rating = Number(query.rating);
  }
  if (query.inStock) {
    appliedFilters.value.inStock = query.inStock === "true";
  }
  if (query.onSale) {
    appliedFilters.value.onSale = query.onSale === "true";
  }
  if (query.sort) {
    appliedFilters.value.sort = query.sort;
  }
  if (query.page) {
    appliedFilters.value.page = Number(query.page);
  }
};

// Fetch available filters
const fetchFilters = async () => {
  const slug = categorySlug.value;
  await productStore.fetchCategoryFilters(slug);
  syncWithFilterStore();
};

// Apply filters with loading state
const applyFilters = async () => {
  filterLoading.value = true;
  appliedFilters.value.page = 1;
  try {
    await fetchProducts();
  } catch (error) {
    console.error("Error applying filters:", error);
  } finally {
    // Ensure filterLoading is always reset, even if fetchProducts fails or is bundle category
    // (bundle category already resets it, but this is a safety net)
    filterLoading.value = false;
  }
};

// Apply filters from sidebar
const applyFiltersFromSidebar = () => {
  console.log("📊 Filter store values:", {
    selectedBrands: filterStore.selectedBrands,
    priceRange: filterStore.priceRange,
    minRating: filterStore.minRating,
    inStock: filterStore.inStock,
  });

  // Get values from filter store
  appliedFilters.value.brand = [...filterStore.selectedBrands];
  appliedFilters.value.priceMin =
    filterStore.priceRange.min !== filterStore.priceRangeLimits.min
      ? filterStore.priceRange.min
      : null;
  appliedFilters.value.priceMax =
    filterStore.priceRange.max !== filterStore.priceRangeLimits.max
      ? filterStore.priceRange.max
      : null;
  appliedFilters.value.rating = filterStore.minRating || null;
  appliedFilters.value.inStock = filterStore.inStock;

  console.log("✅ Applied filters:", appliedFilters.value);

  applyFilters();
};

// Apply filters from drawer
const applyFiltersFromDrawer = () => {
  applyFiltersFromSidebar();
};

const debouncedPriceFilter = debounce(() => {
  applyFilters();
}, 800);

watch(
  () => [appliedFilters.value.priceMin, appliedFilters.value.priceMax],
  () => {
    if (!initialLoad.value) {
      debouncedPriceFilter();
    }
  }
);

// Select subcategory filter
const selectSubcategory = (subcategorySlug) => {
  selectedSubcategory.value = subcategorySlug;
  if (subcategorySlug) {
    // Navigate to subcategory page
    router.push(`/shop/${subcategorySlug}`);
  } else {
    // Stay on current category, clear subcategory filters
    clearAllFilters();
  }
};

// Clear all filters
const clearAllFilters = () => {
  appliedFilters.value = {
    brand: [],
    priceMin: null,
    priceMax: null,
    rating: null,
    inStock: false,
    onSale: false,
    sort: "featured",
    page: 1,
    limit: 24,
  };
  selectedSubcategory.value = null;
  filterStore.resetFilters();

  // Reset bundles pagination if bundle category
  if (isBundleCategory.value) {
    bundlesPagination.value = {
      page: 1,
      limit: 24,
      totalPages: 1,
      totalBundles: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  router.replace({ query: {} });
  fetchProducts();
};

// Remove individual filter
const removeFilter = (filter) => {
  if (filter.type === "brand") {
    const index = appliedFilters.value.brand.indexOf(filter.value);
    if (index > -1) {
      appliedFilters.value.brand.splice(index, 1);
    }
  } else if (filter.type === "price") {
    appliedFilters.value.priceMin = null;
    appliedFilters.value.priceMax = null;
  } else if (filter.type === "rating") {
    appliedFilters.value.rating = null;
  } else if (filter.type === "inStock") {
    appliedFilters.value.inStock = false;
  } else if (filter.type === "onSale") {
    appliedFilters.value.onSale = false;
  }

  syncWithFilterStore();
  applyFilters();
};

const changePage = (page) => {
  const maxPages = isBundleCategory.value
    ? bundlesPagination.value.totalPages
    : pagination.value.totalPages;

  if (page < 1 || page > maxPages) return;
  appliedFilters.value.page = page;
  fetchProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Computed pagination that switches between products and bundles
const currentPagination = computed(() => {
  if (isBundleCategory.value) {
    return {
      page: bundlesPagination.value.page,
      totalPages: bundlesPagination.value.totalPages,
      total: bundlesPagination.value.totalBundles,
    };
  }
  return pagination.value;
});

const visiblePages = computed(() => {
  const total = currentPagination.value.totalPages;
  const current = currentPagination.value.page;
  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }

  return pages.filter((p) => p !== "...");
});

const handleAddToCart = (data) => {
  if (data.success) {
    showSuccessAlert(data.message || "Product added to cart successfully!");
  } else {
    showErrorAlert(data.error || "Failed to add product to cart");
  }
};

// Handle add to wishlist from CardProduct
const handleAddToWishlist = (data) => {
  if (data.success) {
    const action = data.action === "added" ? "added to" : "removed from";
    showSuccessAlert(`Product ${action} wishlist successfully!`);
  } else {
    showErrorAlert(data.error || "Failed to update wishlist");
  }
};

// Handle bundle add to cart
const handleBundleAddToCart = async (bundle) => {
  try {
    // Import cart store to add bundle to cart
    const { useCartStore } = await import("../../store/cart.store");
    const cartStore = useCartStore();

    await cartStore.addToCart({ bundle, quantity: 1 });
    showSuccessAlert(
      "Added to Cart!",
      `${bundle.name} has been added to your cart`
    );
  } catch (err) {
    console.error("Failed to add bundle to cart:", err);
    showErrorAlert("Error", "Failed to add bundle to cart");
  }
};

// Handle bundle view details
const handleBundleViewDetails = (bundle) => {
  router.push(`/bundle/${bundle._id}`);
};

// ✅ UPDATED: Watch for category changes and reload sale programs
watch(
  () => categorySlug.value,
  async (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      // Reset filters when changing category
      initialLoad.value = true;
      selectedSubcategory.value = null;
      clearAllFilters();

      // ✅ Reload sale programs when category changes
      await fetchSalePrograms();
      await fetchFilters();
    }
  }
);

// Watch for available filters changes to sync with filter store
watch(
  () => availableFilters.value,
  () => {
    syncWithFilterStore();
  },
  { deep: true }
);

// Update SEO meta tags and fetch bundles if bundle category
watch(
  () => categoryInfo.value,
  async (newCategory, oldCategory) => {
    if (newCategory) {
      document.title = `${
        newCategory.seoTitle || newCategory.name
      } - SHINY BEAUTY`;
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          newCategory.seoDescription ||
            `Browse ${newCategory.name} products at SHINY BEAUTY`
        );
      }
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords && newCategory.seoKeywords) {
        metaKeywords.setAttribute(
          "content",
          newCategory.seoKeywords.join(", ")
        );
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute(
          "content",
          newCategory.seoTitle || newCategory.name
        );
      }

      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (ogDescription) {
        ogDescription.setAttribute(
          "content",
          newCategory.seoDescription || `Browse ${newCategory.name} products`
        );
      }

      // If category info changed and this is a bundle category, fetch bundles
      if (newCategory !== oldCategory && isBundleCategory.value) {
        console.log(
          "🔄 Category info loaded, fetching bundles for bundle category:",
          newCategory.name
        );
        await fetchProducts();
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchSalePrograms();
  loadFiltersFromURL();
  await fetchFilters();
  await fetchProducts();
});
</script>

<style scoped>
.custom-scrollbar-x {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.custom-scrollbar-x::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar-x::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 3px;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
  transition: background 0.2s;
}

.custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>