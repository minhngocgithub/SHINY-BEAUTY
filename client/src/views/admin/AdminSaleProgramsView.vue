<template>
  <div class="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Sale Programs Management
          </h1>
          <p class="mt-1 text-gray-600 dark:text-gray-400">
            Manage flash sales, seasonal promotions, and discount campaigns
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
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
          Create Sale Program
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Programs
            </p>
            <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ stats.total }}
            </p>
          </div>
          <div
            class="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg dark:bg-indigo-900/30"
          >
            <svg
              class="w-6 h-6 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Programs
            </p>
            <p
              class="mt-2 text-3xl font-bold text-green-600 dark:text-green-400"
            >
              {{ stats.active }}
            </p>
          </div>
          <div
            class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900/30"
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Products on Sale
            </p>
            <p class="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {{ stats.productsOnSale }}
            </p>
          </div>
          <div
            class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/30"
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
        </div>
      </div>

      <div class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue Impact
            </p>
            <p
              class="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400"
            >
              ${{ formatNumber(stats.totalRevenue) }}
            </p>
          </div>
          <div
            class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg dark:bg-purple-900/30"
          >
            <svg
              class="w-6 h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="p-4 mb-6 bg-white shadow-sm rounded-xl dark:bg-gray-800">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Search -->
        <div class="relative flex-1 min-w-[300px]">
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search sale programs..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            class="absolute w-5 h-5 text-gray-400 left-3 top-2.5"
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

        <!-- Status Filter -->
        <select
          v-model="filters.status"
          @change="fetchSalePrograms"
          class="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
        </select>

        <!-- Type Filter -->
        <select
          v-model="filters.type"
          @change="fetchSalePrograms"
          class="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="percentage_sale">Percentage Sale</option>
          <option value="fixed_amount_sale">Fixed Amount Sale</option>
          <option value="flash_sale">Flash Sale</option>
          <option value="bundle_offer">Bundle Offer</option>
          <option value="free_shipping">Free Shipping</option>
        </select>

        <!-- Refresh -->
        <button
          @click="fetchSalePrograms"
          :disabled="loading"
          class="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
        >
          <svg
            :class="{ 'animate-spin': loading }"
            class="w-5 h-5"
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
        </button>

        <!-- Recalculate Stats -->
        <button
          @click="recalculateAllStats"
          :disabled="recalculating"
          class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          title="Recalculate stats from orders"
        >
          <svg
            :class="{ 'animate-spin': recalculating }"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {{ recalculating ? "Recalculating..." : "Fix Stats" }}
        </button>

        <!-- Fix Legacy Data -->
        <button
          @click="fixLegacyData"
          :disabled="fixingData"
          class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          title="Fix stringified benefits/conditions fields"
        >
          <svg
            :class="{ 'animate-spin': fixingData }"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {{ fixingData ? "Fixing..." : "Fix Data" }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && !salePrograms.length"
      class="flex items-center justify-center py-20"
    >
      <Loading />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-white shadow-sm rounded-xl dark:bg-gray-800"
    >
      <div class="text-center">
        <svg
          class="w-16 h-16 mx-auto mb-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ error }}
        </p>
        <button
          @click="fetchSalePrograms"
          class="px-4 py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Sale Programs Table -->
    <div
      v-else
      class="overflow-hidden bg-white shadow-sm rounded-xl dark:bg-gray-800"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Program
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Discount
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Period
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Usage
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Performance
              </th>
              <th
                class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="program in salePrograms"
              :key="program._id"
              class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <!-- Program Info -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="program.bannerImage"
                    :src="program.bannerImage"
                    :alt="program.title"
                    class="object-cover w-16 h-16 rounded-lg"
                  />
                  <div
                    class="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg dark:bg-gray-700"
                    v-else
                  >
                    <svg
                      class="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">
                      {{ program.title }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ program.shortDescription || "No description" }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="px-6 py-4">
                <span
                  :class="getTypeBadgeClass(program.type)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full"
                >
                  {{ formatType(program.type) }}
                </span>
              </td>

              <!-- Discount -->
              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="font-semibold text-gray-900 dark:text-white">
                    <span v-if="program.benefits?.discountPercentage"
                      >{{ program.benefits.discountPercentage }}% OFF</span
                    >
                    <span v-else-if="program.benefits?.discountAmount"
                      >${{ program.benefits.discountAmount }} OFF</span
                    >
                    <span v-else class="text-gray-400">N/A</span>
                  </p>
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400"
                    v-if="program.conditions?.minOrderValue"
                  >
                    Min: ${{ program.conditions.minOrderValue }}
                  </p>
                </div>
              </td>

              <!-- Period -->
              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="text-gray-900 dark:text-white">
                    {{ formatDate(program.startDate) }}
                  </p>
                  <p class="text-gray-500 dark:text-gray-400">
                    to
                    {{
                      program.endDate ? formatDate(program.endDate) : "No end"
                    }}
                  </p>
                  <p
                    class="mt-1 text-xs"
                    :class="getTimeRemainingClass(program)"
                  >
                    {{ getTimeRemaining(program) }}
                  </p>
                </div>
              </td>

              <!-- Usage -->
              <td class="px-6 py-4">
                <div class="text-sm">
                  <div class="flex items-center gap-2 mb-1">
                    <div
                      class="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700"
                    >
                      <div
                        :style="{ width: getUsagePercentage(program) + '%' }"
                        :class="getUsageBarClass(program)"
                        class="h-2 transition-all rounded-full"
                      ></div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    {{ program.currentUsage || 0 }} /
                    {{ program.maxUsage || "∞" }}
                  </p>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <button
                  @click="toggleStatus(program)"
                  :class="getStatusBadgeClass(program)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span
                    :class="program.isActive ? 'bg-green-400' : 'bg-gray-400'"
                    class="w-2 h-2 rounded-full"
                  ></span>
                  {{ getStatusText(program) }}
                </button>
              </td>

              <!-- Performance -->
              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="font-semibold text-gray-900 dark:text-white">
                    ${{ formatNumber(program.stats?.totalRevenue || 0) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ program.stats?.successfulOrders || 0 }} orders
                  </p>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewAnalytics(program)"
                    class="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    title="View Analytics"
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="manageProducts(program)"
                    class="p-2 text-purple-600 transition-colors rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    title="Manage Products"
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </button>
                  <button
                    @click="editProgram(program)"
                    class="p-2 text-yellow-600 transition-colors rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
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
                    @click="confirmDelete(program)"
                    class="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
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
        <div v-if="!salePrograms.length && !loading" class="py-20 text-center">
          <svg
            class="w-20 h-20 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            No Sale Programs
          </h3>
          <p class="mb-4 text-gray-500 dark:text-gray-400">
            Get started by creating your first sale program
          </p>
          <button
            @click="openCreateModal"
            class="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Create Sale Program
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <SaleProgramModal
      v-if="showModal"
      :program="selectedProgram"
      @close="closeModal"
      @saved="handleProgramSaved"
    />

    <!-- Products Management Modal -->
    <ProductsManagementModal
      v-if="showProductsModal"
      :program="selectedProgram"
      @close="showProductsModal = false"
      @updated="fetchSalePrograms"
    />

    <!-- Analytics Modal -->
    <AnalyticsModal
      v-if="showAnalyticsModal"
      :program="selectedProgram"
      @close="showAnalyticsModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSaleProgramStore } from "../../store/saleProgram.store";
import Loading from "../../components/Loading.vue";
import SaleProgramModal from "../../components/admin/saleProgram/SaleProgramModal.vue";
import ProductsManagementModal from "../../components/admin/saleProgram/ProductsManagementModal.vue";
import AnalyticsModal from "../../components/admin/saleProgram/AnalyticsModal.vue";
import {
  showErrorAlert,
  showSuccessAlert,
  showConfirmAlert,
} from "../../../utils/sweetAlert";
// Store
const saleProgramStore = useSaleProgramStore();

// State
const showModal = ref(false);
const showProductsModal = ref(false);
const showAnalyticsModal = ref(false);
const selectedProgram = ref(null);
const recalculating = ref(false);
const fixingData = ref(false);

const filters = ref({
  search: "",
  status: "",
  type: "",
  page: 1,
  limit: 50,
});

// Computed from store
const salePrograms = computed(() => saleProgramStore.salePrograms);
const loading = computed(() => saleProgramStore.loading);
const error = computed(() => saleProgramStore.error);

const stats = computed(() => {
  const total = salePrograms.value.length;
  const active = salePrograms.value.filter(
    (p) => p.isActive && isCurrentlyActive(p)
  ).length;

  // Only count products from active programs (isActive=true AND currently within date range)
  const productsOnSale = salePrograms.value
    .filter((p) => p.isActive && isCurrentlyActive(p))
    .reduce((sum, p) => {
      const productIds = p.conditions?.applicableProducts || [];
      // Use Set to avoid counting duplicate products across programs
      return sum + productIds.length;
    }, 0);

  const totalRevenue = salePrograms.value.reduce(
    (sum, p) => sum + (p.stats?.totalRevenue || 0),
    0
  );

  return { total, active, productsOnSale, totalRevenue };
});

// Methods
const fetchSalePrograms = async () => {
  console.log(
    "🔍 AdminSaleProgramsView: Fetching sale programs...",
    filters.value
  );
  await saleProgramStore.fetchSalePrograms(filters.value);
  console.log("✅ Sale programs result:", {
    count: salePrograms.value.length,
    data: salePrograms.value,
    loading: loading.value,
    error: error.value,
  });
};

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchSalePrograms();
  }, 300);
};

const openCreateModal = () => {
  selectedProgram.value = null;
  showModal.value = true;
};

const editProgram = (program) => {
  selectedProgram.value = { ...program };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedProgram.value = null;
};

const handleProgramSaved = () => {
  closeModal();
  fetchSalePrograms();
};

const confirmDelete = async (program) => {
  const confirmed = await showConfirmAlert(
    `Are you sure you want to delete "${program.title}"?`,
    "This action cannot be undone!",
    "warning"
  );

  if (!confirmed) return;

  try {
    await saleProgramStore.deleteSaleProgram(program._id);
    await showSuccessAlert("Sale program deleted successfully!");
    await fetchSalePrograms(); // Refresh list
  } catch (err) {
    console.error("Error deleting program:", err);
    await showErrorAlert(
      "Failed to delete program: " +
        (err.response?.data?.message || err.message)
    );
  }
};

const toggleStatus = async (program) => {
  try {
    await saleProgramStore.toggleSaleProgramStatus(program._id);
    // Refresh the list to update stats and status
    await fetchSalePrograms();
  } catch (err) {
    console.error("Error toggling status:", err);
    alert("Failed to toggle status");
  }
};

const manageProducts = (program) => {
  selectedProgram.value = program;
  showProductsModal.value = true;
};

const viewAnalytics = (program) => {
  selectedProgram.value = program;
  showAnalyticsModal.value = true;
};

const recalculateAllStats = async () => {
  const confirmed = await showConfirmAlert(
    "This will recalculate stats for all sale programs from order data. Continue?",
    "This process may take a few seconds",
    "info"
  );

  if (!confirmed) return;

  try {
    recalculating.value = true;
    const { recalculateAllProgramStatsApi } = await import(
      "../../service/saleProgram.service"
    );
    await recalculateAllProgramStatsApi();

    await showSuccessAlert("Stats recalculated successfully!");
    await fetchSalePrograms();
  } catch (err) {
    console.error("Error recalculating stats:", err);
    await showErrorAlert(
      "Failed to recalculate stats: " +
        (err.response?.data?.message || err.message)
    );
  } finally {
    recalculating.value = false;
  }
};

const fixLegacyData = async () => {
  const confirmed = await showConfirmAlert(
    "This will fix stringified benefits/conditions fields in database. This should be run ONCE. Continue?",
    "This operation will modify database records",
    "warning"
  );

  if (!confirmed) return;

  try {
    fixingData.value = true;
    const { fixLegacyDataFieldsApi } = await import(
      "../../service/saleProgram.service"
    );
    const response = await fixLegacyDataFieldsApi();

    const result = response.data.data;
    await showSuccessAlert(
      `Legacy data fixed successfully!\n\nTotal: ${result.total}\nFixed: ${result.fixed}\nErrors: ${result.errors}\nUnchanged: ${result.unchanged}`
    );

    await fetchSalePrograms();
  } catch (err) {
    console.error("Error fixing legacy data:", err);
    await showErrorAlert(
      "Failed to fix legacy data: " +
        (err.response?.data?.message || err.message)
    );
  } finally {
    fixingData.value = false;
  }
};

// Utility Functions
const formatType = (type) => {
  return (
    type
      ?.split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "N/A"
  );
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(0);
};

const isCurrentlyActive = (program) => {
  const now = new Date();
  const start = new Date(program.startDate);
  const end = program.endDate ? new Date(program.endDate) : null;
  return now >= start && (!end || now <= end);
};

const getTimeRemaining = (program) => {
  if (!program.endDate) return "No end date";

  const now = new Date();
  const end = new Date(program.endDate);
  const diff = end - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

const getTimeRemainingClass = (program) => {
  if (!program.endDate) return "text-gray-500";

  const now = new Date();
  const end = new Date(program.endDate);
  const diff = end - now;

  if (diff <= 0) return "text-red-600";
  if (diff < 24 * 60 * 60 * 1000) return "text-orange-600";
  if (diff < 7 * 24 * 60 * 60 * 1000) return "text-yellow-600";
  return "text-green-600";
};

const getTypeBadgeClass = (type) => {
  const classes = {
    flash_sale:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    percentage_sale:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    fixed_amount_sale:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    bundle_offer:
      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    free_shipping:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return (
    classes[type] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
  );
};

const getStatusBadgeClass = (program) => {
  if (!program.isActive) {
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400";
  }

  const now = new Date();
  const start = new Date(program.startDate);
  const end = program.endDate ? new Date(program.endDate) : null;

  // Active and no end date
  if (!end && now >= start) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }

  // Active and within date range
  if (now >= start && end && now <= end) {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }

  // Active but scheduled (before start)
  if (now < start) {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }

  // Active but expired (admin override) - show orange
  if (end && now > end) {
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }

  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
};

const getStatusText = (program) => {
  if (!program.isActive) return "Inactive";

  const now = new Date();
  const start = new Date(program.startDate);
  const end = program.endDate ? new Date(program.endDate) : null;

  // If active and no end date, it's active
  if (!end) return "Active";

  // If active and within date range
  if (now >= start && now <= end) return "Active";

  // If active but before start date
  if (now < start) return "Scheduled";

  // If active but after end date - show as "Active (Expired)" to indicate admin override
  if (now > end) return "Active (Expired)";

  return "Expired";
};

const getUsagePercentage = (program) => {
  if (!program.maxUsage) return 0;
  return Math.min(100, ((program.currentUsage || 0) / program.maxUsage) * 100);
};

const getUsageBarClass = (program) => {
  const percentage = getUsagePercentage(program);
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 70) return "bg-yellow-500";
  return "bg-green-500";
};

// Lifecycle
onMounted(() => {
  fetchSalePrograms();
});
</script>
