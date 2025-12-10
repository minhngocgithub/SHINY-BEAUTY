<template>
  <div class="h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header with Stats -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            Users Management
          </h1>
          <p class="mt-1 text-slate-600 dark:text-slate-400">
            Manage customers and admin accounts
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="lastUpdated"
            class="text-xs text-slate-500 dark:text-slate-400"
          >
            <span
              class="inline-block w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"
            ></span>
            Updated {{ formatRelativeTime(lastUpdated) }}
          </div>
          <button
            @click="fetchUsers"
            :disabled="loading"
            class="p-2 transition-colors text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            title="Refresh"
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
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          class="p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Users
              </p>
              <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {{ stats.totalUsers || 0 }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                <span
                  :class="
                    stats.newUsersThisWeek > 0
                      ? 'text-green-600'
                      : 'text-slate-500'
                  "
                >
                  +{{ stats.newUsersThisWeek || 0 }}
                </span>
                this week
              </p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/20">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Customers
              </p>
              <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {{ stats.activeUsers || 0 }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{
                  ((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(
                    1
                  )
                }}% of total
              </p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg dark:bg-green-900/20">
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
          </div>
        </div>

        <div
          class="p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                Admin Users
              </p>
              <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {{ stats.adminUsers || 0 }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{
                  ((stats.adminUsers / stats.totalUsers) * 100 || 0).toFixed(1)
                }}% of total
              </p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/20">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                Banned Users
              </p>
              <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {{ stats.bannedUsers || 0 }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{
                  stats.bannedUsers > 0
                    ? ((stats.bannedUsers / stats.totalUsers) * 100).toFixed(1)
                    : 0
                }}% of total
              </p>
            </div>
            <div class="p-3 bg-red-100 rounded-lg dark:bg-red-900/20">
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
          </div>
        </div>
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
            Filters & Search
          </h3>
          <span
            v-if="hasActiveFilters"
            class="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
          >
            {{ activeFilterCount }} active
          </span>
        </div>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Clear all
        </button>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
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
            placeholder="Search by name, email or phone..."
            class="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div class="relative">
          <select
            v-model="filters.role"
            @change="fetchUsers"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">👥 All Roles</option>
            <option value="user">🛍️ Customers</option>
            <option value="admin">🔐 Administrators</option>
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

        <div class="relative">
          <select
            v-model="filters.status"
            @change="fetchUsers"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">📊 All Status</option>
            <option value="active">✅ Active</option>
            <option value="banned">🚫 Banned</option>
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

        <div class="relative">
          <select
            v-model="filters.loyaltyTier"
            @change="fetchUsers"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">⭐ All Tiers</option>
            <option value="Bronze">🥉 Bronze</option>
            <option value="Silver">🥈 Silver</option>
            <option value="Gold">🥇 Gold</option>
            <option value="Platinum">💎 Platinum</option>
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
      </div>

      <!-- Advanced Filters Toggle -->
      <div class="mt-4">
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <svg
            :class="{ 'rotate-180': showAdvancedFilters }"
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

      <!-- Advanced Filters -->
      <div
        v-if="showAdvancedFilters"
        class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Order Range
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="filters.minOrders"
                type="number"
                min="0"
                placeholder="Min"
                class="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <span class="text-slate-500">-</span>
              <input
                v-model.number="filters.maxOrders"
                type="number"
                min="0"
                placeholder="Max"
                class="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Total Spent Range
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="filters.minSpent"
                type="number"
                min="0"
                step="0.01"
                placeholder="Min $"
                class="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <span class="text-slate-500">-</span>
              <input
                v-model.number="filters.maxSpent"
                type="number"
                min="0"
                step="0.01"
                placeholder="Max $"
                class="w-full px-3 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Sort By
            </label>
            <select
              v-model="filters.sortBy"
              @change="fetchUsers"
              class="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-totalOrders">Most Orders</option>
              <option value="-totalSpent">Highest Spending</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-4">
          <button
            @click="applyAdvancedFilters"
            class="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loading />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
    >
      <p class="text-red-800 dark:text-red-200">{{ error }}</p>
    </div>

    <!-- Users Table -->
    <div
      v-else
      class="overflow-hidden bg-white border shadow-lg dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700"
    >
      <!-- Table Header with Actions -->
      <div
        class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700"
      >
        <div class="flex items-center gap-4">
          <h3 class="font-semibold text-slate-900 dark:text-white">
            User List
            <span class="ml-2 text-sm font-normal text-slate-500">
              ({{ filteredUsers.length }}
              {{ filteredUsers.length === 1 ? "user" : "users" }})
            </span>
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="exportUsers"
            class="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                User
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Contact
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Role
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Loyalty
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Orders
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Total Spent
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Status
              </th>
              <th
                class="px-4 py-3 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr
              v-for="user in users"
              :key="user._id"
              class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <img
                      :src="
                        user.avatar?.url || user.avatar || '/default-avatar.png'
                      "
                      :alt="user.name"
                      class="object-cover w-10 h-10 rounded-full ring-2 ring-slate-100 dark:ring-slate-700"
                    />
                    <span
                      v-if="isUserOnline(user._id)"
                      class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-slate-800"
                      title="Online"
                    ></span>
                  </div>
                  <div>
                    <div class="font-medium text-slate-900 dark:text-white">
                      {{ user.name }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">
                      Joined {{ formatDate(user.createdAt) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm">
                  <div class="text-slate-900 dark:text-white">
                    {{ user.email }}
                  </div>
                  <div
                    v-if="user.phone"
                    class="text-xs text-slate-500 dark:text-slate-400"
                  >
                    {{ user.phone }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <select
                  :value="user.isAdmin ? 'admin' : 'user'"
                  @change="changeUserRole(user._id, $event.target.value)"
                  :disabled="user._id === currentUserId"
                  class="px-2 py-1 text-xs font-medium transition-colors bg-white border rounded-lg dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400"
                >
                  <option value="user">👤 Customer</option>
                  <option value="admin">🔐 Admin</option>
                </select>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span
                    :class="getLoyaltyColor(user.loyaltyTier)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ user.loyaltyTier || "Bronze" }}
                  </span>
                  <span
                    v-if="
                      user.loyaltyPoints !== undefined &&
                      user.loyaltyPoints !== null
                    "
                    class="text-xs text-slate-500 dark:text-slate-400"
                  >
                    {{ user.loyaltyPoints }} pts
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="viewUserOrders(user)"
                  class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                >
                  {{ user.totalOrders || 0 }}
                </button>
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-sm font-medium text-slate-900 dark:text-white"
                >
                  ${{ (user.totalSpent || 0).toFixed(2) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="toggleUserStatus(user)"
                  :disabled="user._id === currentUserId"
                  :class="
                    user.isBanned
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  "
                  class="px-2 py-1 text-xs font-medium transition-all rounded-full hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ user.isBanned ? "🚫 Banned" : "✅ Active" }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    @click="viewUserDetail(user)"
                    class="p-1.5 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="View Details"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button
                    v-if="user._id !== currentUserId"
                    @click="deleteUser(user._id)"
                    class="p-1.5 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete User"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="users.length === 0 && !loading" class="py-12 text-center">
        <p class="text-slate-600 dark:text-slate-400">No users found</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700"
      >
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Showing {{ users.length }} of {{ totalUsers }} users
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span class="px-3 py-1 text-sm"
            >Page {{ currentPage }} of {{ totalPages }}</span
          >
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <UserDetailModal
      v-if="selectedUser"
      :user="selectedUser"
      @close="selectedUser = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  getAllUsersApi,
  updateUserApi,
  toggleUserBanApi,
  deleteUserApi,
} from "../../service/admin.service";
import { useAuthStore } from "../../store/auth.store";
import UserDetailModal from "../../components/admin/users/UserDetailModal.vue";
import Loading from "../../components/Loading.vue";

const router = useRouter();
const authStore = useAuthStore();

// Reactive state
const users = ref([]);
const allUsers = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedUser = ref(null);
const lastUpdated = ref(null);
const showAdvancedFilters = ref(false);
const onlineUsers = ref(new Set());

const filters = ref({
  search: "",
  role: "",
  status: "",
  loyaltyTier: "",
  minOrders: null,
  maxOrders: null,
  minSpent: null,
  maxSpent: null,
  sortBy: "-createdAt",
});

const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const limit = ref(20);
const searchTimeout = ref(null);
const currentUserId = ref(null);

// Stats
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  bannedUsers: 0,
  adminUsers: 0,
  newUsersThisWeek: 0,
});

// Computed
const filteredUsers = computed(() => allUsers.value);

const hasActiveFilters = computed(() => {
  return (
    filters.value.search ||
    filters.value.role ||
    filters.value.status ||
    filters.value.loyaltyTier ||
    filters.value.minOrders ||
    filters.value.maxOrders ||
    filters.value.minSpent ||
    filters.value.maxSpent
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.role) count++;
  if (filters.value.status) count++;
  if (filters.value.loyaltyTier) count++;
  if (filters.value.minOrders || filters.value.maxOrders) count++;
  if (filters.value.minSpent || filters.value.maxSpent) count++;
  return count;
});

// Methods
const calculateStats = (usersList) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  stats.value = {
    totalUsers: usersList.length,
    activeUsers: usersList.filter((u) => !u.isBanned).length,
    bannedUsers: usersList.filter((u) => u.isBanned).length,
    adminUsers: usersList.filter((u) => u.isAdmin).length,
    newUsersThisWeek: usersList.filter(
      (u) => new Date(u.createdAt) > oneWeekAgo
    ).length,
  };
};
const fetchUsers = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params = {};

    const response = await getAllUsersApi(params);

    allUsers.value = response.users || [];
    let filteredList = [...allUsers.value];

    // Apply search filter
    if (filters.value.search && filters.value.search.trim()) {
      const searchTerm = filters.value.search.toLowerCase();
      filteredList = filteredList.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply role filter
    if (filters.value.role) {
      if (filters.value.role === "admin") {
        filteredList = filteredList.filter((user) => user.isAdmin === true);
      } else if (filters.value.role === "user") {
        filteredList = filteredList.filter((user) => user.isAdmin !== true);
      }
    }

    // Apply status filter
    if (filters.value.status) {
      if (filters.value.status === "banned") {
        filteredList = filteredList.filter((user) => user.isBanned === true);
      } else if (filters.value.status === "active") {
        filteredList = filteredList.filter((user) => user.isBanned !== true);
      }
    }

    // Apply loyalty tier filter
    if (filters.value.loyaltyTier) {
      filteredList = filteredList.filter(
        (user) => user.loyaltyTier === filters.value.loyaltyTier
      );
    }

    // Apply advanced filters
    if (filters.value.minOrders !== null && filters.value.minOrders !== "") {
      filteredList = filteredList.filter(
        (user) => (user.totalOrders || 0) >= filters.value.minOrders
      );
    }
    if (filters.value.maxOrders !== null && filters.value.maxOrders !== "") {
      filteredList = filteredList.filter(
        (user) => (user.totalOrders || 0) <= filters.value.maxOrders
      );
    }
    if (filters.value.minSpent !== null && filters.value.minSpent !== "") {
      filteredList = filteredList.filter(
        (user) => (user.totalSpent || 0) >= filters.value.minSpent
      );
    }
    if (filters.value.maxSpent !== null && filters.value.maxSpent !== "") {
      filteredList = filteredList.filter(
        (user) => (user.totalSpent || 0) <= filters.value.maxSpent
      );
    }

    // Apply sorting
    if (filters.value.sortBy) {
      const sortField = filters.value.sortBy.replace("-", "");
      const isDesc = filters.value.sortBy.startsWith("-");

      filteredList.sort((a, b) => {
        let aVal = a[sortField] || 0;
        let bVal = b[sortField] || 0;

        if (sortField === "name") {
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          return isDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        }

        if (sortField === "createdAt") {
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
        }

        return isDesc ? bVal - aVal : aVal - bVal;
      });
    }

    // Calculate stats from all users
    calculateStats(allUsers.value);

    // Pagination
    totalUsers.value = filteredList.length;
    totalPages.value = Math.ceil(filteredList.length / limit.value);

    const start = (currentPage.value - 1) * limit.value;
    const end = start + limit.value;
    users.value = filteredList.slice(start, end);

    lastUpdated.value = new Date();
  } catch (err) {
    console.error("Failed to fetch users:", err);
    error.value = err.response?.data?.message || "Failed to load users";
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchUsers();
  }, 500);
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchUsers();
  }
};

const changeUserRole = async (userId, newRole) => {
  if (!confirm(`Change user role to ${newRole}?`)) return;

  try {
    const isAdmin = newRole === "admin";
    await updateUserApi(userId, { isAdmin });
    await fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to change user role");
  }
};

const toggleUserStatus = async (user) => {
  const action = user.isBanned ? "unban" : "ban";
  if (!confirm(`Are you sure you want to ${action} this user?`)) return;

  try {
    const isBanned = !user.isBanned;
    await updateUserApi(user._id, { isBanned });
    await fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update user status");
  }
};

const deleteUser = async (userId) => {
  if (!confirm("Permanently delete this user? This cannot be undone.")) return;

  try {
    await deleteUserApi(userId);
    await fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete user");
  }
};

const viewUserDetail = (user) => {
  selectedUser.value = user;
};

const viewUserOrders = (user) => {
  router.push({ name: "AdminOrders", query: { userId: user._id } });
};

const getLoyaltyColor = (tier) => {
  const colors = {
    Bronze: "bg-orange-100 text-orange-800",
    Silver: "bg-slate-200 text-slate-800",
    Gold: "bg-yellow-100 text-yellow-800",
    Platinum: "bg-purple-100 text-purple-800",
  };
  return colors[tier] || colors.Bronze;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatRelativeTime = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const applyAdvancedFilters = () => {
  currentPage.value = 1;
  fetchUsers();
};

const clearFilters = () => {
  filters.value = {
    search: "",
    role: "",
    status: "",
    loyaltyTier: "",
    minOrders: null,
    maxOrders: null,
    minSpent: null,
    maxSpent: null,
    sortBy: "-createdAt",
  };
  currentPage.value = 1;
  fetchUsers();
};

const isUserOnline = (userId) => {
  return onlineUsers.value.has(userId);
};

const exportUsers = () => {
  // Export users to CSV
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Role",
    "Status",
    "Loyalty Tier",
    "Total Orders",
    "Total Spent",
    "Joined Date",
  ];
  const rows = allUsers.value.map((user) => [
    user.name,
    user.email,
    user.phone || "N/A",
    user.isAdmin ? "Admin" : "Customer",
    user.isBanned ? "Banned" : "Active",
    user.loyaltyTier || "Bronze",
    user.totalOrders || 0,
    (user.totalSpent || 0).toFixed(2),
    formatDate(user.createdAt),
  ]);

  let csv = headers.join(",") + "\n";
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Lifecycle
onMounted(async () => {
  currentUserId.value = authStore.user?._id;
  await fetchUsers();
});
</script>
