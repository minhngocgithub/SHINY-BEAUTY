<template>
  <div class="space-y-6">
    <div
      class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-700">
            Shipping Addresses
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Manage your delivery addresses
          </p>
        </div>
        <button
          @click="$emit('add-address')"
          class="px-4 py-2 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500"
        >
          + Add Address
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 border-b-2 rounded-full animate-spin border-rose-400"
          ></div>
          <span class="text-gray-500">Loading addresses...</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasAddresses" class="py-16 text-center">
        <div class="mb-4 text-6xl">📍</div>
        <h3 class="mb-2 text-lg font-semibold text-gray-700">
          No shipping addresses
        </h3>
        <p class="mb-6 text-sm text-gray-500">
          Add your first address for faster checkout
        </p>
        <button
          @click="$emit('add-address')"
          class="px-6 py-2 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500"
        >
          Add Address Now
        </button>
      </div>

      <!-- Addresses List -->
      <div v-else class="space-y-4">
        <div
          v-for="address in addresses"
          :key="address._id"
          class="relative p-5 transition-all duration-200 border border-gray-200 rounded-2xl hover:shadow-md hover:border-rose-200 group"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Address Info -->
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-base font-semibold text-gray-800">
                  {{ address.fullName }}
                </h3>
                <span
                  v-if="address.isDefault"
                  class="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full border border-rose-200"
                >
                  Default
                </span>
              </div>

              <div class="space-y-1 text-sm text-gray-600">
                <p class="flex items-center gap-2">
                  <span class="text-gray-400"></span>
                  {{ address.phone }}
                </p>
                <p class="flex items-start gap-2">
                  <span class="mt-0.5 text-gray-400"></span>
                  <span>
                    {{ address.street }}
                    <span v-if="address.ward">, {{ address.ward }}</span>
                    , {{ address.district }}, {{ address.city }}
                    <span v-if="address.postalCode">
                      - {{ address.postalCode }}</span
                    >
                  </span>
                </p>
                <p
                  v-if="address.country"
                  class="flex items-center gap-2 text-xs text-gray-500"
                >
                  <span>🌍</span>
                  {{ address.country }}
                </p>
              </div>

              <!-- Usage Stats -->
              <div
                v-if="address.orderCount"
                class="flex items-center gap-3 pt-2 mt-3 text-xs text-gray-500 border-t border-gray-100"
              >
                <span
                  >Used in {{ address.orderCount }} order{{
                    address.orderCount > 1 ? "s" : ""
                  }}</span
                >
                <span v-if="address.lastUsed"
                  >• Last used {{ formatLastUsed(address.lastUsed) }}</span
                >
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2">
              <button
                @click="$emit('edit-address', address)"
                class="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700"
              >
                Edit
              </button>
              <button
                v-if="!address.isDefault"
                @click="$emit('set-default', address._id)"
                class="px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700"
              >
                Set Default
              </button>
              <button
                @click="$emit('delete-address', address._id)"
                class="px-3 py-1.5 text-xs font-medium text-red-600 transition-colors bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Note -->
      <div
        v-if="hasAddresses"
        class="p-4 mt-6 border border-blue-100 bg-blue-50/50 rounded-xl"
      >
        <p class="text-sm text-blue-700">
          💡 <strong>Note:</strong> Addresses are saved from your orders and
          will be available for future checkouts.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  addresses: {
    type: Array,
    default: () => [],
  },
  hasAddresses: Boolean,
  loading: Boolean,
});

defineEmits(["add-address", "edit-address", "delete-address", "set-default"]);

const formatLastUsed = (date) => {
  if (!date) return "";

  const now = new Date();
  const lastUsed = new Date(date);
  const diffDays = Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>