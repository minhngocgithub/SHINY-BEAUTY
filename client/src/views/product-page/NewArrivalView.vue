<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <Header />

    <div class="px-4 py-8 mx-auto max-w-7xl">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <BreadCrumb :items="breadcrumbItems" />
      </div>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">✨ New Arrivals</h1>
        <p class="mt-2 text-lg text-gray-600">
          Explore the latest additions to our collection
        </p>
        <p v-if="!loading" class="mt-1 text-sm text-gray-500">
          {{ pagination.total }} new products
        </p>
      </div>

      <div class="flex flex-col gap-6 lg:flex-row">
        <!-- Products Grid -->
        <div class="flex-1 min-w-0">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 class="mb-2 text-lg font-medium text-gray-900">
              No products found
            </h3>
            <p class="mb-4 text-gray-600">
              No new arrivals available at the moment
            </p>
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
import { ref, computed, onMounted } from "vue";
import { getNewProductApi } from "../../service/product.service";
import Header from "../../components/Header.vue";
import BreadCrumb from "../../components/commons/BreadCrumb.vue";
import CardProduct from "../../components/product/CardProduct.vue";

const loading = ref(false);
const products = ref([]);

const pagination = ref({
  page: 1,
  limit: 24,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

// Breadcrumb items
const breadcrumbItems = computed(() => [
  { label: "Home", to: "/" },
  { label: "New Arrivals", to: "/shop/new-arrivals" },
]);

// Computed properties
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
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    const response = await getNewProductApi(params);

    if (response.data.success) {
      products.value = response.data.products;
      pagination.value = response.data.pagination;
    }
  } catch (error) {
    console.error("Fetch new arrivals error:", error);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

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
