<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
      >
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center"
        >
          <div>
            <h3 class="text-xl font-bold text-white">Order Details</h3>
            <p class="text-blue-100 text-sm mt-1">
              {{ order.orderNumber || order._id }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white hover:text-gray-200"
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

        <!-- Loading State -->
        <div v-if="loading" class="p-8 flex justify-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"
          ></div>
        </div>

        <!-- Content -->
        <div v-else class="max-h-[80vh] overflow-y-auto">
          <!-- Order Info Grid -->
          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-900"
          >
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Customer</p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ order.user?.name }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ order.user?.email }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Total Amount
              </p>
              <p class="font-bold text-2xl text-blue-600 dark:text-blue-400">
                ${{ order.totalPrice?.toFixed(2) }}
              </p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex -mb-px">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-6 py-3 font-medium text-sm border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Items Tab -->
            <div v-if="activeTab === 'items'">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-4">
                Order Items
              </h4>
              <div class="space-y-4">
                <div
                  v-for="item in order.orderItems"
                  :key="item._id"
                  class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <img
                    :src="item.product?.images?.[0] || '/placeholder.png'"
                    :alt="item.product?.name"
                    class="w-20 h-20 object-cover rounded"
                  />
                  <div class="flex-1">
                    <h5 class="font-semibold text-gray-900 dark:text-white">
                      {{ item.product?.name }}
                    </h5>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {{ item.quantity }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Price: ${{ item.price?.toFixed(2) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900 dark:text-white">
                      ${{ (item.price * item.quantity).toFixed(2) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div
                class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >${{ order.itemsPrice?.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >${{ order.shippingPrice?.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Tax</span>
                  <span class="font-medium text-gray-900 dark:text-white"
                    >${{ order.taxPrice?.toFixed(2) }}</span
                  >
                </div>
                <div
                  class="flex justify-between text-lg font-bold border-t border-blue-200 dark:border-blue-700 pt-2"
                >
                  <span class="text-gray-900 dark:text-white">Total</span>
                  <span class="text-blue-600 dark:text-blue-400"
                    >${{ order.totalPrice?.toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Timeline Tab -->
            <div v-else-if="activeTab === 'timeline'" class="space-y-4">
              <div
                v-if="timeline.length === 0"
                class="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                No timeline data available
              </div>
              <div v-else class="relative">
                <div
                  class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
                ></div>
                <div
                  v-for="(event, index) in timeline"
                  :key="index"
                  class="relative pl-12 pb-8 last:pb-0"
                >
                  <div
                    :class="[
                      'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center',
                      getTimelineColor(event.status),
                    ]"
                  >
                    <svg
                      class="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-semibold text-gray-900 dark:text-white">
                          {{ formatStatus(event.status) }}
                        </h5>
                        <p
                          class="text-sm text-gray-600 dark:text-gray-400 mt-1"
                        >
                          {{ event.message }}
                        </p>
                        <p
                          v-if="event.location"
                          class="text-xs text-gray-500 dark:text-gray-500 mt-1"
                        >
                          📍 {{ event.location }}
                        </p>
                      </div>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{
                        formatDateTime(event.timestamp)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tracking Tab -->
            <div v-else-if="activeTab === 'tracking'">
              <div v-if="!trackingData" class="text-center py-8">
                <button
                  @click="loadTracking"
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Load Tracking Information
                </button>
              </div>
              <div v-else class="space-y-6">
                <!-- Tracking Number -->
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Tracking Number
                  </p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ trackingData.trackingNumber }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Carrier: {{ trackingData.carrier }}
                  </p>
                </div>

                <!-- Current Location -->
                <div
                  v-if="trackingData.currentLocation"
                  class="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <h5 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Current Location
                  </h5>
                  <p class="text-gray-600 dark:text-gray-400">
                    📍 {{ trackingData.currentLocation.address }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Last updated: {{ formatDateTime(trackingData.lastUpdate) }}
                  </p>
                </div>

                <!-- Estimated Delivery -->
                <div class="grid grid-cols-2 gap-4">
                  <div
                    class="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Estimated Delivery
                    </p>
                    <p
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      {{ formatDate(trackingData.estimatedDelivery) }}
                    </p>
                  </div>
                  <div
                    class="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Progress
                    </p>
                    <div class="mt-2">
                      <div
                        class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
                      >
                        <div
                          class="bg-blue-600 h-2.5 rounded-full"
                          :style="{ width: `${trackingData.progress || 0}%` }"
                        ></div>
                      </div>
                      <p
                        class="text-sm font-semibold text-gray-900 dark:text-white mt-1"
                      >
                        {{ trackingData.progress || 0 }}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Tab -->
            <div v-else-if="activeTab === 'shipping'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 class="font-semibold text-gray-900 dark:text-white mb-3">
                    Shipping Address
                  </h5>
                  <div
                    class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2"
                  >
                    <p class="text-gray-900 dark:text-white">
                      {{ order.shippingInfo?.fullName }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{ order.shippingInfo?.address }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{ order.shippingInfo?.ward }},
                      {{ order.shippingInfo?.district }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      {{ order.shippingInfo?.province }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">
                      📞 {{ order.shippingInfo?.phoneNo }}
                    </p>
                  </div>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-900 dark:text-white mb-3">
                    Payment Information
                  </h5>
                  <div
                    class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2"
                  >
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Method:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white">{{
                        order.paymentInfo?.method
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Status:</span
                      >
                      <span
                        :class="
                          getPaymentStatusClass(order.paymentInfo?.status)
                        "
                      >
                        {{ formatPaymentStatus(order.paymentInfo?.status) }}
                      </span>
                    </div>
                    <div v-if="order.paidAt" class="flex justify-between">
                      <span class="text-gray-600 dark:text-gray-400"
                        >Paid At:</span
                      >
                      <span class="font-medium text-gray-900 dark:text-white">{{
                        formatDateTime(order.paidAt)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Admin Notes Tab -->
            <div v-else-if="activeTab === 'notes'">
              <div class="space-y-4">
                <div
                  v-for="note in order.adminNotes || []"
                  :key="note._id"
                  class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-400"
                >
                  <p class="text-gray-900 dark:text-white">{{ note.note }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    By {{ note.admin?.name }} •
                    {{ formatDateTime(note.createdAt) }}
                  </p>
                </div>
                <div
                  v-if="!order.adminNotes || order.adminNotes.length === 0"
                  class="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No admin notes yet
                </div>

                <!-- Add Note Form -->
                <div class="mt-6">
                  <textarea
                    v-model="newNote"
                    rows="3"
                    placeholder="Add admin note..."
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  ></textarea>
                  <button
                    @click="addNote"
                    :disabled="!newNote.trim()"
                    class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex gap-3">
            <select
              v-model="selectedStatus"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Change Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              @click="updateStatus"
              :disabled="!selectedStatus"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Status
            </button>
          </div>
          <div class="flex gap-3">
            <button
              v-if="['pending', 'confirmed'].includes(order.orderStatus)"
              @click="cancelOrder"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel Order
            </button>
            <button
              @click="$emit('close')"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderDetailApi } from "../../../service/order.service";
import {
  getOrderTrackingApi,
  getOrderTimelineApi,
} from "../../../service/order.service";
import {
  updateOrderStatusApi,
  adminCancelOrderApi,
  addAdminNotesApi,
} from "../../../service/admin.service";

export default {
  name: "OrderDetailModal",
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  emits: ["close", "updated"],
  data() {
    return {
      loading: false,
      activeTab: "items",
      tabs: [
        { id: "items", label: "Items" },
        { id: "timeline", label: "Timeline" },
        { id: "tracking", label: "Tracking" },
        { id: "shipping", label: "Shipping & Payment" },
        { id: "notes", label: "Admin Notes" },
      ],
      timeline: [],
      trackingData: null,
      selectedStatus: "",
      newNote: "",
    };
  },
  mounted() {
    this.loadTimeline();
  },
  methods: {
    async loadTimeline() {
      try {
        const response = await getOrderTimelineApi(this.order._id);
        this.timeline = response.timeline || [];
      } catch (err) {
        console.error("Failed to load timeline:", err);
      }
    },

    async loadTracking() {
      try {
        this.loading = true;
        const response = await getOrderTrackingApi(this.order._id);
        this.trackingData = response.tracking || null;
      } catch (err) {
        console.error("Failed to load tracking:", err);
        this.$toast?.error("Failed to load tracking information");
      } finally {
        this.loading = false;
      }
    },

    async updateStatus() {
      if (!this.selectedStatus) return;

      try {
        await updateOrderStatusApi(this.order._id, {
          status: this.selectedStatus,
        });
        this.$toast?.success("Order status updated successfully");
        this.selectedStatus = "";
        this.$emit("updated");
      } catch (err) {
        console.error("Failed to update status:", err);
        this.$toast?.error(
          err.response?.data?.message || "Failed to update status"
        );
      }
    },

    async cancelOrder() {
      const reason = prompt("Enter cancellation reason:");
      if (!reason) return;

      try {
        await adminCancelOrderApi(this.order._id, { reason });
        this.$toast?.success("Order cancelled successfully");
        this.$emit("updated");
      } catch (err) {
        console.error("Failed to cancel order:", err);
        this.$toast?.error(
          err.response?.data?.message || "Failed to cancel order"
        );
      }
    },

    async addNote() {
      if (!this.newNote.trim()) return;

      try {
        await addAdminNotesApi(this.order._id, { note: this.newNote });
        this.$toast?.success("Note added successfully");
        this.newNote = "";
        this.$emit("updated");
      } catch (err) {
        console.error("Failed to add note:", err);
        this.$toast?.error(err.response?.data?.message || "Failed to add note");
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatDateTime(date) {
      return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatStatus(status) {
      const statusMap = {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        shipped: "Shipped",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled",
        returned: "Returned",
      };
      return statusMap[status] || status;
    },

    formatPaymentStatus(status) {
      const statusMap = {
        pending: "Pending",
        paid: "Paid",
        failed: "Failed",
        refunded: "Refunded",
      };
      return statusMap[status] || status;
    },

    getTimelineColor(status) {
      const colors = {
        pending: "bg-yellow-500",
        confirmed: "bg-blue-500",
        preparing: "bg-purple-500",
        shipped: "bg-indigo-500",
        out_for_delivery: "bg-cyan-500",
        delivered: "bg-green-500",
        cancelled: "bg-red-500",
        returned: "bg-gray-500",
      };
      return colors[status] || "bg-gray-400";
    },

    getPaymentStatusClass(status) {
      const classes = {
        pending:
          "px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        paid: "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        failed:
          "px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        refunded:
          "px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      };
      return classes[status] || classes.pending;
    },
  },
};
</script>
