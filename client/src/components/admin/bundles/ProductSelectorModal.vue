<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700"
      >
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            Select Products
          </h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ selectedCount }} products selected
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 transition-colors rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
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

      <!-- Search & Filters -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <div
              class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            >
              <svg
                class="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              @input="debounceSearch"
              type="text"
              placeholder="Search products..."
              class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
          <select
            v-model="categoryFilter"
            @change="fetchProducts"
            class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Product List -->
      <div class="p-4">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div
            class="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
          ></div>
        </div>

        <div v-else-if="products.length === 0" class="py-12 text-center">
          <svg
            class="w-16 h-16 mx-auto text-slate-400"
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
          <p class="mt-4 text-slate-600 dark:text-slate-400">
            No products found
          </p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="product in products"
            :key="product._id"
            @click="toggleProduct(product)"
            :class="[
              'flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all',
              isSelected(product._id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700',
            ]"
          >
            <input
              type="checkbox"
              :checked="isSelected(product._id)"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              @click.stop
            />
            <img
              :src="getProductImage(product)"
              :alt="product.name"
              class="object-cover w-16 h-16 border rounded-lg border-slate-200 dark:border-slate-600"
            />
            <div class="flex-1">
              <p
                class="font-semibold text-slate-900 dark:text-white line-clamp-1"
              >
                {{ product.name }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="text-sm font-semibold text-blue-600 dark:text-blue-400"
                >
                  ${{ product.price }}
                </span>
                <span
                  v-if="product.stock > 0"
                  class="text-xs text-slate-500 dark:text-slate-400"
                >
                  {{ product.stock }} in stock
                </span>
                <span
                  v-else
                  class="text-xs font-semibold text-red-600 dark:text-red-400"
                >
                  Out of stock
                </span>
              </div>
            </div>
            <span
              v-if="product.category"
              class="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
            >
              {{ product.category.name }}
            </span>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 mt-6"
        >
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm font-medium transition-colors border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Previous
          </button>
          <span class="text-sm text-slate-600 dark:text-slate-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm font-medium transition-colors border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-700"
      >
        <div class="text-sm text-slate-600 dark:text-slate-400">
          {{ selectedCount }} product{{
            selectedCount !== 1 ? "s" : ""
          }}
          selected
        </div>
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            type="button"
            class="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmSelection"
            :disabled="selectedCount === 0"
            class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Selected Products
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getAllProductsApi } from "../../../service/product.service";
import { getAllCategoriesApi } from "../../../service/product.service";

const props = defineProps({
  selectedProducts: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "select"]);

const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const categoryFilter = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const limit = ref(20);

const localSelectedIds = ref([...props.selectedProducts]);
const searchTimeout = ref(null);

const selectedCount = computed(() => localSelectedIds.value.length);

const isSelected = (productId) => {
  return localSelectedIds.value.includes(productId);
};

const toggleProduct = (product) => {
  const index = localSelectedIds.value.indexOf(product._id);
  if (index > -1) {
    localSelectedIds.value.splice(index, 1);
  } else {
    localSelectedIds.value.push(product._id);
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 500);
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchProducts();
  }
};

const fetchProducts = async () => {
  try {
    loading.value = true;

    const params = {
      page: currentPage.value,
      limit: limit.value,
      sort: "name",
    };

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    if (categoryFilter.value) {
      params.category = categoryFilter.value;
    }

    const response = await getAllProductsApi(params);

    if (response.data.success) {
      products.value = response.data.products || [];
      const pagination = response.data.pagination || {};
      totalPages.value = pagination.totalPages || 1;
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await getAllCategoriesApi();
    if (response.data.success) {
      categories.value = response.data.categories || [];
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
};

const getProductImage = (product) => {
  if (!product) return "/placeholder.png";
  if (Array.isArray(product.image) && product.image.length > 0) {
    return product.image[0].url || product.image[0];
  }
  if (product.image?.url) return product.image.url;
  if (typeof product.image === "string") return product.image;
  return "/placeholder.png";
};

const confirmSelection = () => {
  const selectedProductObjects = products.value.filter((p) =>
    localSelectedIds.value.includes(p._id)
  );
  emit("select", selectedProductObjects);
};

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCategories()]);
});
</script>
