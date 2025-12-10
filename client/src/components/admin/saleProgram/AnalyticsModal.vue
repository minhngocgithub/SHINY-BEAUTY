<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b dark:bg-gray-800 dark:border-gray-700"
      >
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics - {{ program?.title }}
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Performance metrics and insights for this sale program
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div
            class="inline-block w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
          ></div>
        </div>

        <!-- Analytics Content -->
        <template v-else>
          <!-- Overview Stats -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div
              class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-blue-700 dark:text-blue-300"
                  >
                    Total Views
                  </p>
                  <p
                    class="text-2xl font-bold text-blue-900 dark:text-blue-100"
                  >
                    {{ formatNumber(analytics.views) }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg"
                >
                  <svg
                    class="w-6 h-6 text-white"
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
                <div>
                  <p
                    class="text-sm font-medium text-green-700 dark:text-green-300"
                  >
                    Applications
                  </p>
                  <p
                    class="text-2xl font-bold text-green-900 dark:text-green-100"
                  >
                    {{ formatNumber(analytics.applications) }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg"
                >
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-purple-700 dark:text-purple-300"
                  >
                    Successful Orders
                  </p>
                  <p
                    class="text-2xl font-bold text-purple-900 dark:text-purple-100"
                  >
                    {{ formatNumber(analytics.successfulOrders) }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-lg"
                >
                  <svg
                    class="w-6 h-6 text-white"
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
                <div>
                  <p
                    class="text-sm font-medium text-orange-700 dark:text-orange-300"
                  >
                    Total Revenue
                  </p>
                  <p
                    class="text-2xl font-bold text-orange-900 dark:text-orange-100"
                  >
                    ${{ formatNumber(analytics.totalRevenue) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Conversion & Impact -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Conversion Funnel -->
            <div
              class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
            >
              <h3
                class="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
              >
                Conversion Funnel
              </h3>

              <div class="space-y-3">
                <div>
                  <div class="flex items-center justify-between mb-1 text-sm">
                    <span class="text-gray-600 dark:text-gray-400">Views</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{
                      formatNumber(analytics.views)
                    }}</span>
                  </div>
                  <div
                    class="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"
                  >
                    <div
                      class="h-2 bg-blue-500 rounded-full"
                      style="width: 100%"
                    ></div>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1 text-sm">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Applications</span
                    >
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ formatNumber(analytics.applications) }} ({{
                        applicationRate
                      }}%)
                    </span>
                  </div>
                  <div
                    class="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"
                  >
                    <div
                      class="h-2 bg-green-500 rounded-full"
                      :style="{ width: applicationRate + '%' }"
                    ></div>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1 text-sm">
                    <span class="text-gray-600 dark:text-gray-400"
                      >Successful Orders</span
                    >
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ formatNumber(analytics.successfulOrders) }} ({{
                        conversionRate
                      }}%)
                    </span>
                  </div>
                  <div
                    class="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700"
                  >
                    <div
                      class="h-2 bg-purple-500 rounded-full"
                      :style="{ width: conversionRate + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Impact -->
            <div
              class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
            >
              <h3
                class="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
              >
                Financial Impact
              </h3>

              <div class="space-y-4">
                <div
                  class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <span
                    class="text-sm font-medium text-green-700 dark:text-green-300"
                    >Total Revenue</span
                  >
                  <span
                    class="text-lg font-bold text-green-900 dark:text-green-100"
                    >${{ formatNumber(analytics.totalRevenue) }}</span
                  >
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <span
                    class="text-sm font-medium text-red-700 dark:text-red-300"
                    >Total Discount Given</span
                  >
                  <span class="text-lg font-bold text-red-900 dark:text-red-100"
                    >-${{ formatNumber(analytics.totalDiscount) }}</span
                  >
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <span
                    class="text-sm font-medium text-blue-700 dark:text-blue-300"
                    >Net Impact</span
                  >
                  <span
                    class="text-lg font-bold text-blue-900 dark:text-blue-100"
                  >
                    ${{
                      formatNumber(
                        analytics.totalRevenue - analytics.totalDiscount
                      )
                    }}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                >
                  <span
                    class="text-sm font-medium text-purple-700 dark:text-purple-300"
                    >Avg Order Value</span
                  >
                  <span
                    class="text-lg font-bold text-purple-900 dark:text-purple-100"
                  >
                    ${{
                      analytics.successfulOrders
                        ? (
                            analytics.totalRevenue / analytics.successfulOrders
                          ).toFixed(2)
                        : "0.00"
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Information -->
          <div
            class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
          >
            <h3
              class="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
            >
              Usage Information
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Current Usage
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ program.currentUsage || 0 }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Max Usage
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ program.maxUsage || "Unlimited" }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Remaining
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{
                    program.maxUsage
                      ? program.maxUsage - (program.currentUsage || 0)
                      : "∞"
                  }}
                </p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4">
              <div class="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  :style="{ width: usagePercentage + '%' }"
                  :class="
                    usagePercentage >= 90
                      ? 'bg-red-500'
                      : usagePercentage >= 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  "
                  class="h-3 transition-all rounded-full"
                ></div>
              </div>
              <p
                class="mt-2 text-sm text-center text-gray-600 dark:text-gray-400"
              >
                {{ usagePercentage.toFixed(1) }}% Used
              </p>
            </div>
          </div>

          <!-- Performance Insights -->
          <div
            class="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl"
          >
            <h3
              class="mb-3 text-lg font-semibold text-gray-900 dark:text-white"
            >
              Performance Insights
            </h3>

            <ul class="space-y-2">
              <li class="flex items-start gap-2">
                <svg
                  class="w-5 h-5 mt-0.5 text-green-500"
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
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Conversion Rate:</strong> {{ conversionRate }}% of
                  views converted to orders
                </span>
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-5 h-5 mt-0.5 text-green-500"
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
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Avg Discount:</strong> ${{
                    analytics.successfulOrders
                      ? (
                          analytics.totalDiscount / analytics.successfulOrders
                        ).toFixed(2)
                      : "0.00"
                  }}
                  per order
                </span>
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-5 h-5 mt-0.5 text-green-500"
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
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>ROI:</strong> Generated ${{
                    formatNumber(analytics.totalRevenue)
                  }}
                  revenue with ${{ formatNumber(analytics.totalDiscount) }} in
                  discounts
                </span>
              </li>
            </ul>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div
        class="sticky bottom-0 flex items-center justify-end p-6 bg-white border-t dark:bg-gray-800 dark:border-gray-700"
      >
        <button
          @click="$emit('close')"
          class="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSaleProgramStore } from "../../../store/saleProgram.store";

const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const saleProgramStore = useSaleProgramStore();
const loading = ref(false);
const analytics = ref({
  views: 0,
  applications: 0,
  successfulOrders: 0,
  totalRevenue: 0,
  totalDiscount: 0,
});

const applicationRate = computed(() => {
  if (!analytics.value.views) return 0;
  return ((analytics.value.applications / analytics.value.views) * 100).toFixed(
    1
  );
});

const conversionRate = computed(() => {
  if (!analytics.value.views) return 0;
  return (
    (analytics.value.successfulOrders / analytics.value.views) *
    100
  ).toFixed(1);
});

const usagePercentage = computed(() => {
  if (!props.program.maxUsage) return 0;
  return Math.min(
    100,
    ((props.program.currentUsage || 0) / props.program.maxUsage) * 100
  );
});

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num?.toFixed(0) || 0;
};

const fetchAnalytics = async () => {
  try {
    loading.value = true;
    const result = await saleProgramStore.getProgramAnalytics(
      props.program._id
    );

    if (result.success) {
      analytics.value = result.data || analytics.value;
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    // Use program stats as fallback
    analytics.value = {
      views: props.program.stats?.views || 0,
      applications: props.program.stats?.applications || 0,
      successfulOrders: props.program.stats?.successfulOrders || 0,
      totalRevenue: props.program.stats?.totalRevenue || 0,
      totalDiscount: props.program.stats?.totalDiscount || 0,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAnalytics();
});
</script>
