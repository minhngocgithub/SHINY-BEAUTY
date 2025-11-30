<template>
  <div class="p-6 shadow-lg bg-[#FEFEFF] rounded-xl hover:shadow-lg">
    <h3 class="mb-6 text-xl font-bold text-[#52525C]">
      <span class="text-2xl"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 text-rose-500"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
      </span>
      <p
        class="mb-1 text-xl font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text"
      >
        Your Benefits
      </p>
    </h3>

    <!-- Loading State -->
    <div v-if="historyLoading" class="flex justify-center py-8">
      <div
        class="w-8 h-8 border-b-2 rounded-full animate-spin border-primary-500"
      ></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!history || history.length === 0" class="py-8 text-center">
      <div class="mb-4 text-6xl">📦</div>
      <p class="mb-2 text-gray-500 dark:text-gray-400">No points history yet</p>
      <p class="text-sm text-gray-400">
        Make your first purchase to earn points!
      </p>
    </div>

    <!-- History List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in history"
        :key="item.orderId"
        class="flex items-center justify-between p-4 transition-shadow rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-md"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-gray-800 dark:text-white">
              #{{ item.orderNumber }}
            </span>
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="getStatusClass(item.orderStatus)"
            >
              {{ item.orderStatus }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(item.date) }}
          </p>
          <p class="mt-1 text-xs text-gray-400">
            Order Total: {{ formatCurrency(item.orderTotal) }}
          </p>
        </div>

        <div class="text-right">
          <div
            v-if="item.earned > 0"
            class="flex items-center gap-1 text-green-600 dark:text-green-400"
          >
            <span class="text-lg">+{{ item.earned }}</span>
            <span class="text-xs">pts</span>
          </div>
          <div
            v-if="item.used > 0"
            class="flex items-center gap-1 mt-1 text-orange-600 dark:text-orange-400"
          >
            <span class="text-lg">-{{ item.used }}</span>
            <span class="text-xs">pts</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="px-4 py-2 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="px-4 py-2 text-gray-600 dark:text-gray-400">
          Page {{ pagination.page }} of {{ pagination.pages }}
        </span>
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="px-4 py-2 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useLoyaltyStore } from "../../store/loyalty.store";
import { formatCurrency, formatDateTime } from "../../service/loyalty.service";

const loyaltyStore = useLoyaltyStore();
const {
  history,
  historyPagination: pagination,
  historyLoading,
} = storeToRefs(loyaltyStore);

const formatDate = (date) => {
  return formatDateTime(date);
};

const getStatusClass = (status) => {
  const classes = {
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    CONFIRMED:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    PROCESSING:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    SHIPPED:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    DELIVERED:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };
  return (
    classes[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
  );
};

const goToPage = async (page) => {
  if (page < 1 || page > pagination.value.pages) return;
  await loyaltyStore.fetchHistory(page);
};
</script>
