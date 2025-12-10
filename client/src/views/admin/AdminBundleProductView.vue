<template>
  <div class="h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            Bundle Products Management
          </h1>
          <p class="mt-1 text-slate-600 dark:text-slate-400">
            Manage product bundles and package deals
          </p>
        </div>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Bundle
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div
      class="p-6 mb-6 bg-white border shadow-lg dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Filter & Search
          </h3>
          <span
            v-if="activeFilterCount > 0"
            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white"
          >
            {{ activeFilterCount }} Active
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="activeFilterCount > 0"
            @click="resetFilters"
            class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- Main Filters -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <!-- Search -->
        <div class="relative md:col-span-2">
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
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="Search bundles..."
            class="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <!-- Status Filter -->
        <div class="relative">
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Sort -->
      <div class="grid items-end grid-cols-1 gap-4 mt-4 md:grid-cols-2">
        <div>
          <label
            class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
            >Sort By</label
          >
          <select
            v-model="filters.sortField"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="updatedAt">Date Updated</option>
            <option value="name">Name</option>
            <option value="bundlePrice">Price</option>
            <option value="sold">Sales</option>
            <option value="views">Views</option>
          </select>
        </div>
        <div>
          <label
            class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
            >Order</label
          >
          <select
            v-model="filters.sortOrder"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loading />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-4 mb-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
    >
      <p class="text-red-800 dark:text-red-200">{{ error }}</p>
    </div>

    <!-- Bundles Table -->
    <div
      v-else
      class="overflow-hidden bg-white rounded-lg shadow dark:bg-slate-800"
    >
      <table class="w-full">
        <thead class="bg-slate-100 dark:bg-slate-700">
          <tr>
            <th
              class="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300"
            >
              Bundle Info
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300"
            >
              Products
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300"
            >
              Pricing
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-700 dark:text-slate-300"
            >
              Status
            </th>
            <th
              class="px-6 py-3 text-xs font-semibold tracking-wider text-center uppercase text-slate-700 dark:text-slate-300"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr
            v-for="bundle in bundles"
            :key="bundle._id"
            class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <!-- Bundle Info -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  :src="getBundleImage(bundle)"
                  :alt="bundle.name"
                  class="object-cover w-16 h-16 border rounded-lg border-slate-200 dark:border-slate-600"
                />
                <div>
                  <p
                    class="font-semibold text-slate-900 dark:text-white line-clamp-1"
                  >
                    {{ bundle.name }}
                  </p>
                  <p
                    class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2"
                  >
                    {{ bundle.description || "No description" }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Products -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {{ bundle.items?.length || 0 }} Products
                </span>
                <div class="flex -space-x-2">
                  <div
                    v-for="(item, idx) in bundle.items?.slice(0, 3)"
                    :key="idx"
                    class="w-8 h-8 border-2 border-white rounded-full dark:border-slate-800"
                  >
                    <img
                      :src="getProductImage(item.product)"
                      class="w-full h-full rounded-full"
                    />
                  </div>
                  <div
                    v-if="bundle.items?.length > 3"
                    class="flex items-center justify-center w-8 h-8 text-xs font-semibold border-2 border-white rounded-full bg-slate-200 text-slate-700 dark:border-slate-800 dark:bg-slate-600 dark:text-slate-300"
                  >
                    +{{ bundle.items.length - 3 }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Pricing -->
            <td class="px-6 py-4">
              <div class="space-y-1">
                <div class="flex items-baseline gap-2">
                  <span
                    class="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    ${{ bundle.bundlePrice?.toFixed(2) }}
                  </span>
                  <span
                    v-if="bundle.originalPrice > bundle.bundlePrice"
                    class="text-sm line-through text-slate-500 dark:text-slate-400"
                  >
                    ${{ bundle.originalPrice?.toFixed(2) }}
                  </span>
                </div>
                <div
                  v-if="bundle.discountPercentage > 0"
                  class="inline-block px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded dark:bg-green-900/30 dark:text-green-300"
                >
                  Save {{ bundle.discountPercentage }}%
                </div>
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <button
                @click="toggleBundleStatus(bundle)"
                :class="[
                  'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
                  bundle.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300',
                ]"
              >
                {{ bundle.isActive ? "Active" : "Inactive" }}
              </button>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="editBundle(bundle)"
                  class="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  title="Edit"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click="deleteBundle(bundle._id)"
                  class="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  title="Delete"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="bundles.length === 0 && !loading" class="py-12 text-center">
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p class="mt-4 text-slate-600 dark:text-slate-400">No bundles found</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-600 dark:text-slate-400">
            Showing {{ (currentPage - 1) * limit + 1 }} to
            {{ Math.min(currentPage * limit, totalBundles) }} of
            {{ totalBundles }} bundles
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm font-medium transition-colors border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <div class="flex gap-1">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="typeof page === 'number' && changePage(page)"
                :class="[
                  'px-3 py-1 text-sm font-medium transition-colors rounded-lg',
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : typeof page === 'number'
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    : 'text-slate-400 cursor-default',
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm font-medium transition-colors border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bundle Modal -->
    <BundleModal
      v-if="showCreateModal || editingBundle"
      :bundle="editingBundle"
      @close="closeModal"
      @save="handleSaveBundle"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getAdminBundlesApi,
  deleteBundleApi,
  updateBundleApi,
} from "../../service/bundle.service";
import BundleModal from "../../components/admin/bundles/BundleModal.vue";
import Loading from "../../components/Loading.vue";

// Reactive state
const bundles = ref([]);
const loading = ref(false);
const error = ref(null);
const showCreateModal = ref(false);
const editingBundle = ref(null);

const filters = ref({
  search: "",
  status: "all",
  sortField: "createdAt",
  sortOrder: "desc",
});

const currentPage = ref(1);
const totalPages = ref(1);
const totalBundles = ref(0);
const limit = ref(20);
const searchTimeout = ref(null);

// Computed
const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.status !== "all") count++;
  if (
    filters.value.sortField !== "createdAt" ||
    filters.value.sortOrder !== "desc"
  )
    count++;
  return count;
});

// Methods
const fetchBundles = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params = {
      page: currentPage.value,
      limit: limit.value,
      sort: filters.value.sortField,
      order: filters.value.sortOrder,
      status: filters.value.status,
    };

    if (filters.value.search && filters.value.search.trim()) {
      params.search = filters.value.search.trim();
    }

    const response = await getAdminBundlesApi(params);

    if (response.data.success) {
      bundles.value = response.data.data.bundles || [];
      const pagination = response.data.data.pagination || {};
      totalPages.value = pagination.totalPages || 1;
      totalBundles.value = pagination.totalItems || 0;
      currentPage.value = pagination.currentPage || 1;
    } else {
      bundles.value = [];
      error.value = response.data.message || "Failed to load bundles";
    }
  } catch (err) {
    console.error("Failed to fetch bundles:", err);
    error.value = err.response?.data?.message || "Failed to load bundles";
    bundles.value = [];
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchBundles();
  }, 500);
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchBundles();
};

const resetFilters = () => {
  filters.value = {
    search: "",
    status: "all",
    sortField: "createdAt",
    sortOrder: "desc",
  };
  currentPage.value = 1;
  fetchBundles();
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchBundles();
  }
};

const toggleBundleStatus = async (bundle) => {
  try {
    await updateBundleApi(bundle._id, { isActive: !bundle.isActive });
    bundle.isActive = !bundle.isActive;
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update bundle status");
  }
};

const deleteBundle = async (bundleId) => {
  if (!confirm("Delete this bundle?")) return;

  try {
    await deleteBundleApi(bundleId);
    await fetchBundles();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete bundle");
  }
};

const editBundle = (bundle) => {
  editingBundle.value = { ...bundle };
};

const closeModal = () => {
  showCreateModal.value = false;
  editingBundle.value = null;
};

const handleSaveBundle = async () => {
  await fetchBundles();
  closeModal();
};

const getBundleImage = (bundle) => {
  // Try bundle.image array first
  if (bundle.image && Array.isArray(bundle.image) && bundle.image.length > 0) {
    return bundle.image[0].url || bundle.image[0];
  }

  // Try bundle.image as string or object
  if (bundle.image && typeof bundle.image === "string") return bundle.image;
  if (bundle.image?.url) return bundle.image.url;

  // Fallback to first product's image
  if (bundle.items?.[0]?.product) {
    return getProductImage(bundle.items[0].product);
  }

  return "/placeholder.png";
};

const getProductImage = (product) => {
  if (!product) return "/placeholder.png";

  // Try image array first (standard field)
  if (
    product.image &&
    Array.isArray(product.image) &&
    product.image.length > 0
  ) {
    return product.image[0].url || product.image[0];
  }

  // Try images array (alternative field)
  if (
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return product.images[0].url || product.images[0];
  }

  // Try image as object or string
  if (product.image?.url) return product.image.url;
  if (typeof product.image === "string") return product.image;

  return "/placeholder.png";
};

const getPageNumbers = () => {
  const pages = [];
  const maxPages = 7;

  if (totalPages.value <= maxPages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    let startPage = Math.max(2, currentPage.value - 2);
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 2);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages.value - 1) {
      pages.push("...");
    }

    if (totalPages.value > 1) {
      pages.push(totalPages.value);
    }
  }

  return pages;
};

// Lifecycle
onMounted(async () => {
  await fetchBundles();
});
</script>
