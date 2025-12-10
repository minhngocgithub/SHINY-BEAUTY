<template>
  <div class="min-h-screen p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="mb-8">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p class="mt-1 text-gray-500 dark:text-gray-400">
            Real-time stock levels and inventory tracking
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Connection Status -->
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            :class="
              isConnected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            "
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
            ></span>
            {{ isConnected ? "Live" : "Offline" }}
          </div>
          <!-- Last Updated -->
          <span
            v-if="lastUpdate"
            class="hidden text-sm text-gray-500 sm:inline dark:text-gray-400"
          >
            {{ formatTimeAgo(lastUpdate) }}
          </span>
          <!-- Sync Button -->
          <button
            @click="syncInventory"
            :disabled="syncing"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'animate-spin': syncing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span class="hidden sm:inline">{{
              syncing ? "Syncing..." : "Sync Cache"
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      <!-- Total Stock -->
      <div
        class="relative p-6 overflow-hidden bg-white shadow-sm rounded-xl dark:bg-gray-800"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8"
        >
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-2xl"
          ></div>
        </div>
        <div class="relative">
          <div
            class="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-lg dark:bg-blue-900/30"
          >
            <svg
              class="w-6 h-6 text-blue-600 dark:text-blue-400"
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
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Stock
          </p>
          <p
            class="mt-1 text-3xl font-bold text-gray-900 dark:text-white"
            :class="{ 'animate-pulse': loading }"
          >
            {{
              loading
                ? "..."
                : formatNumber(analytics.combined?.totalStock || 0)
            }}
          </p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ formatNumber(analytics.products?.totalStock || 0) }} products •
            {{ formatNumber(analytics.bundles?.totalStock || 0) }} bundles
          </p>
        </div>
      </div>

      <!-- Total Sold -->
      <div
        class="relative p-6 overflow-hidden bg-white shadow-sm rounded-xl dark:bg-gray-800"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8"
        >
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 blur-2xl"
          ></div>
        </div>
        <div class="relative">
          <div
            class="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg dark:bg-green-900/30"
          >
            <svg
              class="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Sold
          </p>
          <p
            class="mt-1 text-3xl font-bold text-gray-900 dark:text-white"
            :class="{ 'animate-pulse': loading }"
          >
            {{
              loading ? "..." : formatNumber(analytics.combined?.totalSold || 0)
            }}
          </p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            All-time sales
          </p>
        </div>
      </div>

      <!-- Low Stock -->
      <div
        class="relative p-6 overflow-hidden bg-white shadow-sm rounded-xl dark:bg-gray-800"
        :class="{
          'ring-2 ring-yellow-400':
            (analytics.combined?.lowStockCount || 0) > 0,
        }"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8"
        >
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 blur-2xl"
          ></div>
        </div>
        <div class="relative">
          <div
            class="flex items-center justify-center w-12 h-12 mb-4 bg-yellow-100 rounded-lg dark:bg-yellow-900/30"
          >
            <svg
              class="w-6 h-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Low Stock
          </p>
          <p
            class="mt-1 text-3xl font-bold"
            :class="[
              loading ? 'animate-pulse' : '',
              (analytics.combined?.lowStockCount || 0) > 0
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ loading ? "..." : analytics.combined?.lowStockCount || 0 }}
          </p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Items below {{ lowStockThreshold }} units
          </p>
        </div>
      </div>

      <!-- Out of Stock -->
      <div
        class="relative p-6 overflow-hidden bg-white shadow-sm rounded-xl dark:bg-gray-800"
        :class="{
          'ring-2 ring-red-400': (analytics.combined?.outOfStockCount || 0) > 0,
        }"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8"
        >
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 blur-2xl"
          ></div>
        </div>
        <div class="relative">
          <div
            class="flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-lg dark:bg-red-900/30"
          >
            <svg
              class="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Out of Stock
          </p>
          <p
            class="mt-1 text-3xl font-bold"
            :class="[
              loading ? 'animate-pulse' : '',
              (analytics.combined?.outOfStockCount || 0) > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ loading ? "..." : analytics.combined?.outOfStockCount || 0 }}
          </p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Items need restocking
          </p>
        </div>
      </div>
    </div>

    <!-- Health Score & Stock Alerts -->
    <div class="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
      <!-- Inventory Health Score -->
      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Inventory Health
        </h2>
        <div class="flex items-center justify-center">
          <div class="relative w-48 h-48">
            <!-- Background Circle -->
            <svg class="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                stroke-width="12"
                fill="none"
                class="text-gray-200 dark:text-gray-700"
              />
              <!-- Progress Circle -->
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                stroke-width="12"
                fill="none"
                :stroke-dasharray="553"
                :stroke-dashoffset="553 - (553 * healthScore) / 100"
                stroke-linecap="round"
                class="transition-all duration-1000"
                :class="healthScoreColor"
              />
            </svg>
            <!-- Center Text -->
            <div
              class="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span class="text-4xl font-bold" :class="healthScoreTextColor">
                {{ loading ? "..." : healthScore }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400"
                >/ 100</span
              >
              <span
                class="mt-1 text-xs font-medium"
                :class="healthScoreTextColor"
              >
                {{ healthScoreLabel }}
              </span>
            </div>
          </div>
        </div>
        <p class="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          Based on stock levels and availability
        </p>
      </div>

      <!-- Stock Alerts Tabs -->
      <div
        class="p-6 bg-white shadow-sm lg:col-span-2 rounded-xl dark:bg-gray-800"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <button
              @click="activeTab = 'lowStock'"
              class="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
              :class="
                activeTab === 'lowStock'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              "
            >
              Low Stock ({{ lowStockProducts.length }})
            </button>
            <button
              @click="activeTab = 'outOfStock'"
              class="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
              :class="
                activeTab === 'outOfStock'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              "
            >
              Out of Stock ({{ outOfStockProducts.length }})
            </button>
            <!-- Search -->
            <div class="flex items-center ml-3">
              <input
                v-model="searchQuery"
                placeholder="Search products or id"
                class="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-700 dark:text-gray-200"
              />
              <div class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                Threshold
              </div>
              <input
                type="number"
                v-model.number="lowStockThreshold"
                @change="refreshStockAlerts"
                class="w-20 px-2 py-1 ml-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
          <button
            @click="refreshStockAlerts"
            :disabled="loadingAlerts"
            class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 disabled:opacity-50"
          >
            {{ loadingAlerts ? "Loading..." : "Refresh" }}
          </button>
        </div>

        <!-- Loading State -->
        <div
          v-if="loadingAlerts"
          class="flex items-center justify-center py-12"
        >
          <svg
            class="w-8 h-8 text-indigo-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
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
        </div>

        <!-- Empty State -->
        <div
          v-else-if="currentTabProducts.length === 0"
          class="py-12 text-center"
        >
          <div
            class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full"
            :class="
              activeTab === 'lowStock'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
            "
          >
            <svg
              class="w-8 h-8"
              :class="
                activeTab === 'lowStock'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-green-600 dark:text-green-400'
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400">
            {{
              activeTab === "lowStock"
                ? "All products are well-stocked! 🎉"
                : "No out of stock items! 🎉"
            }}
          </p>
        </div>

        <!-- Stock List -->
        <div v-else class="space-y-3 overflow-y-auto max-h-80">
          <div
            v-for="product in currentTabProducts"
            :key="product._id"
            class="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div class="flex items-center flex-1 min-w-0 gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"
              >
                <svg
                  class="w-5 h-5 text-gray-500 dark:text-gray-400"
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
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="font-medium text-gray-900 truncate dark:text-white"
                  :title="product.name"
                >
                  {{ product.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Sold: {{ formatNumber(product.sold || 0) }}
                  <span v-if="product.category" class="ml-2">
                    • {{ product.category?.name || "N/A" }}
                  </span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 ml-3">
              <span
                class="px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap"
                :class="getStockBadgeClass(product.countInStock)"
              >
                {{ product.countInStock }} left
              </span>
              <button
                @click="viewStockHistory(product)"
                class="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="History"
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
                    d="M3 13h2l1 9h12l1-9h2M16 3l-4 4-4-4"
                  />
                </svg>
              </button>
              <button
                @click="restockProduct(product)"
                class="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Restock"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Products & Bundles Breakdown + Top Products -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Products Stats -->
      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Products
          </h2>
          <span
            class="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400"
          >
            {{ formatNumber(analytics.products?.totalStock || 0) }} units
          </span>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">In Stock</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{
                formatNumber(
                  (analytics.products?.totalStock || 0) -
                    (analytics.products?.lowStockCount || 0) -
                    (analytics.products?.outOfStockCount || 0)
                )
              }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Low Stock</span>
            <span class="font-semibold text-yellow-600 dark:text-yellow-400">
              {{ analytics.products?.lowStockCount || 0 }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Out of Stock</span>
            <span class="font-semibold text-red-600 dark:text-red-400">
              {{ analytics.products?.outOfStockCount || 0 }}
            </span>
          </div>
          <div
            class="flex items-center justify-between pt-4 border-t dark:border-gray-700"
          >
            <span class="text-gray-600 dark:text-gray-400">Total Sold</span>
            <span class="font-semibold text-green-600 dark:text-green-400">
              {{ formatNumber(analytics.products?.totalSold || 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bundles Stats -->
      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Bundles
          </h2>
          <span
            class="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full dark:bg-purple-900/30 dark:text-purple-400"
          >
            {{ formatNumber(analytics.bundles?.totalStock || 0) }} units
          </span>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">In Stock</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{
                formatNumber(
                  (analytics.bundles?.totalStock || 0) -
                    (analytics.bundles?.lowStockCount || 0) -
                    (analytics.bundles?.outOfStockCount || 0)
                )
              }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Low Stock</span>
            <span class="font-semibold text-yellow-600 dark:text-yellow-400">
              {{ analytics.bundles?.lowStockCount || 0 }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Out of Stock</span>
            <span class="font-semibold text-red-600 dark:text-red-400">
              {{ analytics.bundles?.outOfStockCount || 0 }}
            </span>
          </div>
          <div
            class="flex items-center justify-between pt-4 border-t dark:border-gray-700"
          >
            <span class="text-gray-600 dark:text-gray-400">Total Sold</span>
            <span class="font-semibold text-green-600 dark:text-green-400">
              {{ formatNumber(analytics.bundles?.totalSold || 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Top Selling Products -->
      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Top Sellers
          </h2>
          <button
            @click="refreshTopProducts"
            :disabled="loadingTopProducts"
            class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 disabled:opacity-50"
          >
            {{ loadingTopProducts ? "Loading..." : "Refresh" }}
          </button>
        </div>

        <!-- Loading State -->
        <div
          v-if="loadingTopProducts"
          class="flex items-center justify-center py-8"
        >
          <svg
            class="w-6 h-6 text-indigo-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
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
        </div>

        <!-- Top Products List -->
        <div v-else class="space-y-3">
          <div
            v-for="(product, index) in topProducts.slice(0, 5)"
            :key="product._id"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div
              class="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full"
              :class="
                index === 0
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : index === 1
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  : index === 2
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              "
            >
              <span class="text-xs font-bold">{{ index + 1 }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-gray-900 truncate dark:text-white"
                :title="product.name"
              >
                {{ product.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatNumber(product.sold || 0) }} sold
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ product.countInstock || 0 }} units
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">in stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Stock History Modal -->
    <div
      v-if="historyModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/50"
        @click="historyModalOpen = false"
      ></div>
      <div
        class="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Stock History
          </h3>
          <button
            @click="historyModalOpen = false"
            class="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        <div v-if="historyLoading" class="py-6 text-center">Loading...</div>

        <div v-else>
          <div
            v-if="selectedHistory && selectedHistory.length === 0"
            class="py-6 text-center text-gray-500"
          >
            No history found.
          </div>
          <ul v-else class="space-y-2 overflow-auto max-h-96">
            <li
              v-for="(h, idx) in selectedHistory"
              :key="idx"
              class="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-700/50"
            >
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ h.action || h.type || "Update" }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ new Date(h.at || h.createdAt || h.date).toLocaleString() }}
                </div>
              </div>
              <div class="text-sm text-right text-gray-700 dark:text-gray-200">
                {{ h.change || h.quantity || "-" }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useAdminSocketStore } from "../../store/admin/adminSocket.store";
import { useProductStore } from "../../store/product.store";
import {
  getInventoryAnalyticsApi,
  getLowStockProductsApi,
  getTopProductsApi,
  syncStockCacheApi,
  restockProductApi,
  getStockLevelApi,
  getStockHistoryApi,
} from "../../service/admin.service";

// Stores
const adminSocketStore = useAdminSocketStore();

// State
const loading = ref(false);
const loadingAlerts = ref(false);
const loadingTopProducts = ref(false);
const syncing = ref(false);
const lastUpdate = ref(null);
const lowStockThreshold = ref(10);
const analytics = ref({
  products: null,
  bundles: null,
  combined: null,
});
const lowStockProducts = ref([]);
const outOfStockProducts = ref([]);
const topProducts = ref([]);
const activeTab = ref("lowStock");
const searchQuery = ref("");
const historyModalOpen = ref(false);
const historyLoading = ref(false);
const selectedHistory = ref(null);

// Auto-refresh interval
let refreshInterval = null;

// Computed
const { isConnected } = storeToRefs(adminSocketStore);

const currentTabProducts = computed(() => {
  const source =
    activeTab.value === "lowStock"
      ? lowStockProducts.value
      : outOfStockProducts.value;
  const q = (searchQuery.value || "").trim().toLowerCase();

  if (!q) return source;
  return source.filter((p) => {
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p._id || "").toLowerCase().includes(q) ||
      (p.category?.name || "").toLowerCase().includes(q)
    );
  });
});

const healthScore = computed(() => {
  return analytics.value.combined?.stockHealthScore || 100;
});

const healthScoreColor = computed(() => {
  const score = healthScore.value;
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
});

const healthScoreTextColor = computed(() => {
  const score = healthScore.value;
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
});

const healthScoreLabel = computed(() => {
  const score = healthScore.value;
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Critical";
});

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
};

const formatTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getStockBadgeClass = (stock) => {
  if (stock <= 0) {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
  if (stock <= 5) {
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
};

const fetchAnalytics = async () => {
  try {
    loading.value = true;
    const response = await getInventoryAnalyticsApi({
      lowStockThreshold: lowStockThreshold.value,
    });

    // API returns { success: true, data: { products, bundles, combined } }
    if (response && response.success && response.data) {
      analytics.value = {
        products: response.data.products || null,
        bundles: response.data.bundles || null,
        combined: response.data.combined || null,
      };
      lastUpdate.value = new Date();
      console.log("[Inventory] Analytics loaded:", analytics.value);
    }
  } catch (error) {
    console.error("[Inventory] Failed to fetch analytics:", error);
  } finally {
    loading.value = false;
  }
};

const refreshStockAlerts = async () => {
  try {
    loadingAlerts.value = true;
    const response = await getLowStockProductsApi({
      threshold: lowStockThreshold.value,
      limit: 50,
    });

    // API returns { success: true, data: { products: [...], bundles: [...], total: number } }
    if (response && response.success && response.data) {
      const allProducts = [
        ...(response.data.products || []),
        ...(response.data.bundles || []),
      ].map((p) => ({
        ...p,
        // Normalize stock field (server uses countInStock)
        countInStock: p.countInStock ?? 0,
      }));

      lowStockProducts.value = allProducts.filter(
        (p) => p.countInStock > 0 && p.countInStock < lowStockThreshold.value
      );
      outOfStockProducts.value = allProducts.filter(
        (p) => p.countInStock === 0
      );

      console.log("[Inventory] Stock alerts loaded:", {
        low: lowStockProducts.value.length,
        out: outOfStockProducts.value.length,
      });
    }
  } catch (error) {
    console.error("[Inventory] Failed to fetch stock alerts:", error);
  } finally {
    loadingAlerts.value = false;
  }
};

const refreshTopProducts = async () => {
  try {
    loadingTopProducts.value = true;
    const response = await getTopProductsApi({ limit: 5 });

    // API returns { success: true, data: [...products] }
    if (response && response.success && response.data) {
      topProducts.value = Array.isArray(response.data) ? response.data : [];
      console.log("[Inventory] Top products loaded:", topProducts.value.length);
    }
  } catch (error) {
    console.error("[Inventory] Failed to fetch top products:", error);
  } finally {
    loadingTopProducts.value = false;
  }
};

const syncInventory = async () => {
  try {
    syncing.value = true;
    await syncStockCacheApi();
    await Promise.all([fetchAnalytics(), refreshStockAlerts()]);
  } catch (error) {
    console.error("[Inventory] Failed to sync inventory:", error);
  } finally {
    syncing.value = false;
  }
};

const restockProduct = async (product) => {
  try {
    const input = window.prompt(`Restock quantity for ${product.name}:`, "10");
    if (!input) return;
    const qty = parseInt(input);
    if (isNaN(qty) || qty <= 0) {
      alert("Invalid quantity");
      return;
    }

    // API returns { success: true, message, data: { product: {...} } }
    const response = await restockProductApi(product._id, { quantity: qty });

    if (response && response.success) {
      // Refresh all data
      await Promise.all([
        fetchAnalytics(),
        refreshStockAlerts(),
        refreshTopProducts(),
      ]);
      alert(
        `Restocked successfully! New stock: ${
          response.data?.product?.stock || "N/A"
        }`
      );
    }
  } catch (error) {
    console.error("[Inventory] Restock failed:", error);
    alert(
      error.response?.data?.message ||
        "Failed to restock. See console for details."
    );
  }
};

const viewStockHistory = async (product) => {
  try {
    historyLoading.value = true;
    const res = await getStockHistoryApi(product._id);
    // API returns { success: true, data: { productName, currentStock, history: [...], total } }
    if (res && res.success && res.data) {
      selectedHistory.value = res.data.history || [];
      historyModalOpen.value = true;
      console.log(
        "[Inventory] History loaded:",
        selectedHistory.value.length,
        "entries"
      );
    }
  } catch (error) {
    console.error("[Inventory] Failed to get stock history:", error);
    alert(error.response?.data?.message || "Failed to load history");
  } finally {
    historyLoading.value = false;
  }
};

// Socket event handlers
const handleLowStockAlert = (response) => {
  if (response.success) {
    const exists = lowStockProducts.value.find(
      (p) => p._id === response.data._id
    );
    if (!exists) {
      // Normalize stock field
      const product = {
        ...response.data,
        countInStock:
          response.data.countInStock ??
          response.data.countInstock ??
          response.data.stock ??
          0,
      };
      lowStockProducts.value.unshift(product);
    }
    fetchAnalytics();
  }
};

const handleOutOfStock = () => {
  fetchAnalytics();
  refreshStockAlerts();
};

const handleProductUpdate = () => {
  fetchAnalytics();
};

// Lifecycle
onMounted(async () => {
  // Fetch initial data
  await Promise.all([
    fetchAnalytics(),
    refreshStockAlerts(),
    refreshTopProducts(),
  ]);

  // Setup auto-refresh every 30 seconds
  refreshInterval = setInterval(() => {
    fetchAnalytics();
  }, 30000);

  // Listen for real-time updates
  if (adminSocketStore.socket) {
    adminSocketStore.socket.on("admin:product:low_stock", handleLowStockAlert);
    adminSocketStore.socket.on("admin:product:out_of_stock", handleOutOfStock);
    adminSocketStore.socket.on("admin:product:updated", handleProductUpdate);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  if (adminSocketStore.socket) {
    adminSocketStore.socket.off("admin:product:low_stock", handleLowStockAlert);
    adminSocketStore.socket.off("admin:product:out_of_stock", handleOutOfStock);
    adminSocketStore.socket.off("admin:product:updated", handleProductUpdate);
  }
});
</script>
