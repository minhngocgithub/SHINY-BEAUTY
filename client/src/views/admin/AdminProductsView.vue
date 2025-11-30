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
          Add Product
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
            class="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- Active Filter Chips -->
      <div
        v-if="activeFilters.length > 0"
        class="flex flex-wrap gap-2 p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
      >
        <div
          class="flex items-center gap-1 text-xs font-medium text-blue-900 dark:text-blue-100"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          Active:
        </div>
        <button
          v-for="filter in activeFilters"
          :key="filter.key"
          @click="removeFilter(filter.key)"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-md text-xs font-medium text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
        >
          {{ filter.label }}
          <svg
            class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-200"
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

      <!-- Main Filters Row -->
      <div class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-4">
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
            placeholder="Search ..."
            class="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <!-- Category Filter -->
        <div class="relative">
          <select
            v-model="filters.category"
            @change="applyFilters"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }} ({{ filterStats.byCategory[cat._id] || 0 }})
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

        <!-- Brand Filter -->
        <div class="relative">
          <input
            v-model="filters.brand"
            @input="debounceSearch"
            type="text"
            placeholder="Search by brand..."
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <!-- Secondary Filters Row -->
      <div class="mb-3">
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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

      <div
        v-show="showAdvancedFilters"
        class="grid grid-cols-2 gap-3 md:grid-cols-6"
      >
        <!-- Stock Status -->
        <div class="relative">
          <select
            v-model="filters.inStock"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Stock ({{ filterStats.totalProducts }})</option>
            <option value="true">In stock ({{ filterStats.inStock }})</option>
            <option value="false">
              Out of stock ({{ filterStats.outOfStock }})
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-3 h-3 text-slate-400"
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

        <!-- Featured Filter -->
        <div class="relative">
          <select
            v-model="filters.featured"
            @change="applyFilters"
            :disabled="isFilterDisabled.featured"
            :class="
              isFilterDisabled.featured
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            "
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">⭐ Featured ({{ filterStats.featured }})</option>
            <option value="true">✓ Featured</option>
            <option value="false">✗ Not Featured</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-3 h-3 text-slate-400"
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

        <!-- Best Seller Filter -->
        <div class="relative">
          <select
            v-model="filters.isBestSeller"
            @change="applyFilters"
            :disabled="isFilterDisabled.bestSeller"
            :class="
              isFilterDisabled.bestSeller
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            "
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              🔥 Best Seller ({{ filterStats.bestSeller }})
            </option>
            <option value="true">✓ Best Seller</option>
            <option value="false">✗ Not Best Seller</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-3 h-3 text-slate-400"
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

        <!-- Sale Filter -->
        <div class="relative">
          <select
            v-model="filters.isOnSale"
            @change="applyFilters"
            :disabled="isFilterDisabled.sale"
            :class="
              isFilterDisabled.sale
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            "
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">💰 Sale ({{ filterStats.onSale }})</option>
            <option value="true">✓ On Sale</option>
            <option value="false">✗ Not On Sale</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-3 h-3 text-slate-400"
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

        <!-- New Product Filter -->
        <div class="relative">
          <select
            v-model="filters.isNewProduct"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">🆕 New ({{ filterStats.newProducts }})</option>
            <option value="true">✓ New Product</option>
            <option value="false">✗ Not New</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-3 h-3 text-slate-400"
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

        <!-- Rating Filter -->
        <div class="relative">
          <select
            v-model="filters.minRating"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">⭐ Đánh giá</option>
            <option value="4">⭐⭐⭐⭐ 4+</option>
            <option value="3">⭐⭐⭐ 3+</option>
            <option value="2">⭐⭐ 2+</option>
            <option value="1">⭐ 1+</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-3 h-3 text-slate-400"
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
      </div>

      <!-- Price Range Filter -->
      <div class="grid items-end grid-cols-1 gap-4 mt-4 md:grid-cols-2">
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <label
              class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >Begin ($)</label
            >
            <input
              v-model.number="filters.minPrice"
              @input="debounceSearch"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span class="mt-5 text-slate-400">—</span>
          <div class="flex-1">
            <label
              class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >End ($)</label
            >
            <input
              v-model.number="filters.maxPrice"
              @input="debounceSearch"
              type="number"
              min="0"
              placeholder="9999"
              class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Sort -->
        <div>
          <label
            class="block mb-1 text-xs font-medium text-slate-700 dark:text-slate-300"
            >Arrange</label
          >
          <select
            v-model="filters.sort"
            @change="applyFilters"
            class="w-full px-3 py-2 text-sm transition-all bg-white border rounded-lg outline-none appearance-none cursor-pointer border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="-sold">Best Seller</option>
            <option value="price">High → Low</option>
            <option value="-price">Low → High</option>
            <option value="-ratings.average">Highest Rating</option>
            <option value="name">A → Z</option>
            <option value="-name">Z → A</option>
            <option value="-countInstock">High Inventory</option>
          </select>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div
        v-if="selectedProducts.length > 0"
        class="flex items-center gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700"
      >
        <span class="text-sm font-semibold text-slate-900 dark:text-white"
          >{{ selectedProducts.length }} sản phẩm đã chọn</span
        >
        <button
          @click="bulkDelete"
          class="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg shadow-sm hover:bg-red-700"
        >
          🗑️ Xóa đã chọn
        </button>
        <button
          @click="selectedProducts = []"
          class="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-sm bg-slate-600 hover:bg-slate-700"
        >
          ✕ Bỏ chọn
        </button>
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

    <!-- Products Table -->
    <div
      v-else
      class="overflow-hidden bg-white rounded-lg shadow dark:bg-slate-800"
    >
      <table class="w-full">
        <thead class="bg-slate-100 dark:bg-slate-700">
          <tr>
            <th class="px-4 py-3 text-left">
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="
                  selectedProducts.length === products.length &&
                  products.length > 0
                "
                class="rounded border-slate-300"
              />
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Image
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Name
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Category
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Price
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Stock
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Status
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr
            v-for="product in products"
            :key="product._id"
            class="hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <td class="px-4 py-3">
              <input
                type="checkbox"
                :value="product._id"
                v-model="selectedProducts"
                class="rounded border-slate-300"
              />
            </td>
            <td class="px-4 py-3">
              <img
                :src="getMainImage(product)"
                :alt="product.name"
                class="object-cover w-12 h-12 rounded"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <div class="text-sm font-medium text-slate-900 dark:text-white">
                  {{ product.name }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ product.brand || "No Brand" }}
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-if="product.featured"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800"
                  >
                    ⭐ Featured
                  </span>
                  <span
                    v-if="product.isBestSeller"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800"
                  >
                    🔥 Best Seller
                  </span>
                  <span
                    v-if="product.isOnSale"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800"
                  >
                    💰 Sale
                  </span>
                  <span
                    v-if="product.isNewProduct && isProductNew(product)"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800"
                  >
                    🆕 New
                  </span>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 text-sm rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                {{ getCategoryName(product) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <div
                  class="text-sm font-semibold text-slate-900 dark:text-white"
                >
                  ${{ (product.salePrice || product.price)?.toFixed(2) }}
                </div>
                <div
                  v-if="product.isOnSale && product.salePrice"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs line-through text-slate-500"
                    >${{ product.price?.toFixed(2) }}</span
                  >
                  <span class="text-xs font-semibold text-red-600"
                    >-{{ product.discountPercentage }}%</span
                  >
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <span
                  :class="getStockColorClass(product.countInstock)"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
                >
                  <span class="font-semibold">{{
                    product.countInstock || 0
                  }}</span>
                  <span>sản phẩm</span>
                </span>
                <span class="text-xs text-slate-500">
                  {{ getStockStatusText(product.countInstock) }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <button
                @click="toggleProductAvailability(product)"
                :class="
                  product.isAvailable
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                "
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                {{ product.isAvailable ? "✓ Đang bán" : "✕ Ngừng bán" }}
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button
                  @click="editProduct(product)"
                  class="p-1 text-blue-600 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                  @click="deleteProduct(product._id)"
                  class="p-1 text-red-600 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
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
      <div v-if="products.length === 0 && !loading" class="py-12 text-center">
        <svg
          class="w-12 h-12 mx-auto text-slate-400"
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
        <p class="mt-4 text-slate-600 dark:text-slate-400">No products found</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600 dark:text-slate-400">
              Hiển thị
              <span class="font-semibold text-slate-900 dark:text-white"
                >{{ (currentPage - 1) * limit + 1 }}-{{
                  Math.min(currentPage * limit, totalProducts)
                }}</span
              >
              trong tổng số
              <span class="font-semibold text-slate-900 dark:text-white">{{
                totalProducts
              }}</span>
              sản phẩm
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(1)"
              :disabled="currentPage === 1"
              :class="
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white dark:hover:bg-slate-700'
              "
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              ‹‹ Đầu
            </button>
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white dark:hover:bg-slate-700'
              "
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
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
                  :class="
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  "
                  class="px-3 py-2 border rounded-lg text-sm font-medium transition-all min-w-[40px]"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  :key="`ellipsis-${index}`"
                  class="px-2 py-2 text-slate-400"
                  >...</span
                >
              </template>
            </div>

            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white dark:hover:bg-slate-700'
              "
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              Sau ›
            </button>
            <button
              @click="changePage(totalPages)"
              :disabled="currentPage === totalPages"
              :class="
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white dark:hover:bg-slate-700'
              "
              class="px-3 py-2 text-sm font-medium transition-all border rounded-lg border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
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
import { ref, computed, onMounted } from "vue";
import {
  getAllProductsApi,
  deleteProductApi,
  bulkDeleteProductsApi,
  toggleAvailabilityApi,
  getAllCategoriesApi,
} from "../../service/product.service";
import ProductModal from "../../components/admin/products/ProductModal.vue";
import Loading from "../../components/Loading.vue";
// Reactive state
const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedProducts = ref([]);
const showCreateModal = ref(false);
const editingProduct = ref(null);
const filters = ref({
  search: "",
  category: "",
  brand: "",
  inStock: "",
  featured: "",
  isBestSeller: "",
  isOnSale: "",
  isNewProduct: "",
  minRating: "",
  minPrice: null,
  maxPrice: null,
  sort: "-createdAt",
});
const currentPage = ref(1);
const totalPages = ref(1);
const totalProducts = ref(0);
const limit = ref(20);
const searchTimeout = ref(null);
const showAdvancedFilters = ref(false);
const filterStats = ref({
  totalProducts: 0,
  inStock: 0,
  outOfStock: 0,
  featured: 0,
  bestSeller: 0,
  onSale: 0,
  newProducts: 0,
  byCategory: {},
});

// Computed
const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.category) count++;
  if (filters.value.brand) count++;
  if (filters.value.inStock) count++;
  if (filters.value.featured) count++;
  if (filters.value.isBestSeller) count++;
  if (filters.value.isOnSale) count++;
  if (filters.value.isNewProduct) count++;
  if (filters.value.minRating) count++;
  if (filters.value.minPrice) count++;
  if (filters.value.maxPrice) count++;
  if (filters.value.sort !== "-createdAt") count++;
  return count;
});

const activeFilters = computed(() => {
  const active = [];
  if (filters.value.search)
    active.push({
      key: "search",
      label: `Search: "${filters.value.search}"`,
      value: filters.value.search,
    });
  if (filters.value.category) {
    const cat = categories.value.find((c) => c._id === filters.value.category);
    active.push({
      key: "category",
      label: `Category: ${cat?.name || "Unknown"}`,
      value: filters.value.category,
    });
  }
  if (filters.value.brand)
    active.push({
      key: "brand",
      label: `Brand: ${filters.value.brand}`,
      value: filters.value.brand,
    });
  if (filters.value.inStock)
    active.push({
      key: "inStock",
      label: filters.value.inStock === "true" ? "In Stock" : "Out of Stock",
      value: filters.value.inStock,
    });
  if (filters.value.featured)
    active.push({
      key: "featured",
      label: filters.value.featured === "true" ? "Featured" : "Not Featured",
      value: filters.value.featured,
    });
  if (filters.value.isBestSeller)
    active.push({
      key: "isBestSeller",
      label:
        filters.value.isBestSeller === "true"
          ? "Best Seller"
          : "Not Best Seller",
      value: filters.value.isBestSeller,
    });
  if (filters.value.isOnSale)
    active.push({
      key: "isOnSale",
      label: filters.value.isOnSale === "true" ? "On Sale" : "Not On Sale",
      value: filters.value.isOnSale,
    });
  if (filters.value.isNewProduct)
    active.push({
      key: "isNewProduct",
      label: filters.value.isNewProduct === "true" ? "New Product" : "Not New",
      value: filters.value.isNewProduct,
    });
  if (filters.value.minRating)
    active.push({
      key: "minRating",
      label: `Rating: ${filters.value.minRating}+ stars`,
      value: filters.value.minRating,
    });
  if (filters.value.minPrice)
    active.push({
      key: "minPrice",
      label: `Min Price: $${filters.value.minPrice}`,
      value: filters.value.minPrice,
    });
  if (filters.value.maxPrice)
    active.push({
      key: "maxPrice",
      label: `Max Price: $${filters.value.maxPrice}`,
      value: filters.value.maxPrice,
    });
  return active;
});

const isFilterDisabled = computed(() => {
  return {
    // Disable sale/bestseller filters when out of stock is selected
    sale: filters.value.inStock === "false",
    bestSeller: filters.value.inStock === "false",
    featured: filters.value.inStock === "false",
  };
});

const fetchProducts = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params = {
      page: currentPage.value,
      limit: limit.value,
      sort: filters.value.sort,
    };

    if (filters.value.search && filters.value.search.trim()) {
      params.search = filters.value.search.trim();
    }

    if (filters.value.category) {
      params.category = filters.value.category;
    }

    if (filters.value.brand && filters.value.brand.trim()) {
      params.brand = filters.value.brand.trim();
    }

    if (filters.value.inStock) {
      params.inStock = filters.value.inStock;
    }

    if (filters.value.minPrice && filters.value.minPrice > 0) {
      params.minPrice = filters.value.minPrice;
    }
    if (filters.value.maxPrice && filters.value.maxPrice > 0) {
      params.maxPrice = filters.value.maxPrice;
    }

    if (filters.value.minRating) {
      params.minRating = filters.value.minRating;
    }

    // Send boolean filters to backend
    if (filters.value.featured && filters.value.featured !== "") {
      params.featured = filters.value.featured;
    }

    if (filters.value.isBestSeller && filters.value.isBestSeller !== "") {
      params.isBestSeller = filters.value.isBestSeller;
    }

    if (filters.value.isOnSale && filters.value.isOnSale !== "") {
      params.isOnSale = filters.value.isOnSale;
    }

    if (filters.value.isNewProduct && filters.value.isNewProduct !== "") {
      params.isNewProduct = filters.value.isNewProduct;
    }

    const response = await getAllProductsApi(params);

    // Fetch all products for statistics (without pagination)
    const statsParams = { ...params, limit: 10000, page: 1 };
    const statsResponse = await getAllProductsApi(statsParams);

    if (response.data.success) {
      let productsData = response.data.products || [];

      const pagination = response.data.pagination || {};
      totalPages.value = pagination.totalPages || 1;
      totalProducts.value = pagination.totalProducts || 0;
      currentPage.value = pagination.page || 1;

      // No need for client-side filtering anymore - backend handles it
      products.value = productsData;

      // Calculate filter statistics from ALL products
      if (statsResponse.data.success) {
        calculateFilterStats(statsResponse.data.products || []);
      }
    } else {
      products.value = [];
      error.value = response.data.message || "Failed to load products";
    }
  } catch (err) {
    console.error("Failed to fetch products:", err);
    error.value = err.response?.data?.message || "Failed to load products";
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await getAllCategoriesApi();
    if (response.data.success) {
      categories.value = response.data.data || [];
    } else {
      categories.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    categories.value = [];
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 500);
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchProducts();
};

const resetFilters = () => {
  filters.value = {
    search: "",
    category: "",
    brand: "",
    inStock: "",
    featured: "",
    isBestSeller: "",
    isOnSale: "",
    isNewProduct: "",
    minRating: "",
    minPrice: null,
    maxPrice: null,
    sort: "-createdAt",
  };
  currentPage.value = 1;
  fetchProducts();
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchProducts();
  }
};

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedProducts.value = products.value.map((p) => p._id);
  } else {
    selectedProducts.value = [];
  }
};

const bulkDelete = async () => {
  if (!confirm(`Delete ${selectedProducts.value.length} products?`)) return;

  try {
    await bulkDeleteProductsApi(selectedProducts.value);
    selectedProducts.value = [];
    await fetchProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete products");
  }
};

const deleteProduct = async (productId) => {
  if (!confirm("Delete this product?")) return;

  try {
    await deleteProductApi(productId);
    await fetchProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete product");
  }
};

const toggleProductAvailability = async (product) => {
  try {
    await toggleAvailabilityApi(product._id);
    product.isAvailable = !product.isAvailable;
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update product");
  }
};

const editProduct = (product) => {
  editingProduct.value = { ...product };
};

const closeModal = () => {
  showCreateModal.value = false;
  editingProduct.value = null;
};

const handleSaveProduct = async () => {
  await fetchProducts();
  closeModal();
};

const getMainImage = (product) => {
  const imgs =
    Array.isArray(product.image) && product.image.length
      ? product.image
      : Array.isArray(product.images) && product.images.length
      ? product.images
      : null;

  if (imgs && imgs.length > 0) {
    // Find main image object/string
    const main = imgs.find((i) => {
      if (!i) return false;
      if (typeof i === "string") return false; // strings can't be isMain
      return i.isMain === true;
    });

    const pick = (item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      return item.url || item.secure_url || null;
    };

    if (main) {
      const url = pick(main);
      if (url) return url;
    }

    // Fallback to first available image
    const first = imgs[0];
    const firstUrl = pick(first);
    if (firstUrl) return firstUrl;
  }

  // Last-resort: check top-level legacy fields
  if (product.image && typeof product.image === "string") return product.image;
  if (product.images && typeof product.images === "string")
    return product.images;

  return "/placeholder.png";
};

const getStockColorClass = (stock) => {
  if (stock === 0) return "bg-red-100 text-red-800";
  if (stock < 10) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

const getStockStatusText = (stock) => {
  if (stock === 0) return "Hết hàng";
  if (stock < 10) return "Sắp hết";
  return "Còn hàng";
};

const getCategoryName = (product) => {
  if (!product.category || product.category.length === 0) {
    return "Chưa phân loại";
  }
  const mainCategory = product.category[0];
  return mainCategory?.name || "Chưa phân loại";
};

const isProductNew = (product) => {
  if (!product.newUntil) return false;
  return new Date(product.newUntil) > new Date();
};

const calculateFilterStats = (allProducts) => {
  filterStats.value = {
    totalProducts: allProducts.length,
    inStock: allProducts.filter((p) => p.countInstock > 0).length,
    outOfStock: allProducts.filter((p) => p.countInstock === 0).length,
    featured: allProducts.filter((p) => p.featured).length,
    bestSeller: allProducts.filter((p) => p.isBestSeller).length,
    onSale: allProducts.filter((p) => p.isOnSale).length,
    newProducts: allProducts.filter((p) => p.isNewProduct && isProductNew(p))
      .length,
    byCategory: {},
  };

  // Calculate category counts
  categories.value.forEach((cat) => {
    filterStats.value.byCategory[cat._id] = allProducts.filter(
      (p) => p.category && p.category.some((c) => c._id === cat._id)
    ).length;
  });
};

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case "search":
      filters.value.search = "";
      break;
    case "category":
      filters.value.category = "";
      break;
    case "brand":
      filters.value.brand = "";
      break;
    case "inStock":
      filters.value.inStock = "";
      break;
    case "featured":
      filters.value.featured = "";
      break;
    case "isBestSeller":
      filters.value.isBestSeller = "";
      break;
    case "isOnSale":
      filters.value.isOnSale = "";
      break;
    case "isNewProduct":
      filters.value.isNewProduct = "";
      break;
    case "minRating":
      filters.value.minRating = "";
      break;
    case "minPrice":
      filters.value.minPrice = null;
      break;
    case "maxPrice":
      filters.value.maxPrice = null;
      break;
  }
  applyFilters();
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
  await fetchCategories();
  await fetchProducts();
});
</script>
