<template>
  <div class="min-h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white">
          Email Campaigns
        </h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">
          Manage and track email marketing campaigns
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="refreshCampaigns"
          :disabled="campaignStore.loading"
          class="flex items-center gap-2 px-4 py-2 text-slate-700 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            class="w-5 h-5"
            :class="{ 'animate-spin': campaignStore.loading }"
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
          <span>Refresh</span>
        </button>
        <button
          @click="createChristmasCampaign"
          class="flex items-center gap-2 px-4 py-2 text-white transition-all bg-gradient-to-r from-red-600 to-green-600 rounded-lg hover:from-red-700 hover:to-green-700 hover:scale-105 shadow-md"
          title="Quick create Christmas 2025 campaign"
        >
          <span class="text-lg">🎄</span>
          <span>Christmas 2025</span>
        </button>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
          <span>Create Campaign</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-5">
      <div
        class="p-6 transition-shadow bg-white rounded-xl shadow-sm hover:shadow-md dark:bg-slate-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              📊 Total
            </p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {{ campaignStore.campaigns.length }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="p-6 transition-shadow bg-white rounded-xl shadow-sm hover:shadow-md dark:bg-slate-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              📝 Draft
            </p>
            <p class="mt-2 text-3xl font-bold text-slate-600">
              {{ campaignStore.draftCampaigns.length }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="p-6 transition-shadow bg-white rounded-xl shadow-sm hover:shadow-md dark:bg-slate-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              ⏰ Scheduled
            </p>
            <p class="mt-2 text-3xl font-bold text-blue-600">
              {{ campaignStore.scheduledCampaigns.length }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="p-6 transition-shadow bg-white rounded-xl shadow-sm hover:shadow-md dark:bg-slate-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              🚀 Active
            </p>
            <p class="mt-2 text-3xl font-bold text-green-600">
              {{ campaignStore.activeCampaigns.length }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="p-6 transition-shadow bg-white rounded-xl shadow-sm hover:shadow-md dark:bg-slate-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              📧 Emails Sent
            </p>
            <p class="mt-2 text-3xl font-bold text-purple-600">
              {{ totalSent.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Stats -->
    <div class="grid gap-4 mb-8 md:grid-cols-3">
      <div class="p-6 bg-white rounded-xl shadow-sm dark:bg-slate-800">
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30"
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Open Rate
            </p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ avgOpenRate.toFixed(1) }}%
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-xl shadow-sm dark:bg-slate-800">
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30"
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
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Delivery Rate
            </p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ deliveryRate.toFixed(1) }}%
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-xl shadow-sm dark:bg-slate-800">
        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30"
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
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Click Rate
            </p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ avgClickRate.toFixed(1) }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="p-6 mb-6 bg-white rounded-xl shadow-sm dark:bg-slate-800">
      <div class="grid gap-4 md:grid-cols-4">
        <div class="md:col-span-2">
          <label
            class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >Search</label
          >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search campaigns, subject, category..."
            class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >Status</label
          >
          <select
            v-model="statusFilter"
            class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PROCESSING">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div>
          <label
            class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >Category</label
          >
          <select
            v-model="categoryFilter"
            class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="promotional">Promotional</option>
            <option value="newsletter">Newsletter</option>
            <option value="flash_sale">Flash Sale</option>
            <option value="new_product">New Product</option>
            <option value="abandoned_cart">Abandoned Cart</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="campaignStore.loading"
      class="flex items-center justify-center py-20"
    >
      <div
        class="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
      ></div>
    </div>

    <!-- Campaigns Table -->
    <div
      v-else-if="filteredCampaigns.length > 0"
      class="overflow-hidden bg-white rounded-xl shadow-sm dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Campaign
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Category
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Status
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Target
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Sent
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Performance
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-center uppercase text-slate-600 dark:text-slate-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr
              v-for="campaign in filteredCampaigns"
              :key="campaign._id"
              class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td class="px-6 py-4">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white">
                    {{ campaign.name }}
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ campaign.subject }}
                  </p>
                  <p class="mt-1 text-xs text-slate-400">
                    {{ new Date(campaign.createdAt).toLocaleDateString() }}
                  </p>
                </div>
              </td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {{ formatCategory(campaign.category) }}
                </span>
              </td>

              <td class="px-6 py-4">
                <span
                  :class="getCampaignStatusClass(campaign.status)"
                  class="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full"
                >
                  <span class="w-2 h-2 rounded-full bg-current"></span>
                  {{ campaign.status }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="font-medium text-slate-900 dark:text-white">
                    {{ (campaign.stats?.targetCount || 0).toLocaleString() }}
                  </p>
                  <p class="text-xs text-slate-500">recipients</p>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="font-medium text-slate-900 dark:text-white">
                    {{ (campaign.stats?.sent || 0).toLocaleString() }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ campaign.stats?.delivered || 0 }} delivered
                  </p>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="space-y-2">
                  <!-- Open Rate -->
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                          >Open</span
                        >
                        <span class="text-xs font-medium"
                          >{{ getOpenRate(campaign).toFixed(1) }}%</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 overflow-hidden bg-slate-200 rounded-full dark:bg-slate-700"
                      >
                        <div
                          class="h-full transition-all bg-blue-600"
                          :style="{ width: `${getOpenRate(campaign)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <!-- Click Rate -->
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                          >Click</span
                        >
                        <span class="text-xs font-medium"
                          >{{ getClickRate(campaign).toFixed(1) }}%</span
                        >
                      </div>
                      <div
                        class="w-full h-1.5 overflow-hidden bg-slate-200 rounded-full dark:bg-slate-700"
                      >
                        <div
                          class="h-full transition-all bg-green-600"
                          :style="{ width: `${getClickRate(campaign)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <!-- Send button for draft campaigns -->
                  <button
                    v-if="campaign.status === 'DRAFT'"
                    @click="sendCampaign(campaign)"
                    class="p-2 text-green-600 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Send Campaign"
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>

                  <!-- Analytics button -->
                  <button
                    v-if="campaign.stats?.sent > 0"
                    @click="viewAnalytics(campaign)"
                    class="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
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

                  <!-- Edit button for draft campaigns -->
                  <button
                    v-if="campaign.status === 'DRAFT'"
                    @click="editCampaign(campaign)"
                    class="p-2 text-slate-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Edit Campaign"
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

                  <!-- Delete button - only for DRAFT and FAILED campaigns -->
                  <button
                    v-if="['DRAFT', 'FAILED'].includes(campaign.status)"
                    @click="deleteCampaign(campaign._id, campaign.status)"
                    class="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete Campaign"
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

        <div v-if="filteredCampaigns.length === 0" class="py-16 text-center">
          <svg
            class="w-16 h-16 mx-auto text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p
            class="mt-4 text-lg font-medium text-slate-600 dark:text-slate-400"
          >
            No campaigns found
          </p>
          <p class="mt-1 text-sm text-slate-500">Try adjusting your filters</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-20 text-center bg-white rounded-xl shadow-sm dark:bg-slate-800"
    >
      <div class="flex justify-center mb-4">
        <div
          class="flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700"
        >
          <svg
            class="w-10 h-10 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
        No campaigns yet
      </h3>
      <p class="mb-6 text-slate-600 dark:text-slate-400">
        Create your first email campaign to engage with customers
      </p>
      <button
        @click="showCreateModal = true"
        class="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Create Your First Campaign
      </button>
    </div>

    <!-- Analytics Modal -->
    <teleport to="body">
      <div
        v-if="showAnalyticsModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeAnalyticsModal"
      >
        <div
          class="w-full max-w-4xl p-6 bg-white rounded-xl shadow-2xl dark:bg-slate-800 animate-fadeIn max-h-[90vh] overflow-y-auto"
        >
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
                Campaign Analytics
              </h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {{ selectedCampaign?.name }}
              </p>
            </div>
            <button
              @click="closeAnalyticsModal"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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

          <div v-if="selectedCampaign" class="space-y-6">
            <!-- Key Metrics -->
            <div class="grid gap-4 md:grid-cols-4">
              <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                <p class="text-sm text-slate-600 dark:text-slate-400">Sent</p>
                <p
                  class="mt-1 text-2xl font-bold text-slate-900 dark:text-white"
                >
                  {{ (selectedCampaign.stats?.sent || 0).toLocaleString() }}
                </p>
              </div>
              <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <p class="text-sm text-blue-600 dark:text-blue-400">
                  Delivered
                </p>
                <p
                  class="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-300"
                >
                  {{
                    (selectedCampaign.stats?.delivered || 0).toLocaleString()
                  }}
                </p>
                <p class="text-xs text-blue-600">
                  {{ getDeliveryRate(selectedCampaign).toFixed(1) }}%
                </p>
              </div>
              <div class="p-4 rounded-lg bg-green-50 dark:bg-green-900/30">
                <p class="text-sm text-green-600 dark:text-green-400">Opened</p>
                <p
                  class="mt-1 text-2xl font-bold text-green-900 dark:text-green-300"
                >
                  {{ (selectedCampaign.stats?.opened || 0).toLocaleString() }}
                </p>
                <p class="text-xs text-green-600">
                  {{ getOpenRate(selectedCampaign).toFixed(1) }}%
                </p>
              </div>
              <div class="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <p class="text-sm text-purple-600 dark:text-purple-400">
                  Clicked
                </p>
                <p
                  class="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-300"
                >
                  {{ (selectedCampaign.stats?.clicked || 0).toLocaleString() }}
                </p>
                <p class="text-xs text-purple-600">
                  {{ getClickRate(selectedCampaign).toFixed(1) }}%
                </p>
              </div>
            </div>

            <!-- Campaign Details -->
            <div
              class="p-6 border rounded-lg border-slate-200 dark:border-slate-700"
            >
              <h4
                class="mb-4 text-lg font-semibold text-slate-900 dark:text-white"
              >
                Campaign Details
              </h4>
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    Subject
                  </p>
                  <p class="mt-1 font-medium text-slate-900 dark:text-white">
                    {{ selectedCampaign.subject }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    Category
                  </p>
                  <p class="mt-1 font-medium text-slate-900 dark:text-white">
                    {{ formatCategory(selectedCampaign.category) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    Created
                  </p>
                  <p class="mt-1 font-medium text-slate-900 dark:text-white">
                    {{ new Date(selectedCampaign.createdAt).toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    Status
                  </p>
                  <span
                    :class="getCampaignStatusClass(selectedCampaign.status)"
                    class="inline-flex px-3 py-1 mt-1 text-xs font-semibold rounded-full"
                  >
                    {{ selectedCampaign.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div
              class="p-6 border rounded-lg border-slate-200 dark:border-slate-700"
            >
              <h4
                class="mb-4 text-lg font-semibold text-slate-900 dark:text-white"
              >
                Performance Breakdown
              </h4>
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span
                      class="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >Delivery Rate</span
                    >
                    <span
                      class="text-sm font-bold text-slate-900 dark:text-white"
                      >{{ getDeliveryRate(selectedCampaign).toFixed(1) }}%</span
                    >
                  </div>
                  <div
                    class="w-full h-2 overflow-hidden bg-slate-200 rounded-full dark:bg-slate-700"
                  >
                    <div
                      class="h-full transition-all bg-blue-600"
                      :style="{
                        width: `${getDeliveryRate(selectedCampaign)}%`,
                      }"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span
                      class="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >Open Rate</span
                    >
                    <span
                      class="text-sm font-bold text-slate-900 dark:text-white"
                      >{{ getOpenRate(selectedCampaign).toFixed(1) }}%</span
                    >
                  </div>
                  <div
                    class="w-full h-2 overflow-hidden bg-slate-200 rounded-full dark:bg-slate-700"
                  >
                    <div
                      class="h-full transition-all bg-green-600"
                      :style="{ width: `${getOpenRate(selectedCampaign)}%` }"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span
                      class="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >Click Rate</span
                    >
                    <span
                      class="text-sm font-bold text-slate-900 dark:text-white"
                      >{{ getClickRate(selectedCampaign).toFixed(1) }}%</span
                    >
                  </div>
                  <div
                    class="w-full h-2 overflow-hidden bg-slate-200 rounded-full dark:bg-slate-700"
                  >
                    <div
                      class="h-full transition-all bg-purple-600"
                      :style="{ width: `${getClickRate(selectedCampaign)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Create/Edit Campaign Modal -->
    <CampaignModal
      v-if="showCreateModal"
      :campaign="editingCampaign"
      @close="closeCreateModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCampaignStore } from "../../store/admin/campaign.store";
import CampaignModal from "../../components/admin/campaigns/CampaignModal.vue";

console.log("📧 AdminCampaignsView: Component initializing...");

// Store
const campaignStore = useCampaignStore();

// State
const showCreateModal = ref(false);
const showAnalyticsModal = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const categoryFilter = ref("");
const selectedCampaign = ref(null);
const editingCampaign = ref(null);

// Computed
const totalSent = computed(() => {
  return campaignStore.campaigns.reduce(
    (sum, c) => sum + (c.stats?.sent || 0),
    0
  );
});

const avgOpenRate = computed(() => {
  const campaigns = campaignStore.campaigns.filter((c) => c.stats?.sent > 0);
  if (!campaigns.length) return 0;
  return (
    campaigns.reduce((sum, c) => {
      const rate = ((c.stats?.opened || 0) / (c.stats?.sent || 1)) * 100;
      return sum + rate;
    }, 0) / campaigns.length
  );
});

const avgClickRate = computed(() => {
  const campaigns = campaignStore.campaigns.filter((c) => c.stats?.sent > 0);
  if (!campaigns.length) return 0;
  return (
    campaigns.reduce((sum, c) => {
      const rate = ((c.stats?.clicked || 0) / (c.stats?.sent || 1)) * 100;
      return sum + rate;
    }, 0) / campaigns.length
  );
});

const deliveryRate = computed(() => {
  const totalSent = campaignStore.campaigns.reduce(
    (sum, c) => sum + (c.stats?.sent || 0),
    0
  );
  const totalDelivered = campaignStore.campaigns.reduce(
    (sum, c) => sum + (c.stats?.delivered || 0),
    0
  );
  if (!totalSent) return 0;
  return (totalDelivered / totalSent) * 100;
});

const filteredCampaigns = computed(() => {
  let filtered = [...campaignStore.campaigns];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.subject?.toLowerCase().includes(query) ||
        c.category?.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((c) => c.status === statusFilter.value);
  }

  // Category filter
  if (categoryFilter.value) {
    filtered = filtered.filter((c) => c.category === categoryFilter.value);
  }

  console.log("🔍 Filtered campaigns:", filtered.length);
  return filtered;
});

// Methods
const refreshCampaigns = async () => {
  console.log("🔄 Refreshing campaigns...");
  await campaignStore.fetchCampaigns();
  console.log("✅ Campaigns refreshed:", campaignStore.campaigns.length);
};

const getCampaignStatusClass = (status) => {
  const classes = {
    DRAFT: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
    SCHEDULED:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    PROCESSING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    COMPLETED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    CANCELLED:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };
  return classes[status] || "bg-slate-100 text-slate-800";
};

const formatCategory = (category) => {
  if (!category) return "N/A";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getOpenRate = (campaign) => {
  if (!campaign.stats?.sent) return 0;
  return ((campaign.stats?.opened || 0) / campaign.stats.sent) * 100;
};

const getClickRate = (campaign) => {
  if (!campaign.stats?.sent) return 0;
  return ((campaign.stats?.clicked || 0) / campaign.stats.sent) * 100;
};

const getDeliveryRate = (campaign) => {
  if (!campaign.stats?.sent) return 0;
  return ((campaign.stats?.delivered || 0) / campaign.stats.sent) * 100;
};

const sendCampaign = async (campaign) => {
  console.log("📤 Sending campaign:", campaign._id);

  if (
    !confirm(
      `Send "${campaign.name}" to ${
        campaign.stats?.targetCount || 0
      } recipients now?`
    )
  ) {
    return;
  }

  try {
    await campaignStore.send(campaign._id);
    console.log("✅ Campaign sent successfully");
    alert("Campaign sent successfully!");
    await refreshCampaigns();
  } catch (err) {
    console.error("❌ Error sending campaign:", err);
    alert(err.message || "Failed to send campaign");
  }
};

const deleteCampaign = async (id, status) => {
  console.log("🗑️ Deleting campaign:", id, "Status:", status);

  if (
    !confirm(
      "Are you sure you want to delete this campaign? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await campaignStore.delete(id);
    console.log("✅ Campaign deleted successfully");
    alert("Campaign deleted successfully!");
    await refreshCampaigns();
  } catch (err) {
    console.error("❌ Error deleting campaign:", err);
    console.error("❌ Error response:", err.response?.data);

    const errorMsg =
      err.response?.data?.message || err.message || "Failed to delete campaign";
    alert(`Error: ${errorMsg}`);
  }
};

const editCampaign = (campaign) => {
  console.log("✏️ Editing campaign:", campaign._id);
  editingCampaign.value = campaign;
  showCreateModal.value = true;
};

const viewAnalytics = (campaign) => {
  console.log("📊 Viewing analytics for campaign:", campaign._id);
  selectedCampaign.value = campaign;
  showAnalyticsModal.value = true;
};

const closeAnalyticsModal = () => {
  showAnalyticsModal.value = false;
  selectedCampaign.value = null;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  editingCampaign.value = null;
};

const handleSave = async (campaignData) => {
  console.log("💾 Saving campaign:", campaignData);
  console.log("📋 Campaign data details:", {
    name: campaignData.name,
    type: campaignData.type,
    category: campaignData.category,
    subject: campaignData.subject,
    emailTemplate: campaignData.emailTemplate,
    targetSegment: campaignData.targetSegment,
    sendImmediately: campaignData.sendImmediately,
    scheduledAt: campaignData.scheduledAt,
    emailContent: campaignData.emailContent,
  });

  try {
    if (editingCampaign.value) {
      await campaignStore.updateCampaign(
        editingCampaign.value._id,
        campaignData
      );
      console.log("✅ Campaign updated successfully");
    } else {
      const result = await campaignStore.createCampaign(campaignData);
      console.log("✅ Campaign created successfully:", result);
    }

    closeCreateModal();
    await refreshCampaigns();
  } catch (err) {
    console.error("❌ Error saving campaign:", err);
    console.error("❌ Error response data:", err.response?.data);
    console.error("❌ Error response status:", err.response?.status);
    console.error(
      "❌ Full error object:",
      JSON.stringify(err.response, null, 2)
    );

    // Hiển thị error message chi tiết
    const errorData = err.response?.data;
    let errorMsg = "Failed to save campaign";

    if (errorData) {
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMsg = `Validation errors:\n${errorData.errors.join("\n")}`;
      } else if (errorData.message) {
        errorMsg = errorData.message;
      } else if (errorData.error) {
        errorMsg = errorData.error;
      }
    } else {
      errorMsg = err.message;
    }

    console.error("❌ Final error message:", errorMsg);
    alert(`Error: ${errorMsg}`);
  }
};

const createChristmasCampaign = () => {
  console.log("🎄 Creating Christmas campaign...");

  // Pre-fill with Christmas template
  editingCampaign.value = {
    name: "Christmas Sale 2025",
    category: "PROMOTION",
    template: "christmas2025",
    subject: "🎄 Merry Christmas! Special 50% OFF Just For You 🎁",
    previewText: "Celebrate this magical season with exclusive beauty offers!",
    targetAudience: {
      type: "all",
      segments: [],
      userIds: [],
    },
    contentData: {
      message:
        "Wishing you a magical Christmas filled with joy, love, and beauty! 🌟",
      discount: "50",
      actionUrl: "https://shinybeauty.com/christmas-sale",
      endsAt: "2025-12-26T23:59:59.000Z",
      additionalMessage:
        "Free gift wrapping on all Christmas orders! Plus free shipping over $50.",
    },
    scheduledAt: null,
    excludePreviousRecipients: false,
  };

  showCreateModal.value = true;
};

// Lifecycle
onMounted(() => {
  console.log("🎬 AdminCampaignsView mounted, fetching campaigns...");
  refreshCampaigns();
});
</script>
