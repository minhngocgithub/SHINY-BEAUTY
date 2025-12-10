<template>
  <div class="min-h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white">
          Shipping Management
        </h1>
        <p class="mt-2 text-slate-600 dark:text-slate-400">
          Track and manage order shipments
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="refreshOrders"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            class="w-5 h-5"
            :class="{ 'animate-spin': loading }"
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
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-6">
      <div
        class="p-6 transition-shadow bg-white rounded-xl shadow-sm hover:shadow-md dark:bg-slate-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              📋 All
            </p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {{ stats.all }}
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
              ⏳ Pending
            </p>
            <p class="mt-2 text-3xl font-bold text-orange-600">
              {{ stats.pending }}
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
              ✅ Confirmed
            </p>
            <p class="mt-2 text-3xl font-bold text-blue-600">
              {{ stats.confirmed }}
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
              📦 Preparing
            </p>
            <p class="mt-2 text-3xl font-bold text-purple-600">
              {{ stats.preparing }}
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
              🚚 In Transit
            </p>
            <p class="mt-2 text-3xl font-bold text-yellow-600">
              {{ stats.inTransit }}
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
              🎉 Delivered
            </p>
            <p class="mt-2 text-3xl font-bold text-green-600">
              {{ stats.delivered }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="p-6 mb-6 bg-white rounded-xl shadow-sm dark:bg-slate-800">
      <div class="grid gap-4 md:grid-cols-4">
        <div>
          <label
            class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >Search</label
          >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Order ID, customer, tracking..."
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
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>

        <div>
          <label
            class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >Payment Status</label
          >
          <select
            v-model="paymentFilter"
            class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="true">Paid</option>
            <option value="false">Unpaid</option>
          </select>
        </div>

        <div>
          <label
            class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >Sort By</label
          >
          <select
            v-model="sortBy"
            class="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-total">Highest Value</option>
            <option value="total">Lowest Value</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div
        class="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
      ></div>
    </div>

    <!-- Orders Table -->
    <div
      v-else
      class="overflow-hidden bg-white rounded-xl shadow-sm dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Order ID
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Customer
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Status
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Payment
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Tracking
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Destination
              </th>
              <th
                class="px-6 py-4 text-xs font-semibold text-left uppercase text-slate-600 dark:text-slate-300"
              >
                Total
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
              v-for="order in filteredOrders"
              :key="order._id"
              class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td class="px-6 py-4">
                <code
                  class="px-2 py-1 text-xs font-mono font-semibold rounded bg-slate-100 dark:bg-slate-700"
                >
                  #{{ order._id?.slice(-8).toUpperCase() }}
                </code>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-500"
                  >
                    {{ order.user?.name?.charAt(0).toUpperCase() || "?" }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">
                      {{ order.user?.name || "N/A" }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ order.user?.email || "" }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <span
                  :class="getStatusClass(order.status)"
                  class="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full"
                >
                  <span class="w-2 h-2 rounded-full bg-current"></span>
                  {{ order.status }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span v-if="order.isPaid" class="text-green-600">
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  <span v-else class="text-orange-600">
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  <span
                    class="text-xs font-medium"
                    :class="order.isPaid ? 'text-green-600' : 'text-orange-600'"
                  >
                    {{ order.isPaid ? "Paid" : "Unpaid" }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-slate-500">
                  {{ order.paymentMethod }}
                </p>
              </td>

              <td class="px-6 py-4">
                <code
                  v-if="order.trackingNumber"
                  class="px-2 py-1 text-xs font-mono rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  {{ order.trackingNumber }}
                </code>
                <button
                  v-else
                  @click="openTrackingModal(order)"
                  class="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  + Add tracking
                </button>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="font-medium text-slate-900 dark:text-white">
                    {{ order.shippingAddress?.city || "N/A" }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ order.shippingAddress?.district }},
                    {{ order.shippingAddress?.ward }}
                  </p>
                </div>
              </td>

              <td class="px-6 py-4">
                <p class="font-bold text-slate-900 dark:text-white">
                  ${{ (order.totalPrice || order.total || 0).toFixed(2) }}
                </p>
                <p class="text-xs text-slate-500">
                  {{
                    order.orderItems?.length || order.items?.length || 0
                  }}
                  items
                </p>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openStatusModal(order)"
                    class="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Update Status"
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
                    @click="viewOrderDetails(order)"
                    class="p-2 text-slate-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="View Details"
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredOrders.length === 0" class="py-16 text-center">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p
            class="mt-4 text-lg font-medium text-slate-600 dark:text-slate-400"
          >
            No orders found
          </p>
          <p class="mt-1 text-sm text-slate-500">Try adjusting your filters</p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700"
      >
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Showing {{ (currentPage - 1) * limit + 1 }} to
          {{ Math.min(currentPage * limit, totalOrders) }} of
          {{ totalOrders }} orders
        </p>
        <div class="flex gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border rounded-lg dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border rounded-lg dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <teleport to="body">
      <div
        v-if="showStatusModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeStatusModal"
      >
        <div
          class="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl dark:bg-slate-800 animate-fadeIn"
        >
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
              Update Order Status
            </h3>
            <button
              @click="closeStatusModal"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >New Status</label
              >
              <select
                v-model="editForm.status"
                class="w-full px-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >Notes (Optional)</label
              >
              <textarea
                v-model="editForm.notes"
                rows="3"
                placeholder="Add any notes about this status update..."
                class="w-full px-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="closeStatusModal"
              class="flex-1 px-4 py-3 font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              @click="saveStatus"
              :disabled="updating"
              class="flex-1 px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ updating ? "Updating..." : "Update Status" }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Add Tracking Modal -->
    <teleport to="body">
      <div
        v-if="showTrackingModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeTrackingModal"
      >
        <div
          class="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl dark:bg-slate-800 animate-fadeIn"
        >
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
              Add Tracking Number
            </h3>
            <button
              @click="closeTrackingModal"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >Tracking Number</label
              >
              <input
                v-model="trackingForm.trackingNumber"
                type="text"
                placeholder="e.g., TRK123456789"
                class="w-full px-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                class="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >Carrier (Optional)</label
              >
              <input
                v-model="trackingForm.carrier"
                type="text"
                placeholder="e.g., DHL, FedEx, UPS"
                class="w-full px-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="closeTrackingModal"
              class="flex-1 px-4 py-3 font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              @click="saveTracking"
              :disabled="updating"
              class="flex-1 px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ updating ? "Saving..." : "Save Tracking" }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAdminOrderStore } from "../../store/admin/adminOrder.store";
import {
  updateOrderStatusApi,
  updateTrackingApi,
} from "../../service/admin.service";

console.log("🚚 AdminShippingView: Component initializing...");

// Store
const orderStore = useAdminOrderStore();

// State
const loading = ref(false);
const updating = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const paymentFilter = ref("");
const sortBy = ref("-createdAt");
const currentPage = ref(1);
const limit = ref(20);

// Modals
const showStatusModal = ref(false);
const showTrackingModal = ref(false);
const selectedOrder = ref(null);

const editForm = ref({
  status: "",
  notes: "",
});

const trackingForm = ref({
  trackingNumber: "",
  carrier: "",
});

// Computed
const orders = computed(() => orderStore.allOrders || []);
const totalOrders = computed(() => orderStore.totalOrders || 0);
const totalPages = computed(() => orderStore.totalPages || 1);

const stats = computed(() => {
  const all = orders.value.length;
  const pending = orders.value.filter((o) => o.status === "PENDING").length;
  const confirmed = orders.value.filter((o) => o.status === "CONFIRMED").length;
  const preparing = orders.value.filter((o) => o.status === "PREPARING").length;
  const inTransit = orders.value.filter((o) =>
    ["IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)
  ).length;
  const delivered = orders.value.filter((o) => o.status === "DELIVERED").length;

  console.log("📊 Stats calculated:", {
    all,
    pending,
    confirmed,
    preparing,
    inTransit,
    delivered,
  });

  return { all, pending, confirmed, preparing, inTransit, delivered };
});

// Use orders directly from store (already filtered by backend)
const filteredOrders = computed(() => orders.value);

// Methods
const refreshOrders = async () => {
  console.log("🔄 Refreshing orders...");
  loading.value = true;

  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      sort: sortBy.value,
    };

    // Add filters to params
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    if (paymentFilter.value) {
      params.paymentStatus =
        paymentFilter.value === "true" ? "paid" : "pending";
    }
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    await orderStore.fetchAllOrders(params);
    console.log("✅ Orders refreshed:", orderStore.allOrders.length);
  } catch (error) {
    console.error("❌ Error refreshing orders:", error);
  } finally {
    loading.value = false;
  }
};

const getStatusClass = (status) => {
  const classes = {
    PENDING:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    CONFIRMED:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    PREPARING:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    IN_TRANSIT:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    OUT_FOR_DELIVERY:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    DELIVERED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    classes[status] ||
    "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
  );
};

const openStatusModal = (order) => {
  console.log("🔧 Opening status modal for order:", order._id);
  selectedOrder.value = order;
  editForm.value = {
    status: order.status,
    notes: "",
  };
  showStatusModal.value = true;
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  selectedOrder.value = null;
  editForm.value = { status: "", notes: "" };
};

const saveStatus = async () => {
  if (!selectedOrder.value) return;

  console.log("💾 Saving status update for order:", selectedOrder.value._id);
  updating.value = true;

  try {
    const response = await updateOrderStatusApi(selectedOrder.value._id, {
      status: editForm.value.status,
      notes: editForm.value.notes,
    });

    console.log("✅ Status updated:", response);

    // Update local order
    const index = orders.value.findIndex(
      (o) => o._id === selectedOrder.value._id
    );
    if (index !== -1) {
      orders.value[index].status = editForm.value.status;
    }

    closeStatusModal();
    await refreshOrders();
  } catch (error) {
    console.error("❌ Error updating status:", error);
    alert("Failed to update status. Please try again.");
  } finally {
    updating.value = false;
  }
};

const openTrackingModal = (order) => {
  console.log("📦 Opening tracking modal for order:", order._id);
  selectedOrder.value = order;
  trackingForm.value = {
    trackingNumber: order.trackingNumber || "",
    carrier: order.carrier || "",
  };
  showTrackingModal.value = true;
};

const closeTrackingModal = () => {
  showTrackingModal.value = false;
  selectedOrder.value = null;
  trackingForm.value = { trackingNumber: "", carrier: "" };
};

const saveTracking = async () => {
  if (!selectedOrder.value || !trackingForm.value.trackingNumber) {
    alert("Please enter a tracking number");
    return;
  }

  console.log("📦 Saving tracking for order:", selectedOrder.value._id);
  updating.value = true;

  try {
    const response = await updateTrackingApi(selectedOrder.value._id, {
      trackingNumber: trackingForm.value.trackingNumber,
      carrier: trackingForm.value.carrier,
    });

    console.log("✅ Tracking updated:", response);

    // Update local order
    const index = orders.value.findIndex(
      (o) => o._id === selectedOrder.value._id
    );
    if (index !== -1) {
      orders.value[index].trackingNumber = trackingForm.value.trackingNumber;
      orders.value[index].carrier = trackingForm.value.carrier;
    }

    closeTrackingModal();
    await refreshOrders();
  } catch (error) {
    console.error("❌ Error updating tracking:", error);
    alert("Failed to update tracking. Please try again.");
  } finally {
    updating.value = false;
  }
};

const viewOrderDetails = (order) => {
  console.log("👁️ Viewing order details:", order._id);
  // TODO: Navigate to order details page or open modal
  alert(
    `Order details for #${order._id
      .slice(-8)
      .toUpperCase()} - Feature coming soon!`
  );
};

// Watchers
watch(currentPage, () => {
  console.log("📄 Page changed to:", currentPage.value);
  refreshOrders();
});

watch(sortBy, () => {
  console.log("🔀 Sort changed to:", sortBy.value);
  currentPage.value = 1; // Reset to first page
  refreshOrders();
});

watch([statusFilter, paymentFilter, searchQuery], () => {
  console.log("🔍 Filters changed:", {
    status: statusFilter.value,
    payment: paymentFilter.value,
    search: searchQuery.value,
  });
  currentPage.value = 1; // Reset to first page when filtering
  refreshOrders();
});

// Lifecycle
onMounted(() => {
  console.log("🎬 AdminShippingView mounted, fetching orders...");
  refreshOrders();
});
</script>
