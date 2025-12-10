<template>
  <div class="h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            Products Management
          </h1>
          <p class="mt-1 text-slate-600 dark:text-slate-400">
            Manage your product catalog
          </p>
        </div>
        <div class="flex items-center gap-3">
          <router-link
            to="/admin/bundle-products"
            class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Bundle Products
          </router-link>
          <button
            @click="showCreateModal = true"
            class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="p-6 mb-6 bg-white border shadow-lg dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
        <button
          v-if="activeFilterCount > 0"
          @click="resetFilters"
          class="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      <!-- Active Filter Chips -->
      <div
        v-if="activeFilters.length > 0"
        class="flex flex-wrap gap-2 p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
      >
        <button
          v-for="filter in activeFilters"
          :key="filter.key"
          @click="removeFilter(filter.key)"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-300 rounded-md text-xs font-medium text-blue-900 hover:bg-blue-100 transition-colors group"
        >
          {{ filter.label }}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Main Filters -->
      <div class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-4">
        <!-- Search -->
        <div class="relative md:col-span-2">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="localFilters.search"
            @input="debouncedApplyFilters"
            type="text"
            placeholder="Search products..."
            class="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- Category -->
        <div class="relative">
          <select
            v-model="localFilters.category"
            @change="applyFilters"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <!-- Brand -->
        <div class="relative">
          <input
            v-model="localFilters.brand"
            @input="debouncedApplyFilters"
            type="text"
            placeholder="Brand..."
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="mb-3">
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <svg
            :class="showAdvancedFilters ? 'rotate-180' : ''"
            class="w-4 h-4 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {{ showAdvancedFilters ? "Hide" : "Show" }} Advanced Filters
        </button>
      </div>

      <div v-show="showAdvancedFilters" class="grid grid-cols-2 gap-3 mt-3 md:grid-cols-6">
        <!-- Stock -->
        <select v-model="localFilters.inStock" @change="applyFilters" class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All Stock</option>
          <option :value="true">✓ In Stock</option>
          <option :value="false">Out of Stock</option>
        </select>
        

        <!-- Featured -->
        <select v-model="localFilters.featured" @change="applyFilters" 
        class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All Featured</option>
          <option :value="true">✓ Featured</option>
          <option :value="false">Not Featured</option>
        </select>

        <!-- Best Seller -->
        <select v-model="localFilters.isBestSeller" @change="applyFilters" 
        class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All</option>
          <option :value="true">✓ Best Seller</option>
          <option :value="false">Not Best Seller</option>
        </select>

        <!-- On Sale -->
        <select v-model="localFilters.isOnSale" @change="applyFilters" 
        class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All</option>
          <option :value="true">✓ On Sale</option>
          <option :value="false">Not On Sale</option>
        </select>

        <!-- New Product -->
        <select v-model="localFilters.isNewProduct" @change="applyFilters" 
        class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All</option>
          <option :value="true">✓ New</option>
          <option :value="false">Not New</option>
        </select>

        <!-- Rating -->
        <select v-model="localFilters.minRating" @change="applyFilters" 
        class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All Ratings</option>
          <option :value="4">4+ Stars</option>
          <option :value="3">3+ Stars</option>
          <option :value="2">2+ Stars</option>
          <option :value="1">1+ Stars</option>
        </select>
      </div>

      <!-- Price Range & Sort -->
      <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
        <div class="flex items-center gap-3">
          <input
            v-model.number="localFilters.minPrice"
            @input="debouncedApplyFilters"
            type="number"
            placeholder="Min $"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-[#FFFF] rounded-sm">—</span>
          <input
            v-model.number="localFilters.maxPrice"
            @input="debouncedApplyFilters"
            type="number"
            placeholder="Max $"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select v-model="localFilters.sort" @change="applyFilters" 
        class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-sold">Best Seller</option>
          <option value="-price">Price: High → Low</option>
          <option value="price">Price: Low → High</option>
          <option value="-ratings.average">Highest Rating</option>
        </select>
      </div>

      <!-- Bulk Actions -->
      <div
        v-if="selectedProducts.length > 0"
        class="flex items-center gap-4 pt-4 mt-4 border-t"
      >
        <span class="text-sm font-semibold">{{ selectedProducts.length }} selected</span>
        <button
          @click="handleBulkDelete"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Delete Selected
        </button>
        <button
          @click="selectedProducts = []"
          class="px-4 py-2 text-sm font-medium text-white rounded-lg bg-slate-600 hover:bg-slate-700"
        >
          Clear Selection
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="productStore.loading" class="flex items-center justify-center py-12">
      <Loading />
    </div>

    <!-- Error -->
    <div v-else-if="productStore.error" class="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
      <p class="text-red-800">{{ productStore.error }}</p>
    </div>

    <!-- Products Table -->
    <div v-else class="overflow-hidden shadow-lg dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700">
      <table class="w-full">
        <thead class="bg-slate-100 dark:bg-slate-700">
          <tr>
            <th class="px-4 py-3 text-left">
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="selectedProducts.length === productStore.products.length && productStore.products.length > 0"
                class="rounded"
              />
            </th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Image</th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Name</th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Category</th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Price</th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Stock</th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Sold</th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Status</th>
            <th class="px-3 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="product in productStore.products" :key="product._id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-4 py-3">
              <input type="checkbox" :value="product._id" v-model="selectedProducts" class="rounded" />
            </td>
            <td class="px-4 py-3">
              <img :src="getMainImage(product)" :alt="product.name" class="object-cover w-12 h-12 rounded" />
            </td>
            <td class="px-4 py-3">
              <div class="text-sm font-medium text-slate-900 dark:text-white">{{ product.name }}</div>
              <div class="text-xs text-slate-500">{{ product.brand || 'No Brand' }}</div>
              <div class="flex flex-wrap gap-1 mt-1">
                <span v-if="product.featured" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">⭐ Featured</span>
                <span v-if="product.isBestSeller" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">🔥 Best Seller</span>
                <span v-if="product.isOnSale" class="nline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">💰 Sale</span>
                <span v-if="product.isNewProduct" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">🆕 New</span>
              </div>
            </td>
            <td class="px-3 py-3">
              <span class="px-2 py-1 text-sm rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {{ getCategoryName(product) }}
              </span>
            </td>
            <td class="px-3 py-3">
              <div class="flex flex-col gap-1">
                <div class="text-sm font-semibold text-slate-900 dark:text-white">${{ (product.salePrice || product.price)?.toFixed(2) }}</div>
                <div v-if="product.isOnSale && product.salePrice" class="flex items-center gap-2">
                  <span class="text-xs line-through text-slate-500">${{ product.price?.toFixed(2) }}</span>
                  <span class="text-xs font-semibold text-red-600">-{{ product.discountPercentage }}%</span>
                </div>
              </div>
            </td>
            <td class="px-3 py-3">
              <span :class="getStockColorClass(product.countInstock)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ product.countInstock || 0 }} units
              </span>
            </td>
            <td class="px-3 py-3">
              <span :class="getStockColorClass(product.sold)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ product.sold || 0 }} sold
              </span>
            </td>
            <td class="px-3 py-3">
              <button
                @click="handleToggleAvailability(product)"
                :class="product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                {{ product.isAvailable ? '✓ Active' : '✕ Inactive' }}
              </button>
            </td>
            <td class="px-3 py-3">
              <div class="flex items-center gap-2">
                <button @click="editProduct(product)" class="p-1 text-blue-600 rounded hover:bg-blue-50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="handleDeleteProduct(product._id)" class="p-1 text-red-600 rounded hover:bg-red-50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="productStore.products.length === 0" class="py-12 text-center">
        <svg class="w-12 h-12 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="mt-4 text-slate-600">No products found</p>
      </div>

      <!-- Pagination -->
      <div v-if="productStore.pagination.totalPages > 1" class="px-6 py-4 border-t bg-slate-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600">
              Hiển thị
              <span class="font-semibold text-slate-900">{{ (productStore.pagination.page - 1) * productStore.pagination.limit + 1 }}-{{ Math.min(productStore.pagination.page * productStore.pagination.limit, productStore.pagination.total) }}</span>
              trong tổng số
              <span class="font-semibold text-slate-900">{{ productStore.pagination.total }}</span>
              sản phẩm
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(1)"
              :disabled="productStore.pagination.page === 1"
              :class="productStore.pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'"
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 text-slate-700"
            >
              ‹‹ Đầu
            </button>
            <button
              @click="changePage(productStore.pagination.page - 1)"
              :disabled="productStore.pagination.page === 1"
              :class="productStore.pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'"
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 text-slate-700"
            >
              ‹ Trước
            </button>

            <!-- Page Numbers -->
            <div class="flex gap-1">
              <template v-for="(page, index) in getPageNumbers()">
                <button
                  v-if="page !== '...'"
                  :key="`page-${page}`"
                  @click="changePage(page)"
                  :class="productStore.pagination.page === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'"
                  class="px-3 py-2 border rounded-lg text-sm font-medium transition-all min-w-[40px]"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  :key="`ellipsis-${index}`"
                  class="px-2 py-2 text-slate-400"
                >...</span>
              </template>
            </div>

            <button
              @click="changePage(productStore.pagination.page + 1)"
              :disabled="productStore.pagination.page === productStore.pagination.totalPages"
              :class="productStore.pagination.page === productStore.pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'"
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 text-slate-700"
            >
              Sau ›
            </button>
            <button
              @click="changePage(productStore.pagination.totalPages)"
              :disabled="productStore.pagination.page === productStore.pagination.totalPages"
              :class="productStore.pagination.page === productStore.pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'"
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 text-slate-700"
            >
              Cuối ››
            </button>
          </div>
        </div>
      </div>
    </div>

    <ProductModal
      v-if="showCreateModal || editingProduct"
      :product="editingProduct"
      :categories="categories"
      @close="closeModal"
      @save="handleSaveProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../../store/product.store'
import { 
  getAllCategoriesApi,
  deleteProductApi,
  bulkDeleteProductsApi,
  toggleAvailabilityApi
} from '../../service/product.service'
import ProductModal from '../../components/admin/products/ProductModal.vue'
import Loading from '../../components/Loading.vue'

const productStore = useProductStore()

// ===== LOCAL STATE =====
const categories = ref([])
const selectedProducts = ref([])
const showCreateModal = ref(false)
const editingProduct = ref(null)
const showAdvancedFilters = ref(false)

// Local filters (synced with store via debounce)
const localFilters = ref({
  search: '',
  category: '',
  brand: '',
  inStock: '',
  featured: '',
  isBestSeller: '',
  isOnSale: '',
  isNewProduct: '',
  minRating: '',
  minPrice: null,
  maxPrice: null,
  sort: '-createdAt'
})

// ===== COMPUTED =====
const activeFilterCount = computed(() => {
  let count = 0
  if (localFilters.value.search) count++
  if (localFilters.value.category) count++
  if (localFilters.value.brand) count++
  if (localFilters.value.inStock !== '') count++
  if (localFilters.value.featured !== '') count++
  if (localFilters.value.isBestSeller !== '') count++
  if (localFilters.value.isOnSale !== '') count++
  if (localFilters.value.isNewProduct !== '') count++
  if (localFilters.value.minRating) count++
  if (localFilters.value.minPrice) count++
  if (localFilters.value.maxPrice) count++
  if (localFilters.value.sort !== '-createdAt') count++
  return count
})

const activeFilters = computed(() => {
  const active = []
  if (localFilters.value.search) {
    active.push({ key: 'search', label: `Search: "${localFilters.value.search}"` })
  }
  if (localFilters.value.category) {
    const cat = categories.value.find(c => c._id === localFilters.value.category)
    active.push({ key: 'category', label: `Category: ${cat?.name || 'Unknown'}` })
  }
  if (localFilters.value.brand) {
    active.push({ key: 'brand', label: `Brand: ${localFilters.value.brand}` })
  }
  if (localFilters.value.inStock !== '') {
    active.push({ key: 'inStock', label: localFilters.value.inStock ? 'In Stock' : 'Out of Stock' })
  }
  if (localFilters.value.featured !== '') {
    active.push({ key: 'featured', label: localFilters.value.featured ? 'Featured' : 'Not Featured' })
  }
  if (localFilters.value.isBestSeller !== '') {
    active.push({ key: 'isBestSeller', label: localFilters.value.isBestSeller ? 'Best Seller' : 'Not Best Seller' })
  }
  if (localFilters.value.isOnSale !== '') {
    active.push({ key: 'isOnSale', label: localFilters.value.isOnSale ? 'On Sale' : 'Not On Sale' })
  }
  if (localFilters.value.isNewProduct !== '') {
    active.push({ key: 'isNewProduct', label: localFilters.value.isNewProduct ? 'New Product' : 'Not New' })
  }
  if (localFilters.value.minRating) {
    active.push({ key: 'minRating', label: `Rating: ${localFilters.value.minRating}+ stars` })
  }
  if (localFilters.value.minPrice) {
    active.push({ key: 'minPrice', label: `Min: ${localFilters.value.minPrice}` })
  }
  if (localFilters.value.maxPrice) {
    active.push({ key: 'maxPrice', label: `Max: ${localFilters.value.maxPrice}` })
  }
  return active
})

// ===== DEBOUNCE TIMER =====
let debounceTimer = null

// ===== METHODS =====
const fetchCategories = async () => {
  try {
    const response = await getAllCategoriesApi()
    if (response.data.success) {
      categories.value = response.data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

const applyFilters = () => {
  // Build params object - convert boolean strings to actual booleans
  const params = {
    page: 1, // Reset to first page when filtering
    limit: 20,
    sort: localFilters.value.sort
  }

  if (localFilters.value.search?.trim()) {
    params.search = localFilters.value.search.trim()
  }

  if (localFilters.value.category) {
    params.category = localFilters.value.category
  }

  if (localFilters.value.brand?.trim()) {
    params.brand = localFilters.value.brand.trim()
  }

  // Convert string values to proper booleans
  if (localFilters.value.inStock !== '') {
    params.inStock = localFilters.value.inStock === true || localFilters.value.inStock === 'true'
  }

  if (localFilters.value.featured !== '') {
    params.featured = localFilters.value.featured === true || localFilters.value.featured === 'true'
  }

  if (localFilters.value.isBestSeller !== '') {
    params.isBestSeller = localFilters.value.isBestSeller === true || localFilters.value.isBestSeller === 'true'
  }

  if (localFilters.value.isOnSale !== '') {
    params.isOnSale = localFilters.value.isOnSale === true || localFilters.value.isOnSale === 'true'
  }

  if (localFilters.value.isNewProduct !== '') {
    params.isNewProduct = localFilters.value.isNewProduct === true || localFilters.value.isNewProduct === 'true'
  }

  if (localFilters.value.minRating) {
    params.minRating = Number(localFilters.value.minRating)
  }

  if (localFilters.value.minPrice && localFilters.value.minPrice > 0) {
    params.minPrice = Number(localFilters.value.minPrice)
  }

  if (localFilters.value.maxPrice && localFilters.value.maxPrice > 0) {
    params.maxPrice = Number(localFilters.value.maxPrice)
  }

  // Use store action
  productStore.fetchProducts(params)
}

const debouncedApplyFilters = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    applyFilters()
  }, 500)
}

const resetFilters = () => {
  localFilters.value = {
    search: '',
    category: '',
    brand: '',
    inStock: '',
    featured: '',
    isBestSeller: '',
    isOnSale: '',
    isNewProduct: '',
    minRating: '',
    minPrice: null,
    maxPrice: null,
    sort: '-createdAt'
  }
  applyFilters()
}

const removeFilter = (key) => {
  switch (key) {
    case 'search':
      localFilters.value.search = ''
      break
    case 'category':
      localFilters.value.category = ''
      break
    case 'brand':
      localFilters.value.brand = ''
      break
    case 'inStock':
      localFilters.value.inStock = ''
      break
    case 'featured':
      localFilters.value.featured = ''
      break
    case 'isBestSeller':
      localFilters.value.isBestSeller = ''
      break
    case 'isOnSale':
      localFilters.value.isOnSale = ''
      break
    case 'isNewProduct':
      localFilters.value.isNewProduct = ''
      break
    case 'minRating':
      localFilters.value.minRating = ''
      break
    case 'minPrice':
      localFilters.value.minPrice = null
      break
    case 'maxPrice':
      localFilters.value.maxPrice = null
      break
  }
  applyFilters()
}

const changePage = (page) => {
  if (page >= 1 && page <= productStore.pagination.totalPages) {
    productStore.setPagination(page)
    
    // Re-apply current filters with new page
    const params = buildFilterParams()
    params.page = page
    params.limit = 20
    
    productStore.fetchProducts(params)
  }
}

const buildFilterParams = () => {
  const params = {
    sort: localFilters.value.sort
  }

  if (localFilters.value.search?.trim()) {
    params.search = localFilters.value.search.trim()
  }
  if (localFilters.value.category) {
    params.category = localFilters.value.category
  }
  if (localFilters.value.brand?.trim()) {
    params.brand = localFilters.value.brand.trim()
  }
  if (localFilters.value.inStock !== '') {
    params.inStock = localFilters.value.inStock === true || localFilters.value.inStock === 'true'
  }
  if (localFilters.value.featured !== '') {
    params.featured = localFilters.value.featured === true || localFilters.value.featured === 'true'
  }
  if (localFilters.value.isBestSeller !== '') {
    params.isBestSeller = localFilters.value.isBestSeller === true || localFilters.value.isBestSeller === 'true'
  }
  if (localFilters.value.isOnSale !== '') {
    params.isOnSale = localFilters.value.isOnSale === true || localFilters.value.isOnSale === 'true'
  }
  if (localFilters.value.isNewProduct !== '') {
    params.isNewProduct = localFilters.value.isNewProduct === true || localFilters.value.isNewProduct === 'true'
  }
  if (localFilters.value.minRating) {
    params.minRating = Number(localFilters.value.minRating)
  }
  if (localFilters.value.minPrice && localFilters.value.minPrice > 0) {
    params.minPrice = Number(localFilters.value.minPrice)
  }
  if (localFilters.value.maxPrice && localFilters.value.maxPrice > 0) {
    params.maxPrice = Number(localFilters.value.maxPrice)
  }

  return params
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedProducts.value = productStore.products.map(p => p._id)
  } else {
    selectedProducts.value = []
  }
}

const handleBulkDelete = async () => {
  if (!confirm(`Delete ${selectedProducts.value.length} products?`)) return

  try {
    await bulkDeleteProductsApi(selectedProducts.value)
    selectedProducts.value = []
    
    // Refresh products using store
    const params = buildFilterParams()
    params.page = productStore.pagination.page
    params.limit = 20
    productStore.fetchProducts(params) // Không cần await nếu store không return Promise
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete products')
  }
}

const handleDeleteProduct = async (productId) => {
  if (!confirm('Delete this product?')) return

  try {
    await deleteProductApi(productId)
    
    // Refresh products using store
    const params = buildFilterParams()
    params.page = productStore.pagination.page
    params.limit = 20
    productStore.fetchProducts(params) // Không cần await nếu store không return Promise
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete product')
  }
}

const handleToggleAvailability = async (product) => {
  try {
    await toggleAvailabilityApi(product._id)
    
    // Update local product state
    product.isAvailable = !product.isAvailable
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update product')
  }
}

const editProduct = (product) => {
  editingProduct.value = { ...product }
}

const closeModal = () => {
  showCreateModal.value = false
  editingProduct.value = null
}

const handleSaveProduct = async () => {
  // Refresh products using store
  const params = buildFilterParams()
  params.page = productStore.pagination.page
  params.limit = 20
  productStore.fetchProducts(params) // Không cần await
  closeModal()
}

// ===== UTILITY FUNCTIONS =====
const getMainImage = (product) => {
  const imgs = Array.isArray(product.image) && product.image.length
    ? product.image
    : Array.isArray(product.images) && product.images.length
    ? product.images
    : null

  if (imgs && imgs.length > 0) {
    const main = imgs.find(i => {
      if (!i) return false
      if (typeof i === 'string') return false
      return i.isMain === true
    })

    const pick = (item) => {
      if (!item) return null
      if (typeof item === 'string') return item
      return item.url || item.secure_url || null
    }

    if (main) {
      const url = pick(main)
      if (url) return url
    }

    const first = imgs[0]
    const firstUrl = pick(first)
    if (firstUrl) return firstUrl
  }

  if (product.image && typeof product.image === 'string') return product.image
  if (product.images && typeof product.images === 'string') return product.images

  return '/placeholder.png'
}

const getStockColorClass = (stock) => {
  if (stock === 0) return 'bg-red-100 text-red-800'
  if (stock < 10) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getCategoryName = (product) => {
  if (!product.category || product.category.length === 0) {
    return 'Uncategorized'
  }
  const mainCategory = product.category[0]
  return mainCategory?.name || 'Uncategorized'
}

const getPageNumbers = () => {
  const pages = []
  const maxPages = 7
  const total = productStore.pagination.totalPages
  const current = productStore.pagination.page

  if (total <= maxPages) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    let startPage = Math.max(2, current - 2)
    let endPage = Math.min(total - 1, current + 2)

    if (startPage > 2) {
      pages.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < total - 1) {
      pages.push('...')
    }

    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
}

// ===== LIFECYCLE =====
onMounted(async () => {
  await fetchCategories()
  await productStore.fetchProducts({ page: 1, limit: 20, sort: '-createdAt' })
})
</script>