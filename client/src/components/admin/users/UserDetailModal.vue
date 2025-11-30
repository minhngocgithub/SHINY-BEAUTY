<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700"
      >
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
          User Details
        </h2>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600"
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
        <!-- Profile Section -->
        <div class="flex items-start gap-4">
          <img
            :src="user.avatar || '/default-avatar.png'"
            :alt="user.name"
            class="w-20 h-20 rounded-full object-cover"
          />
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
              {{ user.name }}
            </h3>
            <p class="text-slate-600 dark:text-slate-400">{{ user.email }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span
                :class="
                  user.isAdmin
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                "
                class="px-2 py-1 rounded text-xs font-medium"
              >
                {{ user.isAdmin ? "Admin" : "Customer" }}
              </span>
              <span
                :class="
                  user.isBanned
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                "
                class="px-2 py-1 rounded text-xs font-medium"
              >
                {{ user.isBanned ? "Banned" : "Active" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="text-sm font-medium text-slate-700 dark:text-slate-300"
              >Phone</label
            >
            <p class="text-slate-900 dark:text-white">
              {{ user.phone || "N/A" }}
            </p>
          </div>
          <div>
            <label
              class="text-sm font-medium text-slate-700 dark:text-slate-300"
              >Member Since</label
            >
            <p class="text-slate-900 dark:text-white">
              {{ formatDate(user.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Loyalty Program -->
        <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 class="font-semibold text-slate-900 dark:text-white mb-3">
            Loyalty Program
          </h4>
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
              <div class="text-sm text-slate-600 dark:text-slate-400">Tier</div>
              <div class="text-lg font-bold text-slate-900 dark:text-white">
                {{ user.loyaltyTier || "Bronze" }}
              </div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
              <div class="text-sm text-slate-600 dark:text-slate-400">
                Points
              </div>
              <div class="text-lg font-bold text-slate-900 dark:text-white">
                {{ user.loyaltyPoints || 0 }}
              </div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
              <div class="text-sm text-slate-600 dark:text-slate-400">
                Total Spent
              </div>
              <div class="text-lg font-bold text-slate-900 dark:text-white">
                ${{ (user.totalSpent || 0).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Order Statistics -->
        <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 class="font-semibold text-slate-900 dark:text-white mb-3">
            Order Statistics
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
              <div class="text-sm text-slate-600 dark:text-slate-400">
                Total Orders
              </div>
              <div class="text-lg font-bold text-slate-900 dark:text-white">
                {{ user.totalOrders || 0 }}
              </div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded">
              <div class="text-sm text-slate-600 dark:text-slate-400">
                Completed Orders
              </div>
              <div class="text-lg font-bold text-green-600">
                {{ user.completedOrders || 0 }}
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Addresses -->
        <div
          v-if="user.addresses && user.addresses.length > 0"
          class="border-t border-slate-200 dark:border-slate-700 pt-4"
        >
          <h4 class="font-semibold text-slate-900 dark:text-white mb-3">
            Shipping Addresses
          </h4>
          <div class="space-y-2">
            <div
              v-for="(address, index) in user.addresses"
              :key="index"
              class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium text-slate-900 dark:text-white">
                    {{ address.fullName }}
                  </div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">
                    {{ address.phone }}
                  </div>
                  <div class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {{ address.address }}, {{ address.ward }},
                    {{ address.district }}, {{ address.city }}
                  </div>
                </div>
                <span
                  v-if="address.isDefault"
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                >
                  Default
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Last Activity -->
        <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 class="font-semibold text-slate-900 dark:text-white mb-3">
            Activity
          </h4>
          <div class="text-sm text-slate-600 dark:text-slate-400">
            Last login:
            {{ user.lastLogin ? formatDate(user.lastLogin) : "Never" }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="border-t border-slate-200 dark:border-slate-700 p-6 flex justify-end gap-3"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Close
        </button>
        <button
          @click="viewOrders"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          View Orders
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserDetailModal",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    viewOrders() {
      this.$router.push({
        name: "AdminOrders",
        query: { userId: this.user._id },
      });
      this.$emit("close");
    },
  },
};
</script>
